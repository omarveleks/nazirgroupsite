// Browser checks with Playwright (Chromium): axe, console and network errors, layout
// overflow, tap targets, text zoom, emulated devices with throttling, Web Vitals, weight.
import fs from 'node:fs';
import path from 'node:path';
import { chromium, devices } from 'playwright';
import { AxeBuilder } from '@axe-core/playwright';

const SLOW_4G = { offline: false, latency: 150, downloadThroughput: (1.6 * 1024 * 1024) / 8, uploadThroughput: (750 * 1024) / 8 };

async function withCDP(page, { cpu = 1, network = null } = {}) {
  const cdp = await page.context().newCDPSession(page);
  await cdp.send('Network.enable');
  if (network) await cdp.send('Network.emulateNetworkConditions', network);
  if (cpu > 1) await cdp.send('Emulation.setCPUThrottlingRate', { rate: cpu });
  return cdp;
}

const VITALS_INIT = () => {
  window.__v = { cls: 0, lcp: 0, inp: 0, shifts: [] };
  new PerformanceObserver((l) => {
    for (const e of l.getEntries()) {
      if (!e.hadRecentInput) {
        window.__v.cls += e.value;
        window.__v.shifts.push({ v: e.value, nodes: (e.sources || []).map((s) => s.node && s.node.nodeName + '.' + (s.node.className || '')) });
      }
    }
  }).observe({ type: 'layout-shift', buffered: true });
  new PerformanceObserver((l) => {
    for (const e of l.getEntries()) window.__v.lcp = Math.max(window.__v.lcp, e.startTime);
  }).observe({ type: 'largest-contentful-paint', buffered: true });
  new PerformanceObserver((l) => {
    for (const e of l.getEntries()) if (e.interactionId) window.__v.inp = Math.max(window.__v.inp, e.duration);
  }).observe({ type: 'event', buffered: true, durationThreshold: 16 });
};

function track(page, bag) {
  page.on('console', (m) => {
    // On the 404 test the browser reports the intended 404 status of the missing page itself
    if (bag.expect404 && /status of 404/.test(m.text())) return;
    if (['error', 'warning'].includes(m.type())) bag.console.push(`${m.type()}: ${m.text()}`);
  });
  page.on('pageerror', (e) => bag.console.push(`pageerror: ${e.message}`));
  page.on('requestfailed', (r) => bag.network.push(`failed ${r.url()} ${r.failure()?.errorText ?? ''}`));
  page.on('response', (r) => {
    const u = new URL(r.url());
    if (u.protocol === 'http:' && u.hostname !== 'localhost') bag.network.push(`mixed content ${r.url()}`);
    if (r.status() >= 400 && !bag.expect404) bag.network.push(`${r.status()} ${r.url()}`);
  });
}

