// Generates raster assets from the built site (run after a build, with the preview server):
// Open Graph image and favicon set. Outputs are committed to public/.
import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root = path.resolve(fileURLToPath(new URL('..', import.meta.url)));
const pub = path.join(root, 'public');
const port = 4390;
const server = spawn(process.execPath, [path.join(root, 'scripts/serve.mjs')], { env: { ...process.env, PORT: String(port) }, stdio: 'ignore' });
await new Promise((r) => setTimeout(r, 800));

const browser = await chromium.launch();
try {
  // Open Graph image (requires dist/og-card/, i.e. run before postbuild removes it: see npm run assets)
  const og = await browser.newPage({ viewport: { width: 1200, height: 630 } });
  await og.goto(`http://localhost:${port}/og-card/`, { waitUntil: 'networkidle' });
  await og.evaluate(() => document.fonts.ready);
  fs.mkdirSync(path.join(pub, 'og'), { recursive: true });
  await og.locator('.card').screenshot({ path: path.join(pub, 'og', 'nazir.png') });

  // Icons from the SVG
  const svg = fs.readFileSync(path.join(pub, 'icons', 'icon.svg'), 'utf8');
  const icon = await browser.newPage();
  for (const [name, size] of [['icon-192.png', 192], ['icon-512.png', 512], ['apple-touch-icon.png', 180], ['favicon-32.png', 32], ['favicon-16.png', 16]]) {
    await icon.setViewportSize({ width: size, height: size });
    await icon.setContent(`<html><body style="margin:0">${svg.replace('<svg ', `<svg width="${size}" height="${size}" `)}</body></html>`);
    await icon.screenshot({ path: path.join(pub, 'icons', name), clip: { x: 0, y: 0, width: size, height: size } });
  }
} finally {
  await browser.close();
  server.kill();
}

// favicon.ico containing the 16 and 32 px PNGs
const imgs = ['favicon-16.png', 'favicon-32.png'].map((n) => fs.readFileSync(path.join(pub, 'icons', n)));
const header = Buffer.alloc(6);
header.writeUInt16LE(0, 0);
header.writeUInt16LE(1, 2);
header.writeUInt16LE(imgs.length, 4);
let offset = 6 + 16 * imgs.length;
const dir = imgs.map((buf, i) => {
  const e = Buffer.alloc(16);
  const s = i === 0 ? 16 : 32;
  e.writeUInt8(s, 0);
  e.writeUInt8(s, 1);
  e.writeUInt8(0, 2);
  e.writeUInt8(0, 3);
  e.writeUInt16LE(1, 4);
  e.writeUInt16LE(32, 6);
  e.writeUInt32LE(buf.length, 8);
  e.writeUInt32LE(offset, 12);
  offset += buf.length;
  return e;
});
fs.writeFileSync(path.join(pub, 'favicon.ico'), Buffer.concat([header, ...dir, ...imgs]));
for (const n of ['favicon-16.png', 'favicon-32.png']) fs.rmSync(path.join(pub, 'icons', n));
console.log('assets written: og/nazir.png, icons/*, favicon.ico');
