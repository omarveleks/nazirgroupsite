// Static checks on the built site (dist/). Each check returns { name, pass, details[] }.
import fs from 'node:fs';
import path from 'node:path';
import { parse } from 'node-html-parser';

export function listHtml(dist) {
  const out = [];
  const walk = (d) => {
    for (const e of fs.readdirSync(d, { withFileTypes: true })) {
      const p = path.join(d, e.name);
      if (e.isDirectory()) walk(p);
      else if (e.name.endsWith('.html')) out.push(p);
    }
  };
  walk(dist);
  return out.sort();
}

export function urlOf(dist, file) {
  const rel = '/' + path.relative(dist, file).split(path.sep).join('/');
  if (rel === '/404.html') return '/404.html';
  return rel.replace(/index\.html$/, '');
}

/** Visible text of a page (tags replaced by spaces; scripts and styles dropped). */
export function visibleText(root) {
  const body = (root.querySelector('body') ?? root).toString();
  return body
    .replace(/<(script|style|noscript)[\s\S]*?<\/\1>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;|&#160;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;|&#34;/g, '"')
    .replace(/&#39;|&#x27;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

function resolveTarget(dist, href) {
  const u = new URL(href, 'http://x');
  let p = decodeURIComponent(u.pathname);
  const candidates = p.endsWith('/') ? [path.join(dist, p, 'index.html')] : [path.join(dist, p), path.join(dist, p, 'index.html')];
  return { file: candidates.find((c) => fs.existsSync(c) && fs.statSync(c).isFile()) ?? null, hash: u.hash.slice(1) };
}

export function runContentChecks(dist, mode) {
  const files = listHtml(dist);
  const pages = files.map((f) => {
    const html = fs.readFileSync(f, 'utf8');
    const root = parse(html);
    return { file: f, url: urlOf(dist, f), html, root, text: visibleText(root) };
  });
  const results = [];
  const check = (name, fn) => {
    const details = [];
    fn(details);
    results.push({ name, pass: details.length === 0, details: details.slice(0, 40), count: details.length });
  };

  check('Forbidden terms (Nazcon, NTN, tax number, yahoo address, source file names)', (d) => {
    const bad = [/nazcon/i, /\bNTN\b/, /national tax/i, /0684006/, /yahoo/i, /Nazir_and_Sons|Second_profile/i, /\bnaz(im)?nazirco\b/i];
    for (const p of pages) for (const re of bad) if (re.test(p.html)) d.push(`${p.url}: matches ${re}`);
  });

  check('No first-person voice ("we", "our", "us") in page text', (d) => {
    for (const p of pages) {
      const m = p.text.match(/\b(we|our|ours|us)\b/gi);
      if (m) {
        const i = p.text.search(/\b(we|our|ours|us)\b/i);
        d.push(`${p.url}: "${p.text.slice(Math.max(0, i - 40), i + 40)}"`);
      }
    }
  });

  check('No contract values rendered', (d) => {
    const re = /\b(Rs\.?|SR|LD|USD|MR)\s?\d[\d,.]*\s*(million|thousand)?/g;
    for (const p of pages) {
      // The PKHA enlistment limit (Rs 1,000 million) is a registration category, not a contract value
      const t = p.text.replace(/Rs 1,000 million/g, '');
      const m = t.match(re);
      if (m) d.push(`${p.url}: ${m.slice(0, 3).join(' | ')}`);
      if (/\bmillion\b/i.test(t)) d.push(`${p.url}: contains "million"`);
    }
  });

  check('No expiry or validity dates near PEC', (d) => {
    for (const p of pages) {
      const re = /(Pakistan Engineering Council|\bPEC\b)/g;
      let m;
      while ((m = re.exec(p.text))) {
        const after = p.text.slice(m.index, m.index + 120);
        if (/(valid|validity|expir|renew|\b\d{1,2}[\/.\-]\d{1,2}[\/.\-]\d{2,4}\b|\b\d{1,2} (January|February|March|April|May|June|July|August|September|October|November|December) \d{4})/i.test(after)) {
          d.push(`${p.url}: "${after}"`);
        }
      }
    }
  });

  check('No empty contact links (tel:, mailto:, WhatsApp)', (d) => {
    for (const p of pages) {
      for (const a of p.root.querySelectorAll('a[href]')) {
        const h = a.getAttribute('href');
        if (/^(tel:|mailto:)\s*$/.test(h) || /^https:\/\/wa\.me\/?$/.test(h)) d.push(`${p.url}: ${h}`);
        if (/^(tel|mailto):/.test(h) && !a.text.trim()) d.push(`${p.url}: empty label for ${h}`);
      }
      if (/(Tel|Email|WhatsApp)\s*<\/span>\s*<\/li>/.test(p.html)) d.push(`${p.url}: contact label without value`);
    }
  });

  check('Every internal link and anchor resolves', (d) => {
    const idCache = new Map();
    const ids = (file) => {
      if (!idCache.has(file)) {
        const r = parse(fs.readFileSync(file, 'utf8'));
        idCache.set(file, new Set(r.querySelectorAll('[id]').map((n) => n.getAttribute('id'))));
      }
      return idCache.get(file);
    };
    for (const p of pages) {
      for (const el of p.root.querySelectorAll('a[href], link[href], script[src], img[src], source[srcset]')) {
        const h = el.getAttribute('href') ?? el.getAttribute('src') ?? (el.getAttribute('srcset') ?? '').split(' ')[0];
        if (!h || /^(https?:|mailto:|tel:|data:)/.test(h)) continue;
        if (h.startsWith('#')) {
          if (h.length > 1 && !ids(p.file).has(h.slice(1))) d.push(`${p.url}: missing anchor ${h}`);
          continue;
        }
        if (h.startsWith('/api/')) continue;
        const { file, hash } = resolveTarget(dist, new URL(h, 'http://x' + p.url).pathname + (h.includes('#') ? '#' + h.split('#')[1] : ''));
        if (!file) d.push(`${p.url}: broken ${h}`);
        else if (hash && file.endsWith('.html') && !ids(file).has(hash)) d.push(`${p.url}: missing anchor ${h}`);
      }
    }
  });

  check('Images have alt text and dimensions; SVG images have accessible names', (d) => {
    for (const p of pages) {
      for (const img of p.root.querySelectorAll('img')) {
        if (!img.hasAttribute('alt')) d.push(`${p.url}: img without alt ${img.getAttribute('src')}`);
        if (!img.getAttribute('width') || !img.getAttribute('height')) d.push(`${p.url}: img without width/height ${img.getAttribute('src')}`);
      }
      for (const svg of p.root.querySelectorAll('svg')) {
        const role = svg.getAttribute('role');
        const hidden = svg.getAttribute('aria-hidden') === 'true';
        if (role === 'img' && !svg.getAttribute('aria-label') && !svg.getAttribute('aria-labelledby')) d.push(`${p.url}: svg role=img without name`);
        if (!hidden && role !== 'img') d.push(`${p.url}: svg neither aria-hidden nor role=img`);
        if (!svg.getAttribute('width') || !svg.getAttribute('height') || !svg.getAttribute('viewBox')) d.push(`${p.url}: svg without width/height/viewBox`);
      }
    }
  });

  check('Every project has a source and a page', (d) => {
    const projects = JSON.parse(fs.readFileSync(path.resolve(dist, '../src/data/projects.json'), 'utf8'));
    for (const pr of projects) {
      if (!pr.source?.pdf || !pr.source?.page) d.push(`${pr.slug}: no source`);
      const f = path.join(dist, 'projects', pr.country_slug, pr.slug, 'index.html');
      if (!fs.existsSync(f)) d.push(`${pr.slug}: no page`);
      else if (!/Source/.test(fs.readFileSync(f, 'utf8'))) d.push(`${pr.slug}: page shows no source`);
    }
  });

  check('Page metadata: title, description, canonical, lang, one h1', (d) => {
    const titles = new Map();
    for (const p of pages) {
      const t = p.root.querySelector('title')?.text?.trim();
      const desc = p.root.querySelector('meta[name="description"]')?.getAttribute('content');
      const canon = p.root.querySelector('link[rel="canonical"]')?.getAttribute('href');
      if (!t) d.push(`${p.url}: no title`);
      if (!desc || desc.length < 50) d.push(`${p.url}: description missing or short`);
      if (desc && desc.length > 320) d.push(`${p.url}: description too long (${desc.length})`);
      if (!canon) d.push(`${p.url}: no canonical`);
      if (p.root.querySelector('html')?.getAttribute('lang') !== 'en-GB') d.push(`${p.url}: lang not en-GB`);
      const h1 = p.root.querySelectorAll('h1').length;
      if (h1 !== 1) d.push(`${p.url}: ${h1} h1 elements`);
      if (t) titles.set(t, (titles.get(t) ?? []).concat(p.url));
    }
    for (const [t, urls] of titles) if (urls.length > 1) d.push(`duplicate title "${t}": ${urls.join(', ')}`);
  });

  check('JSON-LD parses and has @context and @type', (d) => {
    for (const p of pages) {
      for (const s of p.root.querySelectorAll('script[type="application/ld+json"]')) {
        try {
          const j = JSON.parse(s.text);
          if (j['@context'] !== 'https://schema.org' || !j['@type']) d.push(`${p.url}: JSON-LD missing @context/@type`);
          if (j['@type'] === 'BreadcrumbList' && !(j.itemListElement?.length >= 2)) d.push(`${p.url}: short breadcrumb list`);
        } catch (e) {
          d.push(`${p.url}: invalid JSON-LD (${e.message})`);
        }
      }
      if (p.url === '/') {
        const types = p.root.querySelectorAll('script[type="application/ld+json"]').map((s) => JSON.parse(s.text)['@type']);
        for (const t of ['Organization', 'LocalBusiness']) if (!types.includes(t)) d.push(`/: no ${t} JSON-LD`);
      }
    }
  });

  check(`Mode "${mode}" indexing controls`, (d) => {
    const robots = fs.readFileSync(path.join(dist, 'robots.txt'), 'utf8');
    const headers = fs.readFileSync(path.join(dist, '_headers'), 'utf8');
    const sitemap = fs.existsSync(path.join(dist, 'sitemap.xml'));
    for (const p of pages) {
      const r = p.root.querySelector('meta[name="robots"]')?.getAttribute('content') ?? '';
      const special = ['/404.html', '/contact/thanks/', '/contact/error/'].includes(p.url);
      if (mode === 'review' && r !== 'noindex, nofollow') d.push(`${p.url}: robots meta "${r}"`);
      if (mode === 'live' && !special && !/^index/.test(r)) d.push(`${p.url}: robots meta "${r}" in live mode`);
    }
    if (mode === 'review') {
      if (!/Disallow: \/\s*$/m.test(robots)) d.push('robots.txt does not disallow all');
      if (!/X-Robots-Tag: noindex, nofollow/.test(headers)) d.push('_headers lacks X-Robots-Tag');
      if (sitemap) d.push('sitemap.xml present in review mode');
    } else {
      if (/Disallow: \//.test(robots)) d.push('robots.txt disallows in live mode');
      if (/X-Robots-Tag/.test(headers)) d.push('_headers has X-Robots-Tag in live mode');
      if (!sitemap) d.push('sitemap.xml missing in live mode');
    }
  });

  check('Security headers present in _headers', (d) => {
    const h = fs.readFileSync(path.join(dist, '_headers'), 'utf8');
    for (const k of ['Content-Security-Policy', 'Strict-Transport-Security', 'X-Content-Type-Options', 'Referrer-Policy', 'Permissions-Policy']) {
      if (!h.includes(k + ':')) d.push(`missing ${k}`);
    }
    for (const p of pages) if (/\sstyle="/.test(p.html)) d.push(`${p.url}: inline style attribute (blocked by CSP)`);
    for (const p of pages) {
      for (const s of p.root.querySelectorAll('script')) {
        const t = s.getAttribute('type');
        if (!s.getAttribute('src') && t !== 'application/ld+json') d.push(`${p.url}: inline script (blocked by CSP)`);
      }
    }
  });

  check('Internal records are not published (image credits, source PDFs)', (d) => {
    const walk = (dir) => fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? walk(path.join(dir, e.name)) : [path.join(dir, e.name)]));
    for (const f of walk(dist)) {
      const b = path.basename(f);
      if (/image-credits|facts\.md|OPEN_ITEMS|profile\.pdf/i.test(b)) d.push(`published: ${path.relative(dist, f)}`);
    }
    for (const p of pages) if (/image-credits/.test(p.html)) d.push(`${p.url}: links image-credits`);
  });

  check('Contact form: 16 px inputs, types, autocomplete, not-connected notice', (d) => {
    const p = pages.find((x) => x.url === '/contact/');
    if (!p) return d.push('no /contact/ page');
    const need = [
      ['#email', 'type', 'email'],
      ['#email', 'autocomplete', 'email'],
      ['#email', 'inputmode', 'email'],
      ['#phone', 'type', 'tel'],
      ['#phone', 'autocomplete', 'tel'],
      ['#phone', 'inputmode', 'tel'],
      ['#name', 'autocomplete', 'name'],
    ];
    for (const [sel, attr, val] of need) if (p.root.querySelector(sel)?.getAttribute(attr) !== val) d.push(`${sel} ${attr} != ${val}`);
    const types = p.root.querySelectorAll('#type option').map((o) => o.text.trim());
    for (const t of ['Client', 'Main contractor subcontract enquiry', 'Partnership', 'Careers', 'Other']) if (!types.includes(t)) d.push(`type option missing: ${t}`);
    if (process.env.PUBLIC_FORM_ENABLED !== 'true' && !/Form not yet connected/.test(p.text)) d.push('no "Form not yet connected" notice');
    if (p.root.querySelector('form')?.getAttribute('action') !== '/api/contact') d.push('form action is not /api/contact');
  });

  check('Font subset covers every character shown (fonts are subset and inlined)', (d) => {
    const ok = (c) =>
      (c >= 0x20 && c <= 0x7e) || [0xa0, 0xa9, 0xb1, 0xb7, 0x2013, 0x2014, 0x2018, 0x2019, 0x201a, 0x201b, 0x201c, 0x201d, 0x2026, 0x203a].includes(c);
    const seen = new Map();
    for (const p of pages) {
      const extra = p.root.querySelectorAll('[placeholder], svg text').map((n) => n.getAttribute('placeholder') ?? n.text).join(' ');
      for (const ch of p.text + extra) {
        const c = ch.codePointAt(0);
        if (!ok(c) && !seen.has(ch)) seen.set(ch, p.url);
      }
    }
    for (const [ch, u] of seen) d.push(`U+${ch.codePointAt(0).toString(16).toUpperCase().padStart(4, '0')} "${ch}" first on ${u}: add to scripts/fonts.py and re-run it`);
  });

  return { results, pages: pages.map((p) => p.url) };
}
