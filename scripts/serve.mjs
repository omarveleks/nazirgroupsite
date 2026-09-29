// Minimal static server for dist/ (preview and QA). Serves directory index.html,
// the custom 404 page, and applies headers from dist/_headers for "/*".
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import { fileURLToPath } from 'node:url';

const root = path.resolve(fileURLToPath(new URL('..', import.meta.url)), 'dist');
const port = Number(process.env.PORT || 4321);

const types = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.webmanifest': 'application/manifest+json',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
  '.pdf': 'application/pdf',
  '.xml': 'application/xml; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
  '.webp': 'image/webp',
  '.avif': 'image/avif',
  '.jpg': 'image/jpeg',
};

function globalHeaders() {
  const file = path.join(root, '_headers');
  if (!fs.existsSync(file)) return {};
  const out = {};
  let inGlobal = false;
  for (const line of fs.readFileSync(file, 'utf8').split('\n')) {
    if (!line.trim()) continue;
    if (!line.startsWith(' ') && !line.startsWith('\t')) {
      inGlobal = line.trim() === '/*';
      continue;
    }
    if (inGlobal) {
      const i = line.indexOf(':');
      out[line.slice(0, i).trim()] = line.slice(i + 1).trim();
    }
  }
  // HSTS is meaningless on plain http://localhost; the rest applies as in production
  delete out['Strict-Transport-Security'];
  return out;
}

const server = http.createServer((req, res) => {
  const url = new URL(req.url, 'http://localhost');
  let p = decodeURIComponent(url.pathname);
  if (p.startsWith('/api/')) {
    res.writeHead(503, { 'content-type': 'application/json' });
    res.end(JSON.stringify({ ok: false, error: 'Form not yet connected.' }));
    return;
  }
  let file = path.join(root, p);
  if (!file.startsWith(root)) {
    res.writeHead(403).end();
    return;
  }
  let status = 200;
  if (fs.existsSync(file) && fs.statSync(file).isDirectory()) file = path.join(file, 'index.html');
  if (!fs.existsSync(file)) {
    if (!p.endsWith('/') && !path.extname(p) && fs.existsSync(path.join(root, p, 'index.html'))) {
      res.writeHead(308, { location: p + '/' });
      res.end();
      return;
    }
    file = path.join(root, '404.html');
    status = 404;
  }
  const ext = path.extname(file);
  const headers = { ...globalHeaders(), 'content-type': types[ext] || 'application/octet-stream' };
  let body = fs.readFileSync(file);
  if (/gzip/.test(req.headers['accept-encoding'] || '') && /text|json|xml|svg|javascript|manifest/.test(headers['content-type'])) {
    body = zlib.gzipSync(body);
    headers['content-encoding'] = 'gzip';
  }
  if (/\/(assets|fonts)\//.test(file)) headers['cache-control'] = 'public, max-age=31536000, immutable';
  headers['content-length'] = body.length;
  res.writeHead(status, headers);
  res.end(req.method === 'HEAD' ? undefined : body);
});

server.listen(port, () => console.log(`Serving ${root} on http://localhost:${port}`));
