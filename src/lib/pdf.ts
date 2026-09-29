/**
 * Build-time PDF generation (pdf-lib, standard fonts). Both documents are
 * produced from the same data files as the site, so they never drift.
 */
import { PDFDocument, StandardFonts, rgb, type PDFFont, type PDFPage } from 'pdf-lib';
import { ROOF_PATH, WORD_OFFSET, WORD_PATH } from './logo';
import { services } from './services';
import {
  company,
  contact,
  countries,
  projects,
  stats,
  byNewest,
  fmtKv,
  fmtKm,
  yearText,
  range,
  projectBySlug,
  type Project,
} from './data';

const NAVY = rgb(11 / 255, 31 / 255, 58 / 255);
const MUTED = rgb(91 / 255, 103 / 255, 115 / 255);
const AMBER = rgb(224 / 255, 161 / 255, 0);
const RULE = rgb(201 / 255, 194 / 255, 178 / 255);
const A4: [number, number] = [595.28, 841.89];
const M = 42;


interface Fonts {
  reg: PDFFont;
  bold: PDFFont;
  mono: PDFFont;
}

async function setup(title: string) {
  const doc = await PDFDocument.create();
  doc.setTitle(title);
  doc.setAuthor(company.name);
  doc.setSubject(title);
  doc.setCreator('nazir website build');
  doc.setProducer('pdf-lib');
  doc.setLanguage('en-GB');
  const fonts: Fonts = {
    reg: await doc.embedFont(StandardFonts.Helvetica),
    bold: await doc.embedFont(StandardFonts.HelveticaBold),
    mono: await doc.embedFont(StandardFonts.Courier),
  };
  return { doc, fonts };
}

/** Replace characters the standard fonts cannot encode. */
function safe(font: PDFFont, s: string): string {
  const map: Record<string, string> = { ' ': ' ', '−': '-', '→': '->' };
  let out = '';
  for (const ch of s) {
    const c = map[ch] ?? ch;
    try {
      font.encodeText(c);
      out += c;
    } catch {
      out += '?';
    }
  }
  return out;
}

function wrap(font: PDFFont, size: number, text: string, width: number): string[] {
  const words = safe(font, text).split(/\s+/);
  const lines: string[] = [];
  let line = '';
  for (const w of words) {
    const t = line ? `${line} ${w}` : w;
    if (font.widthOfTextAtSize(t, size) <= width) line = t;
    else {
      if (line) lines.push(line);
      line = w;
    }
  }
  if (line) lines.push(line);
  return lines;
}

function logo(page: PDFPage, x: number, yTop: number, h: number) {
  const scale = h / 94;
  page.drawSvgPath(ROOF_PATH, { x, y: yTop, scale, borderColor: NAVY, borderWidth: 4 * scale });
  page.drawSvgPath(WORD_PATH, { x: x + WORD_OFFSET.x * scale, y: yTop - WORD_OFFSET.y * scale, scale, color: NAVY, borderWidth: 0 });
}

function text(page: PDFPage, s: string, x: number, y: number, size: number, font: PDFFont, color = NAVY) {
  page.drawText(safe(font, s), { x, y, size, font, color });
}

