// Runs after `astro build`. Writes the mode-dependent files for Cloudflare Pages:
// _headers (security headers, review-mode noindex), robots.txt, sitemap.xml (live only)
// and _routes.json. SITE_MODE=review|live, PUBLIC_SITE_URL=https://...
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(fileURLToPath(new URL('..', import.meta.url)));
const dist = path.join(root, 'dist');
const mode = process.env.SITE_MODE === 'live' ? 'live' : 'review';
const site = (process.env.PUBLIC_SITE_URL || 'https://nazir-and-company.pages.dev').replace(/\/$/, '');
const turnstile = process.env.PUBLIC_FORM_ENABLED === 'true' && !!process.env.PUBLIC_TURNSTILE_SITE_KEY;

// Build-only page used to render the Open Graph image: never deployed
fs.rmSync(path.join(dist, 'og-card'), { recursive: true, force: true });

const csp = [
  "default-src 'self'",
  `script-src 'self' https://static.cloudflareinsights.com${turnstile ? ' https://challenges.cloudflare.com' : ''}`,
  "style-src 'self'",
  "img-src 'self' data:",
  "font-src 'self' data:",
  `connect-src 'self' https://cloudflareinsights.com${turnstile ? ' https://challenges.cloudflare.com' : ''}`,
  turnstile ? 'frame-src https://challenges.cloudflare.com' : "frame-src 'none'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  'upgrade-insecure-requests',
].join('; ');

const headers = [
  '/*',
  `  Content-Security-Policy: ${csp}`,
  '  Strict-Transport-Security: max-age=31536000; includeSubDomains',
  '  X-Content-Type-Options: nosniff',
  '  Referrer-Policy: strict-origin-when-cross-origin',
  '  Permissions-Policy: accelerometer=(), camera=(), geolocation=(), gyroscope=(), magnetometer=(), microphone=(), payment=(), usb=(), interest-cohort=()',
  '  X-Frame-Options: DENY',
  '  Cross-Origin-Opener-Policy: same-origin',
  ...(mode === 'review' ? ['  X-Robots-Tag: noindex, nofollow'] : []),
  '',
  '/assets/*',
  '  Cache-Control: public, max-age=31536000, immutable',
  '',
  '/downloads/*.pdf',
  '  Cache-Control: public, max-age=3600',
  '',
].join('\n');
fs.writeFileSync(path.join(dist, '_headers'), headers);

// robots.txt
const robots =
  mode === 'review'
    ? 'User-agent: *\nDisallow: /\n'
    : `User-agent: *\nAllow: /\n\nSitemap: ${site}/sitemap.xml\n`;
fs.writeFileSync(path.join(dist, 'robots.txt'), robots);

// sitemap.xml (live only)
const smPath = path.join(dist, 'sitemap.xml');
fs.rmSync(smPath, { force: true });
if (mode === 'live') {
  const skip = new Set(['/404/', '/contact/thanks/', '/contact/error/']);
  const urls = [];
  const walk = (dir) => {
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
      const p = path.join(dir, e.name);
      if (e.isDirectory()) walk(p);
      else if (e.name === 'index.html') {
        const rel = '/' + path.relative(dist, path.dirname(p)).split(path.sep).join('/');
        const u = rel === '/' ? '/' : rel + '/';
        if (!skip.has(u)) urls.push(u);
      }
    }
  };
  walk(dist);
  urls.sort();
  const today = new Date().toISOString().slice(0, 10);
  const body = urls.map((u) => `  <url><loc>${site}${u}</loc><lastmod>${today}</lastmod></url>`).join('\n');
  fs.writeFileSync(smPath, `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</urlset>\n`);
}

// Functions routing: review mode only invokes the contact function; live mode also runs
// the pages.dev -> domain redirect middleware on page requests.
const routes =
  mode === 'live'
    ? { version: 1, include: ['/*'], exclude: ['/assets/*', '/icons/*', '/og/*', '/favicon.ico'] }
    : { version: 1, include: ['/api/*'], exclude: [] };
fs.writeFileSync(path.join(dist, '_routes.json'), JSON.stringify(routes, null, 2) + '\n');

console.log(`postbuild: mode=${mode} site=${site} sitemap=${mode === 'live'}`);