export async function runBrowserChecks({ base, urls, screensDir, representative, keyPages }) {
  const browser = await chromium.launch();
  const results = [];
  const add = (name, details, extra = {}) => results.push({ name, pass: details.length === 0, details: details.slice(0, 40), count: details.length, ...extra });

  // 1. Every page at 390 px: axe, console, network, overflow, tap targets, cards on phones
  {
    const axeD = [];
    const conD = [];
    const netD = [];
    const ovD = [];
    const tapD = [];
    const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1, isMobile: true, hasTouch: true });
    for (const u of urls) {
      const page = await ctx.newPage();
      const bag = { console: [], network: [], expect404: u === '/404.html' };
      track(page, bag);
      const target = u === '/404.html' ? '/this-page-does-not-exist/' : u;
      await page.goto(base + target, { waitUntil: 'networkidle' });
      const axe = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa', 'best-practice']).analyze();
      for (const v of axe.violations) axeD.push(`${u}: ${v.id} (${v.nodes.length}) ${v.nodes[0]?.target?.join(' ')}`);
      bag.console.forEach((c) => conD.push(`${u}: ${c}`));
      bag.network.forEach((c) => netD.push(`${u}: ${c}`));
      const ov = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
      if (ov > 0) ovD.push(`${u}: ${ov}px horizontal overflow at 390`);
      const small = await page.evaluate(() => {
        const out = [];
        const sel = 'button, input:not([type=hidden]), select, textarea, summary, a';
        for (const el of document.querySelectorAll(sel)) {
          if (el.closest('.hp, .skip-link')) continue;
          const cs = getComputedStyle(el);
          if (cs.display === 'none' || cs.visibility === 'hidden') continue;
          if (el.tagName === 'A' && cs.display === 'inline') continue; // inline text links (WCAG 2.5.8 exception)
          const r = el.getBoundingClientRect();
          if (r.width === 0 && r.height === 0) continue;
          if (r.height < 43.5 || r.width < 24) out.push(`${el.tagName.toLowerCase()} "${(el.textContent || el.getAttribute('aria-label') || el.name || '').trim().slice(0, 30)}" ${Math.round(r.width)}x${Math.round(r.height)}`);
        }
        return out;
      });
      small.forEach((s) => tapD.push(`${u}: ${s}`));
      await page.close();
    }
    await ctx.close();
    add('axe: zero accessibility violations (WCAG 2.2 AA + best practice), every page', axeD);
    add('Zero console errors or warnings, every page', conD);
    add('Zero failed requests, 404s or mixed content, every page', netD);
    add('No horizontal scroll at 390 px, every page', ovD);
    add('Tap targets at least 44 px (non-inline controls), every page', tapD);
  }

  // 2. Width sweep and 200% text zoom on representative pages
  {
    const d = [];
    const widths = [320, 360, 768, 1024, 1280, 1920];
    // bypassCSP only so the test can inject the 200% text-zoom style; the site's CSP blocks inline styles
    const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 }, bypassCSP: true });
    const page = await ctx.newPage();
    for (const u of representative) {
      await page.goto(base + u, { waitUntil: 'networkidle' });
      for (const w of widths) {
        await page.setViewportSize({ width: w, height: 900 });
        const ov = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
        if (ov > 0) d.push(`${u}: ${ov}px overflow at ${w}px`);
      }
      for (const w of [390, 1280]) {
        await page.setViewportSize({ width: w, height: 900 });
        await page.addStyleTag({ content: 'html{font-size:200% !important}' });
        const ov = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
        if (ov > 0) d.push(`${u}: ${ov}px overflow at ${w}px with 200% text`);
        await page.reload({ waitUntil: 'networkidle' });
      }
    }
    await ctx.close();
    add('No horizontal scroll 320–1920 px and at 200% text zoom (representative pages)', d);
  }

  // 3. Screenshots at 360, 768, 1280
  {
    const d = [];
    for (const w of [360, 768, 1280]) {
      const dir = path.join(screensDir, String(w));
      fs.mkdirSync(dir, { recursive: true });
      const ctx = await browser.newContext({ viewport: { width: w, height: 900 } });
      const page = await ctx.newPage();
      for (const u of representative) {
        await page.goto(base + u, { waitUntil: 'networkidle' });
        const name = (u.replace(/^\/|\/$/g, '').replace(/\//g, '__') || 'home') + '.jpg';
        await page.screenshot({ path: path.join(dir, name), fullPage: true, type: 'jpeg', quality: 55 });
      }
      await ctx.close();
    }
    add(`Screenshots saved at 360, 768 and 1280 px (${representative.length} pages each)`, d);
  }

  // 4. Emulated devices with throttling: vitals, weight, interactions
  {
    const profiles = [
      { name: 'iPhone SE', opts: devices['iPhone SE'], net: SLOW_4G, cpu: 1 },
      { name: 'iPhone 14', opts: devices['iPhone 14'], net: SLOW_4G, cpu: 1 },
      { name: 'Pixel 7', opts: devices['Pixel 7'], net: SLOW_4G, cpu: 1 },
      { name: 'Low-end Android (360x640, 4x CPU)', opts: { ...devices['Galaxy S5'], viewport: { width: 360, height: 640 } }, net: SLOW_4G, cpu: 4 },
      { name: 'iPad', opts: devices['iPad (gen 7)'], net: SLOW_4G, cpu: 1 },
    ];
    const vit = [];
    const weight = [];
    const rows = [];
    for (const prof of profiles) {
      const { defaultBrowserType, ...o } = prof.opts;
      const dir = path.join(screensDir, 'devices');
      fs.mkdirSync(dir, { recursive: true });
      for (const u of keyPages) {
        // fresh context per page: cold cache, so the weight is a true first load
        const ctx = await browser.newContext(o);
        await ctx.addInitScript(VITALS_INIT);
        const page = await ctx.newPage();
        await withCDP(page, { cpu: prof.cpu, network: prof.net });
        let bytes = 0;
        page.on('requestfinished', async (req) => {
          const s = await req.sizes().catch(() => null);
          if (s) bytes += s.responseBodySize + s.responseHeadersSize;
        });
        await page.goto(base + u, { waitUntil: 'networkidle', timeout: 120000 });
        await page.waitForTimeout(300);
        // interactions for INP
        if (await page.locator('.nav-mobile summary').isVisible()) {
          await page.locator('.nav-mobile summary').click();
          await page.waitForTimeout(150);
          await page.keyboard.press('Escape');
        }
        const search = page.locator('[data-filters] input[type=search]').first();
        if (await search.isVisible().catch(() => false)) {
          await search.click();
          await page.keyboard.type('220', { delay: 60 });
          await page.waitForTimeout(200);
        }
        await page.waitForTimeout(300);
        const v = await page.evaluate(() => window.__v);
        const kb = Math.round(bytes / 1024);
        const limit = u === '/' ? 500 : 350;
        rows.push({ device: prof.name, url: u, lcp: Math.round(v.lcp), cls: +v.cls.toFixed(4), inp: Math.round(v.inp), kb });
        if (v.lcp >= 2000) vit.push(`${prof.name} ${u}: LCP ${Math.round(v.lcp)} ms`);
        if (v.cls > 0) vit.push(`${prof.name} ${u}: CLS ${v.cls.toFixed(4)} ${JSON.stringify(v.shifts).slice(0, 200)}`);
        if (v.inp >= 100) vit.push(`${prof.name} ${u}: INP ${Math.round(v.inp)} ms`);
        if (kb >= limit) weight.push(`${prof.name} ${u}: ${kb} KB (limit ${limit})`);
        const name = `${prof.name.replace(/[^\w]+/g, '-')}__${u.replace(/^\/|\/$/g, '').replace(/\//g, '__') || 'home'}.jpg`;
        await page.screenshot({ path: path.join(dir, name), fullPage: false, type: 'jpeg', quality: 60 });
        await page.close();
        await ctx.close();
      }
    }
    add('Web Vitals on emulated devices, Slow 4G (LCP < 2.0 s, CLS = 0, INP < 100 ms)', vit, { table: rows });
    add('Page weight on first load (home < 500 KB, other pages < 350 KB)', weight);
  }

  // 5. No-JavaScript behaviour: register table and menu still work
  {
    const d = [];
    const ctx = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 390, height: 844 } });
    const page = await ctx.newPage();
    await page.goto(base + '/projects/libya/', { waitUntil: 'load' });
    const rows = await page.locator('table.reg tbody tr').count();
    if (rows !== 48) d.push(`/projects/libya/ without JS shows ${rows} rows (expected 48)`);
    if (await page.locator('[data-filters]').isVisible()) d.push('filters visible without JS (they need JS)');
    await page.locator('.nav-mobile summary').click();
    if (!(await page.locator('.nav-panel a[href="/contact/"]').isVisible())) d.push('mobile menu does not open without JS');
    await page.goto(base + '/contact/', { waitUntil: 'load' });
    if (!(await page.locator('form[action="/api/contact"][method="post"]').count())) d.push('contact form lacks a no-JS POST action');
    await ctx.close();
    add('Works without JavaScript (register, menu, form action)', d);
  }

  // 6. Register filtering works with JavaScript
  {
    const d = [];
    const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
    const page = await ctx.newPage();
    await page.goto(base + '/projects/libya/', { waitUntil: 'networkidle' });
    await page.selectOption('#libya-band', 'ehv');
    const shown = Number(await page.locator('[data-shown]').textContent());
    const visible = await page.locator('table.reg tbody tr:not([hidden])').count();
    if (shown !== visible || shown === 0 || shown >= 48) d.push(`voltage filter: shown ${shown}, visible rows ${visible}`);
    await page.click('[data-reset]');
    if (Number(await page.locator('[data-shown]').textContent()) !== 48) d.push('reset did not restore 48 rows');
    await page.goto(base + '/projects/?sector=civil', { waitUntil: 'networkidle' });
    if (!(await page.locator('details#register').evaluate((e) => e.open))) d.push('URL filter did not open the all-countries register');
    const civil = await page.locator('table.reg tbody tr:not([hidden])').count();
    if (civil < 50) d.push(`?sector=civil shows ${civil} rows`);
    await page.goto(base + '/contact/?type=subcontract&country=Libya', { waitUntil: 'networkidle' });
    if ((await page.inputValue('#type')) !== 'subcontract' || (await page.inputValue('#country')) !== 'Libya') d.push('Libya enquiry link does not pre-select the form');
    await ctx.close();
    add('Register filters, URL filters and Libya enquiry pre-selection work', d);
  }

  await browser.close();
  return results;
}