export async function projectListPdf(): Promise<Uint8Array> {
  const { doc, fonts: f } = await setup('Nazir and Company: project list');
  const cols = [
    { k: 'Year', w: 56 },
    { k: 'Project', w: 208 },
    { k: 'Client', w: 152 },
    { k: 'kV', w: 44, right: true },
    { k: 'km', w: 51, right: true },
  ];
  const size = 8.2;
  const lh = 10.2;
  let page!: PDFPage;
  let y = 0;
  const pages: PDFPage[] = [];

  const newPage = (first = false) => {
    page = doc.addPage(A4);
    pages.push(page);
    y = A4[1] - M;
    if (first) {
      logo(page, M, y, 44);
      text(page, company.name, M + 108, y - 16, 14, f.bold);
      text(page, 'Project list', M + 108, y - 33, 11, f.reg, MUTED);
      y -= 64;
      const intro = `${stats.projects} documented projects in ${stats.countries} countries, completed ${stats.firstYear}-${stats.lastYear}, taken from the company's records. Newest first within each country. Contract values are not listed.`;
      for (const l of wrap(f.reg, 9, intro, A4[0] - 2 * M)) {
        text(page, l, M, y, 9, f.reg, MUTED);
        y -= 12;
      }
      y -= 6;
    } else {
      text(page, `${company.name}  ·  Project list`, M, y - 8, 8, f.reg, MUTED);
      y -= 22;
    }
  };

  const header = () => {
    let x = M;
    for (const c of cols) {
      const tw = f.mono.widthOfTextAtSize(c.k.toUpperCase(), 7);
      text(page, c.k.toUpperCase(), c.right ? x + c.w - tw - 4 : x, y, 7, f.mono, MUTED);
      x += c.w;
    }
    y -= 5;
    page.drawLine({ start: { x: M, y }, end: { x: A4[0] - M, y }, thickness: 0.8, color: NAVY });
    y -= lh;
  };

  newPage(true);
  for (const c of countries) {
    if (y < M + 80) newPage();
    page.drawRectangle({ x: M, y: y - 4, width: 3, height: 16, color: AMBER });
    text(page, `${c.name}`, M + 9, y, 12, f.bold);
    const sub = `${c.count} ${c.count === 1 ? 'project' : 'projects'}${range(c) ? `, ${range(c)}` : ''}`;
    text(page, sub, M + 9 + f.bold.widthOfTextAtSize(c.name, 12) + 8, y, 9, f.reg, MUTED);
    y -= 18;
    header();
    for (const p of [...c.projects].sort(byNewest)) {
      const cells = [
        [yearText(p) === 'Not stated' ? '-' : yearText(p)],
        wrap(f.bold, size, p.name, cols[1]!.w - 10),
        wrap(f.reg, size, p.client, cols[2]!.w - 8),
        [fmtKv(p.voltage_kv, p).replace(' kV DC', ' DC').replace(' kV', '') || '-'],
        [fmtKm(p.length_km).replace(' km', '') || '-'],
      ];
      const n = Math.max(...cells.map((l) => l.length));
      if (y - n * lh < M + 20) {
        newPage();
        header();
      }
      let x = M;
      cells.forEach((lines, i) => {
        const col = cols[i]!;
        const font = i === 1 ? f.bold : i === 0 || i >= 3 ? f.mono : f.reg;
        lines.forEach((l, j) => {
          const tw = font.widthOfTextAtSize(safe(font, l), size);
          text(page, l, col.right ? x + col.w - tw - 4 : x, y - j * lh, size, font, i === 2 ? MUTED : NAVY);
        });
        x += col.w;
      });
      const yb = y - (n - 1) * lh - 4;
      page.drawLine({ start: { x: M, y: yb }, end: { x: A4[0] - M, y: yb }, thickness: 0.4, color: RULE });
      y = yb - lh + 1;
    }
    y -= 12;
  }
  pages.forEach((pg, i) => {
    const t = `Page ${i + 1} of ${pages.length}`;
    pg.drawText(t, { x: A4[0] - M - f.reg.widthOfTextAtSize(t, 8), y: M - 18, size: 8, font: f.reg, color: MUTED });
    pg.drawText(safe(f.reg, company.pec.statement), { x: M, y: M - 18, size: 8, font: f.reg, color: MUTED });
  });
  return doc.save({ useObjectStreams: true });
}

