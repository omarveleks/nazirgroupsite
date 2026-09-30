// Renders the downloadable PDFs from the build-only /print/ pages with Chromium, so they use
// the website's own fonts, colours and photos. Outputs are committed to public/downloads/.
// Run after data or copy changes: npm run pdfs
import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root = path.resolve(fileURLToPath(new URL('..', import.meta.url)));
const out = path.join(root, 'public', 'downloads');
const port = 4391;
fs.mkdirSync(out, { recursive: true });
const server = spawn(process.execPath, [path.join(root, 'scripts/serve.mjs')], { env: { ...process.env, PORT: String(port) }, stdio: 'ignore' });
await new Promise((r) => setTimeout(r, 800));

const docs = [
  { url: '/print/profile/', file: 'nazir-company-profile.pdf', title: 'Company Profile', fixed: true },
  { url: '/print/capability/', file: 'nazir-capability-statement.pdf', title: 'Capability Statement', fixed: true },
  { url: '/print/project-list/', file: 'nazir-project-list.pdf', title: 'Project List', fixed: false },
];
const browser = await chromium.launch();
let failed = false;
try {
  for (const d of docs) {
    const page = await browser.newPage({ viewport: { width: 794, height: 1123 } });
    await page.emulateMedia({ media: 'print' });
    await page.goto(`http://localhost:${port}${d.url}`, { waitUntil: 'networkidle' });
    await page.evaluate(async () => {
      await document.fonts.ready;
      await Promise.all([...document.images].map((i) => (i.complete ? null : new Promise((r) => (i.onload = i.onerror = r)))));
    });
    if (d.fixed) {
      // every fixed A4 page must hold its content
      const over = await page.evaluate(() =>
        [...document.querySelectorAll('.page')].flatMap((pg, i) => {
          const box = pg.getBoundingClientRect();
          const foot = pg.querySelector('.pfoot')?.getBoundingClientRect();
          const limit = foot ? foot.top - 2 : box.bottom;
          const bad = [...pg.querySelectorAll('.pad *, .on-photo *, .cs-pad *')].filter((el) => {
            const r = el.getBoundingClientRect();
            return r.height > 0 && r.bottom > limit + 0.5;
          });
          return bad.length ? [`page ${i + 1}: ${bad.length} elements run past the page (${bad[0].tagName}.${bad[0].className})`] : [];
        }),
      );
      if (over.length) {
        failed = true;
        console.error(`${d.file}:\n  ${over.join('\n  ')}`);
      }
    }
    await page.pdf({
      path: path.join(out, d.file),
      format: 'A4',
      printBackground: true,
      preferCSSPageSize: true,
      displayHeaderFooter: !d.fixed,
      headerTemplate: '<span></span>',
      footerTemplate: d.fixed
        ? '<span></span>'
        : `<div style="width:100%;margin:0 16mm;display:flex;justify-content:space-between;font-family:Arial,sans-serif;font-size:7px;letter-spacing:.04em;color:#5f6b77;border-top:0.5px solid #e3e6ea;padding-top:6px"><span>Nazir and Company (Pvt) Ltd  ·  ${d.title}</span><span><span class="pageNumber"></span> / <span class="totalPages"></span></span></div>`,
    });
    await page.close();
    console.log(`${d.file}: ${Math.round(fs.statSync(path.join(out, d.file)).size / 1024)} KB`);
  }
} finally {
  await browser.close();
  server.kill();
}
if (failed) process.exit(1);
