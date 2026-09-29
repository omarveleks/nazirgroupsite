// Lighthouse (mobile, simulated Slow 4G and 4x CPU) on key pages.
import fs from 'node:fs';
import path from 'node:path';
import lighthouse from 'lighthouse';
import * as chromeLauncher from 'chrome-launcher';
import { chromium } from 'playwright';

export async function runLighthouse({ base, pages, outDir }) {
  fs.mkdirSync(outDir, { recursive: true });
  const chrome = await chromeLauncher.launch({
    chromePath: process.env.CHROME_PATH || chromium.executablePath(),
    chromeFlags: ['--headless=new', '--no-sandbox', '--disable-gpu'],
  });
  const rows = [];
  const d = [];
  try {
    for (const u of pages) {
      const r = await lighthouse(base + u, { port: chrome.port, output: 'json', logLevel: 'error', formFactor: 'mobile' });
      const lhr = r.lhr;
      const cat = (k) => Math.round((lhr.categories[k]?.score ?? 0) * 100);
      const num = (k) => lhr.audits[k]?.numericValue ?? NaN;
      const row = {
        url: u,
        performance: cat('performance'),
        accessibility: cat('accessibility'),
        bestPractices: cat('best-practices'),
        seo: cat('seo'),
        lcp: Math.round(num('largest-contentful-paint')),
        cls: +num('cumulative-layout-shift').toFixed(4),
        tbt: Math.round(num('total-blocking-time')),
        kb: Math.round(num('total-byte-weight') / 1024),
      };
      rows.push(row);
      const limitKb = u === '/' ? 500 : 350;
      if (row.performance < 95) d.push(`${u}: performance ${row.performance}`);
      if (row.accessibility < 100) d.push(`${u}: accessibility ${row.accessibility}`);
      if (row.bestPractices < 95) d.push(`${u}: best practices ${row.bestPractices}`);
      if (row.seo < 100) d.push(`${u}: SEO ${row.seo}`);
      if (row.lcp >= 2000) d.push(`${u}: LCP ${row.lcp} ms`);
      if (row.cls > 0) d.push(`${u}: CLS ${row.cls}`);
      if (row.tbt >= 100) d.push(`${u}: TBT ${row.tbt} ms`);
      if (row.kb >= limitKb) d.push(`${u}: ${row.kb} KB`);
      for (const [k, a] of Object.entries(lhr.audits)) {
        if (a.score !== null && a.score < 1 && ['errors-in-console', 'inspector-issues'].includes(k)) d.push(`${u}: ${k} ${a.title}`);
      }
      const slug = u.replace(/^\/|\/$/g, '').replace(/\//g, '__') || 'home';
      fs.writeFileSync(path.join(outDir, `${slug}.json`), JSON.stringify({ url: u, categories: row, failing: Object.entries(lhr.audits).filter(([, a]) => a.score !== null && a.score < 0.9).map(([k, a]) => ({ k, title: a.title, score: a.score, display: a.displayValue })) }, null, 1));
    }
  } finally {
    await chrome.kill();
  }
  return { name: 'Lighthouse mobile (Perf ≥ 95, A11y 100, BP ≥ 95, SEO 100, LCP < 2 s, CLS 0, TBT < 100 ms)', pass: d.length === 0, details: d, count: d.length, table: rows };
}