export async function capabilityPdf(): Promise<Uint8Array> {
  const { doc, fonts: f } = await setup('Nazir and Company: capability statement');
  const page = doc.addPage(A4);
  const W = A4[0] - 2 * M;
  let y = A4[1] - M;
  logo(page, M, y, 44);
  text(page, company.name, M + 108, y - 16, 15, f.bold);
  text(page, 'Capability statement', M + 108, y - 34, 11, f.reg, MUTED);
  y -= 62;
  page.drawLine({ start: { x: M, y }, end: { x: A4[0] - M, y }, thickness: 1, color: NAVY });
  y -= 16;

  const para = (s: string, size = 9.5, font = f.reg, color = NAVY, width = W, x = M) => {
    for (const l of wrap(font, size, s, width)) {
      text(page, l, x, y, size, font, color);
      y -= size * 1.35;
    }
  };
  const h = (s: string) => {
    y -= 4;
    text(page, s.toUpperCase(), M, y, 8, f.mono, MUTED);
    y -= 13;
  };

  para(
    `Electrical and civil engineering contractor, Lahore. Founded ${company.founded}; incorporated ${company.incorporated_text}. ${company.pec.statement}; the first licence holder of the Pakistan Engineering Council.`,
    10.5,
  );
  y -= 6;

  // key figures
  const figs: [string, string][] = [
    [String(stats.founded), 'founded'],
    [String(stats.projects), 'projects documented'],
    [String(stats.countries), 'countries'],
    [`${stats.firstYear}-${stats.lastYear}`, 'documented record'],
  ];
  const fw = W / figs.length;
  figs.forEach(([n, l], i) => {
    const x = M + i * fw;
    page.drawRectangle({ x, y: y - 30, width: fw - 6, height: 40, borderColor: NAVY, borderWidth: 0.8 });
    text(page, n, x + 8, y - 8, 15, f.mono);
    text(page, l, x + 8, y - 23, 8, f.reg, MUTED);
  });
  y -= 48;

  h('Services, with documented projects');
  const svc: [string, (p: Project) => boolean][] = services.filter((x) => x.id !== 'maintenance').map((x) => [x.title, x.match]);
  const colW = W / 2;
  svc.forEach(([label, fn], i) => {
    const x = M + (i % 2) * colW;
    const yy = y - Math.floor(i / 2) * 13;
    text(page, `${projects.filter(fn).length}`.padStart(3, ' '), x, yy, 9, f.mono);
    text(page, label, x + 24, yy, 9, f.reg);
  });
  y -= Math.ceil(svc.length / 2) * 13 + 4;

  h('Projects by country');
  const line = countries.map((c) => `${c.name} ${c.count} (${range(c)})`).join('   ·   ');
  para(line, 9);

  h('Selected projects');
  for (const slug of company.home_selected) {
    const p = projectBySlug(slug);
    const meta = [p.country, yearText(p), fmtKv(p.voltage_kv, p), fmtKm(p.length_km)].filter(Boolean).join(' · ');
    text(page, p.name, M, y, 9, f.bold);
    y -= 11.5;
    para(`${p.client}  ·  ${meta}`, 8.5, f.reg, MUTED);
    y -= 2;
  }

  h('Libya');
  para(company.libya_status, 9.5, f.bold);

  h('Enlistments (year of letter or financial year covered)');
  for (const e of company.enlistments) {
    para(`${e.body}: ${e.detail} (${e.year})`, 8.5);
  }

  h('Resources');
  para('Engineers registered with the Pakistan Engineering Council are listed on the company licence. The company has access to a large fleet of construction and stringing equipment, and can mobilise it per project. Registration and enlistment documents are available on request.', 9);

  h('Office');
  const a = contact.address;
  const parts = [`${a.line1}, ${a.line2}, ${a.city}, ${a.country}`, ...contact.phones.map((p) => `Tel ${p}`), ...contact.emails];
  para(parts.join('  ·  '), 9);

  if (y < M) throw new Error('Capability statement overflows one page');
  page.drawText(safe(f.reg, "Generated from the company's project register: every figure is computed from the same data as the website."), {
    x: M,
    y: M - 18,
    size: 7,
    font: f.reg,
    color: MUTED,
  });
  return doc.save({ useObjectStreams: true });
}
