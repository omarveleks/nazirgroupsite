/**
 * Company profile PDF, generated at build time from the same data as the site
 * (projects.json, company.json, engineers.json, contact.json), so the figures
 * in the document always match the website.
 */
import fs from 'node:fs';
import path from 'node:path';
import { rgb, type PDFDocument, type PDFFont, type PDFImage, type PDFPage } from 'pdf-lib';
import { A4, BLUE, M, MUTED, NAVY, RULE, logo, safe, setup, wrap, type Fonts } from './pdf';
import { services } from './services';
import { milestones } from './milestones';
import { CAPABILITIES, MAX_AC_KV, PRESENCE_ORDER, countryMeta, numberWord } from './site';
import {
  company,
  contact,
  engineers,
  projects,
  stats,
  byNewest,
  clientsFor,
  country,
  fmtKm,
  fmtKv,
  fmtValue,
  projectBySlug,
  yearText,
  ROLE_LABEL,
  type Project,
} from './data';

const PAPER = rgb(246 / 255, 243 / 255, 236 / 255);
const PANEL = rgb(251 / 255, 249 / 255, 244 / 255);
const SKY = rgb(157 / 255, 187 / 255, 1); // light blue on ink
const W = A4[0] - 2 * M;
const TOP = A4[1] - M - 30; // below the running header
const BOTTOM = M + 16; // above the footer

interface ProfileFonts extends Fonts {
  serif: PDFFont;
}

function img(doc: PDFDocument, rel: string): Promise<PDFImage> {
  return doc.embedJpg(fs.readFileSync(path.join(process.cwd(), 'public', rel)));
}

class Writer {
  page!: PDFPage;
  y = 0;
  pages: PDFPage[] = [];
  constructor(
    private doc: PDFDocument,
    readonly f: ProfileFonts,
  ) {}

  newPage(section: string) {
    this.page = this.doc.addPage(A4);
    this.pages.push(this.page);
    const top = A4[1] - M;
    logo(this.page, M, top + 6, 18);
    this.t(section.toUpperCase(), A4[0] - M - this.f.light.widthOfTextAtSize(section.toUpperCase(), 7.5), top - 6, 7.5, this.f.light, MUTED);
    this.page.drawLine({ start: { x: M, y: top - 12 }, end: { x: A4[0] - M, y: top - 12 }, thickness: 0.6, color: NAVY });
    this.y = TOP;
  }

  t(s: string, x: number, y: number, size: number, font: PDFFont, color = NAVY) {
    this.page.drawText(safe(font, s), { x, y, size, font, color });
  }

  /** Start a new page if fewer than h points remain. */
  need(h: number, section: string) {
    if (this.y - h < BOTTOM) this.newPage(section);
  }

  h1(s: string, kicker?: string) {
    if (kicker) {
      this.t(kicker.toUpperCase(), M, this.y, 8, this.f.light, BLUE);
      this.y -= 22;
    }
    this.t(s, M, this.y, 24, this.f.serif);
    this.y -= 12;
    this.page.drawRectangle({ x: M, y: this.y, width: 36, height: 2.5, color: BLUE });
    this.y -= 22;
  }

  h2(s: string, section: string) {
    this.need(60, section);
    this.y -= 6;
    this.t(s, M, this.y, 13, this.f.serif);
    this.y -= 6;
    this.page.drawLine({ start: { x: M, y: this.y }, end: { x: A4[0] - M, y: this.y }, thickness: 0.5, color: RULE });
    this.y -= 15;
  }

  para(s: string, section: string, o: { size?: number; font?: PDFFont; color?: typeof NAVY; x?: number; width?: number; gap?: number } = {}) {
    const size = o.size ?? 9.5;
    const font = o.font ?? this.f.reg;
    const x = o.x ?? M;
    for (const l of wrap(font, size, s, o.width ?? W - (x - M))) {
      this.need(size * 1.4, section);
      this.t(l, x, this.y, size, font, o.color ?? NAVY);
      this.y -= size * 1.42;
    }
    this.y -= o.gap ?? 5;
  }

  bullets(items: string[], section: string, size = 9, x = M, width = W) {
    for (const it of items) {
      const lines = wrap(this.f.reg, size, it, width - 12);
      this.need(lines.length * size * 1.4, section);
      this.page.drawRectangle({ x, y: this.y + 2, width: 4, height: 4, color: BLUE });
      for (const l of lines) {
        this.t(l, x + 12, this.y, size, this.f.reg);
        this.y -= size * 1.42;
      }
      this.y -= 2.5;
    }
    this.y -= 4;
  }

  figures(figs: [string, string][], dark = false) {
    const fw = W / figs.length;
    const color = dark ? PAPER : NAVY;
    figs.forEach(([n, l], i) => {
      const x = M + i * fw;
      this.page.drawRectangle({ x, y: this.y - 40, width: fw - 8, height: 52, borderColor: color, borderWidth: 0.8 });
      this.page.drawLine({ start: { x: x + 8, y: this.y + 12 }, end: { x: x + 8, y: this.y + 6 }, thickness: 0.8, color: BLUE });
      this.t(n, x + 8, this.y - 12, 18, this.f.light, color);
      wrap(this.f.reg, 7.5, l, fw - 24).forEach((line, j) => this.t(line, x + 8, this.y - 26 - j * 9, 7.5, this.f.reg, dark ? PAPER : MUTED));
    });
    this.y -= 60;
  }

  photo(image: PDFImage, x: number, yTop: number, w: number, caption?: string) {
    const h = (w * image.height) / image.width;
    this.page.drawRectangle({ x: x - 3, y: yTop - h - 3, width: w + 6, height: h + 6, borderColor: NAVY, borderWidth: 0.6, color: PAPER });
    this.page.drawImage(image, { x, y: yTop - h, width: w, height: h });
    if (caption) {
      this.page.drawLine({ start: { x: x - 3, y: yTop - h - 3 }, end: { x: x + w + 3, y: yTop - h - 3 }, thickness: 0.6, color: NAVY });
      this.t(caption.toUpperCase(), x, yTop - h - 14, 6.5, this.f.light, MUTED);
    }
    return h + (caption ? 18 : 6);
  }
}

const FIGURES: [string, string][] = [
  [String(stats.founded), 'Founded in Lahore'],
  [String(stats.countries), 'Countries across Asia, the Middle East and Africa'],
  [`${MAX_AC_KV} kV`, 'Transmission capability, up to HVDC'],
  ['No. 1', 'Licence of the Pakistan Engineering Council'],
];

function meta(p: Project, withCountry = true): string {
  return [p.client, withCountry ? p.country : '', yearText(p) === 'Not stated' ? '' : yearText(p), fmtKv(p.voltage_kv, p), fmtKm(p.length_km), p.role !== 'unknown' ? ROLE_LABEL[p.role] : '']
    .filter(Boolean)
    .join('  ·  ');
}

function list(items: string[]): string {
  return items.length > 1 ? `${items.slice(0, -1).join(', ')} and ${items.at(-1)}` : (items[0] ?? '');
}

export async function companyProfilePdf(): Promise<Uint8Array> {
  const { doc, fonts } = await setup('Nazir and Company: company profile');
  // headlines are set light (never bold): Helvetica regular at display sizes
  const f: ProfileFonts = { ...fonts, serif: fonts.reg };
  const w = new Writer(doc, f);
  const libya = country('libya');

  // ---------- cover ----------
  {
    const page = doc.addPage(A4);
    w.page = page;
    page.drawRectangle({ x: 0, y: 0, width: A4[0], height: A4[1], color: NAVY });
    page.drawRectangle({ x: 0, y: 0, width: A4[0], height: 8, color: BLUE });
    let y = A4[1] - 70;
    logo(page, M, y, 64, PAPER);
    y -= 120;
    w.t('COMPANY PROFILE', M, y, 10, f.bold, SKY);
    y -= 38;
    w.t('Powering Nations Since ' + company.founded, M, y, 30, f.serif, PAPER);
    y -= 26;
    w.t(company.name, M, y, 12, f.reg, PAPER);
    y -= 30;
    const cover = await img(doc, 'images/photos/tower-sky-960.jpg');
    const h = (W * cover.height) / cover.width;
    page.drawImage(cover, { x: M, y: y - h, width: W, height: h });
    y -= h + 44;
    w.y = y;
    w.figures(
      FIGURES,
      true,
    );
    w.t(company.pec.statement, M, M + 14, 8.5, f.reg, PAPER);
    w.t(company.address, M, M, 8.5, f.reg, PAPER);
  }

  // ---------- the company ----------
  let S = 'The company';
  w.newPage(S);
  w.h1('Delivering the Infrastructure Nations Run On', 'About');
  w.para(
    `For more than six decades, ${company.name} has built the high-voltage networks, substations and civil infrastructure that power economies. From its headquarters in Lahore, the company delivers landmark projects for national utilities and energy leaders across Asia, the Middle East and Africa.`,
    S,
    { size: 11 },
  );
  w.para(
    `${company.founder.name} founded the company in ${company.founded}. It was incorporated as a private limited company on ${company.incorporated_text}, and holds Licence No. 1 of the Pakistan Engineering Council, the first the Council ever issued.`,
    S,
    { size: 11, gap: 14 },
  );
  w.figures(FIGURES);
  w.h2('Six Decades of Delivery', S);
  for (const m of milestones) {
    const lines = wrap(f.reg, 8.8, m.text, W - 70);
    w.need(11.5 + lines.length * 11, S);
    w.t(m.year, M, w.y, 9, f.light, BLUE);
    w.t(m.title, M + 70, w.y, 9.2, f.bold);
    w.y -= 11.5;
    for (const l of lines) {
      w.t(l, M + 70, w.y, 8.8, f.reg, MUTED);
      w.y -= 11;
    }
    w.y -= 2;
  }

  // ---------- leadership ----------
  S = 'Leadership';
  w.newPage(S);
  w.h1('Leadership and team', 'People');
  {
    const d = company.director;
    const pw = 118;
    const ph = w.photo(await img(doc, 'images/people/director-480.jpg'), M + 3, w.y, pw);
    const x = M + pw + 24;
    const top = w.y;
    w.t('DIRECTOR', x, w.y, 8, f.light, BLUE);
    w.y -= 20;
    w.t(d.name, x, w.y, 17, f.serif);
    w.y -= 18;
    for (const s of d.bio) w.para(s, S, { x, size: 9.5, gap: 3 });
    w.y -= 4;
    const rows: [string, string][] = [['With the company since', String(d.joined)], ...d.roles.map((r): [string, string] => [r.title, `${r.from}–${r.to}`])];
    for (const [k, v] of rows) {
      w.page.drawLine({ start: { x, y: w.y + 10 }, end: { x: A4[0] - M, y: w.y + 10 }, thickness: 0.4, color: RULE });
      w.t(k, x, w.y, 8.5, f.reg, MUTED);
      w.t(v, A4[0] - M - f.light.widthOfTextAtSize(v, 9), w.y, 9, f.light);
      w.y -= 14;
    }
    w.y = Math.min(w.y, top - ph) - 14;
  }
  {
    // founder tribute panel
    const fd = company.founder;
    const pw = 84;
    const image = await img(doc, 'images/people/founder-480.jpg');
    const ph = (pw * image.height) / image.width;
    const x = M + pw + 28;
    const factLines = fd.facts.map((t) => wrap(f.reg, 8.8, t, W - pw - 52));
    const textH = 44 + factLines.reduce((a, l) => a + l.length * 12.5 + 2, 0);
    const boxH = Math.max(ph + 24, textH + 12);
    w.page.drawRectangle({ x: M, y: w.y - boxH, width: W, height: boxH, color: PANEL, borderColor: NAVY, borderWidth: 0.6 });
    w.page.drawRectangle({ x: M, y: w.y - 3, width: W, height: 3, color: NAVY });
    w.photo(image, M + 12, w.y - 12, pw);
    let y = w.y - 26;
    w.t('FOUNDER', x, y, 8, f.light, BLUE);
    y -= 17;
    w.t(`${fd.name}, ${fd.born}–${fd.died}`, x, y, 13, f.serif);
    y -= 16;
    for (const lines of factLines) {
      w.page.drawRectangle({ x, y: y + 2, width: 3.5, height: 3.5, color: BLUE });
      for (const l of lines) {
        w.t(l, x + 10, y, 8.8, f.reg);
        y -= 12.5;
      }
      y -= 2;
    }
    w.y -= boxH + 18;
  }
  w.newPage(S);
  w.h2('Key advisers', S);
  {
    const colW = (W - 16) / 2;
    const pw = 52;
    for (let i = 0; i < company.advisors.length; i += 2) {
      w.need(pw * 1.25 + 16, S);
      const rowTop = w.y;
      let rowH = 0;
      for (const [j, a] of company.advisors.slice(i, i + 2).entries()) {
        const x = M + j * (colW + 16);
        const ph = w.photo(await img(doc, `images/people/${a.photo}-240.jpg`), x + 3, rowTop, pw);
        const tx = x + pw + 16;
        let y = rowTop - 8;
        w.t(a.name, tx, y, 10, f.bold);
        y -= 13;
        w.t(a.discipline.toUpperCase(), tx, y, 7.5, f.light, BLUE);
        y -= 13;
        for (const l of wrap(f.reg, 8.5, a.line, colW - pw - 20)) {
          w.t(l, tx, y, 8.5, f.reg, MUTED);
          y -= 11;
        }
        rowH = Math.max(rowH, ph, rowTop - y);
      }
      w.y = rowTop - rowH - 10;
    }
  }
  w.h2('Engineers', S);
  w.para('A selection of the engineers registered with the Pakistan Engineering Council and listed on the company licence.', S, { size: 9, color: MUTED });
  {
    const shown = engineers.shown.map((id) => engineers.engineers.find((e) => e.id === id)!);
    const colW = (W - 16) / 2;
    for (let i = 0; i < shown.length; i += 2) {
      w.need(40, S);
      const top = w.y;
      let low = top;
      for (const [j, e] of shown.slice(i, i + 2).entries()) {
        const x = M + j * (colW + 16);
        let y = top;
        w.page.drawLine({ start: { x, y: y + 11 }, end: { x: x + colW, y: y + 11 }, thickness: 0.4, color: RULE });
        w.t(e.name, x, y, 9.5, f.bold);
        y -= 12;
        w.t(e.discipline.toUpperCase(), x, y, 7.5, f.light, BLUE);
        y -= 11;
        for (const l of wrap(f.reg, 8.5, e.role, colW)) {
          w.t(l, x, y, 8.5, f.reg, MUTED);
          y -= 11;
        }
        low = Math.min(low, y);
      }
      w.y = low - 8;
    }
    w.para('The full technical team is available on request.', S, { size: 9, font: f.bold });
  }

  // ---------- services ----------
  S = 'Services';
  w.newPage(S);
  w.h1('End-to-End Delivery Across the Power Value Chain', 'Services');
  w.para('Transmission, substations, distribution, oil-field power, civil infrastructure and telecommunications, each backed by projects in the company record.', S, { color: MUTED });
  for (const s of services) {
    w.need(52, S);
    w.t(s.title, M, w.y, 10.5, f.bold);
    w.y -= 14;
    w.para(s.intro, S, { size: 9, color: MUTED, gap: 8 });
  }
  {
    const photos = services.filter((s) => s.photo && s.photo.name !== 'substation').map((s) => s.photo!);
    const per = 3;
    const gap = 14;
    const colW = (W - gap * (per - 1)) / per;
    const pick = async (name: string) => {
      const file = fs.readdirSync(path.join(process.cwd(), 'public/images/photos')).filter((x) => x.startsWith(`${name}-`) && x.endsWith('.jpg'));
      const best = file.map((x) => Number(x.slice(name.length + 1, -4))).filter((n) => n <= 960).sort((a, b) => b - a)[0];
      return img(doc, `images/photos/${name}-${best}.jpg`);
    };
    w.y -= 6;
    for (let i = 0; i < photos.length; i += per) {
      const h = ((colW - 6) * 9) / 16 + 24;
      w.need(h, S);
      for (const [j, p] of photos.slice(i, i + per).entries()) w.photo(await pick(p.name), M + 3 + j * (colW + gap), w.y, colW - 6, p.caption);
      w.y -= h + 4;
    }
  }

  // ---------- selected projects ----------
  S = 'Selected projects';
  w.newPage(S);
  w.h1('Selected projects', 'Record');
  w.para(
    'Flagship projects and the largest contracts in the company records. Contract values are shown as listed in the company profile, in the original currency and year; they are not converted. For joint ventures the value is that of the whole joint-venture contract.',
    S,
    { color: MUTED, gap: 6 },
  );
  const selected = projects.filter((p) => p.flagship || p.value.show).sort(byNewest);
  for (const p of selected) {
    const nameLines = wrap(f.bold, 10.5, p.name, W - 150);
    const scope = wrap(f.reg, 8.6, p.scope, W);
    w.need(nameLines.length * 13 + 16 + scope.length * 11.5 + 18, S);
    w.page.drawLine({ start: { x: M, y: w.y + 12 }, end: { x: A4[0] - M, y: w.y + 12 }, thickness: 0.5, color: NAVY });
    const value = fmtValue(p);
    if (value) {
      const label = p.role === 'jv' ? 'JV CONTRACT VALUE' : 'CONTRACT VALUE';
      w.t(label, A4[0] - M - f.light.widthOfTextAtSize(label, 6.5), w.y + 1, 6.5, f.light, MUTED);
      w.t(safe(f.light, value), A4[0] - M - f.light.widthOfTextAtSize(safe(f.light, value), 9), w.y - 10, 9, f.light);
    }
    for (const l of nameLines) {
      w.t(l, M, w.y, 10.5, f.bold);
      w.y -= 13;
    }
    for (const l of wrap(f.light, 7.8, meta(p), W - 150)) {
      w.t(l, M, w.y, 7.8, f.light, BLUE);
      w.y -= 11;
    }
    w.y -= 3;
    for (const l of scope) {
      w.t(l, M, w.y, 8.6, f.reg, MUTED);
      w.y -= 11.2;
    }
    w.y -= 9;
  }

  // ---------- Libya ----------
  S = 'Libya';
  w.newPage(S);
  w.h1('A Legacy of Delivery in Libya', 'Libya');
  w.para(
    `For over three decades, ${company.name} built the backbone of Libya's power network: high-voltage lines from Tripoli to Benghazi and deep into the Fezzan, and critical electrical systems for the country's leading oil producers. ${company.libya_status}`,
    S,
    { size: 11, gap: 10 },
  );
  w.para(
    'The work ranges from 220 kV transmission lines to 11 and 33 kV networks, underground cables, oil-field electrification in hazardous areas, and live-line maintenance, for the national utility, the Arabian Gulf Oil, Sirte Oil and Waha Oil companies, and international contractors.',
    S,
  );
  w.h2('Landmark Lines in Libya', S);
  for (const slug of [
    'samnu-sebha-220-kv-double-circuit-twin-bundle-line',
    'benghazi-eastern-border-220-kv-double-circuit-lines-750-km',
    'hun-wadi-arial-samnu-220-kv-transmission-line',
    'misurata-sirte-220-kv-lines-and-tripoli-ring',
  ]) {
    const p = projectBySlug(slug);
    w.need(30, S);
    w.t(p.name, M, w.y, 10, f.bold);
    w.y -= 12;
    w.para(meta(p, false), S, { size: 8, font: f.light, color: BLUE, gap: 7 });
  }
  w.h2('Working With Main Contractors', S);
  w.para('The company takes on the electrical scope of transmission, distribution and oil-sector programmes for main contractors:', S, { size: 9.5, font: f.bold });
  w.bullets(
    [
      'Overhead line foundations, tower erection and conductor stringing, 66 to 220 kV in Libya and up to 500 kV elsewhere',
      '11, 30 and 33 kV overhead lines, underground cables and terminations',
      'Substation civil works',
      'Oil-field electrical works, including installations in hazardous areas',
      'Maintenance of 220 kV lines and hot-line maintenance',
    ],
    S,
  );
  w.para(
    'The work is delivered by the company\'s own teams. The company has access to a large fleet of construction and stringing equipment, and can mobilise it per project.',
    S,
    { size: 9 },
  );
  w.para(
    'Documents available on request: the Pakistan Engineering Council licence (Licence No. 1), the certificate of incorporation and the full project list.',
    S,
    { size: 9 },
  );
  w.h2('Clients in Libya', S);
  w.para(clientsFor(libya.projects).join('   ·   '), S, { size: 9 });

  // ---------- global presence ----------
  S = 'Global presence';
  w.newPage(S);
  w.h1(`${numberWord(stats.countries)} Countries, Three Regions`, 'Global presence');
  {
    const cols = [
      { k: 'Country', x: M, w: 110 },
      { k: 'Capability', x: M + 110, w: 150 },
      { k: 'Selected clients', x: M + 270, w: W - 270 },
    ];
    for (const c of cols) w.t(c.k.toUpperCase(), c.x, w.y, 7, f.light, MUTED);
    w.y -= 5;
    w.page.drawLine({ start: { x: M, y: w.y }, end: { x: A4[0] - M, y: w.y }, thickness: 0.8, color: NAVY });
    w.y -= 13;
    for (const slug of PRESENCE_ORDER) {
      const c = country(slug);
      // most frequent clients first
      const freq = (n: string) => c.projects.filter((p) => clientsFor([p]).includes(n)).length;
      const cl = clientsFor(c.projects).sort((x, y) => freq(y) - freq(x));
      const names = wrap(f.reg, 8.2, cl.slice(0, 4).join('; '), cols[2]!.w);
      const cap = wrap(f.reg, 8.6, countryMeta(slug).descriptor, cols[1]!.w - 10);
      w.t(c.name, M, w.y, 9.5, f.bold);
      cap.forEach((l, j) => w.t(l, cols[1]!.x, w.y - j * 10.5, 8.6, f.reg));
      names.forEach((l, j) => w.t(l, cols[2]!.x, w.y - j * 10.5, 8.2, f.reg, MUTED));
      w.y -= Math.max(1, names.length, cap.length) * 10.5 + 4;
      w.page.drawLine({ start: { x: M, y: w.y + 6 }, end: { x: A4[0] - M, y: w.y + 6 }, thickness: 0.4, color: RULE });
      w.y -= 6;
    }
    w.y -= 16;
  }
  w.para(
    `The company has also held branch offices in ${list(company.historic_branches.map((b) => (b === 'United Kingdom' ? 'the United Kingdom' : b)))}.`,
    S,
    { size: 9, color: MUTED, gap: 10 },
  );
  w.h2('Selected Clients', S);
  w.para(clientsFor(projects).join('   ·   '), S, { size: 8.6 });

  // ---------- capabilities ----------
  S = 'Capabilities and registration';
  w.newPage(S);
  w.h1('Built to Deliver at National Scale', 'Capabilities');
  for (const [i, c] of CAPABILITIES.entries()) {
    const lines = wrap(f.reg, 9, c.text, W - 40);
    w.need(18 + lines.length * 12, S);
    w.t(String(i + 1).padStart(2, '0'), M, w.y, 9, f.light, BLUE);
    w.t(c.title, M + 40, w.y, 11, f.reg);
    w.y -= 14;
    for (const l of lines) {
      w.t(l, M + 40, w.y, 9, f.reg, MUTED);
      w.y -= 12;
    }
    w.y -= 8;
  }
  w.h2('Registration', S);
  w.para(`Pakistan Engineering Council, Licence No. 1: the first licence the Council issued. Incorporated on ${company.incorporated_text}.`, S);
  w.para(`Pre-qualified: ${company.prequalified_short.join(', ')}. Projects financed by the ${list(company.financiers)}.`, S);
  w.h2('Fields of Work', S);
  w.para(company.fields_of_specialisation.join('   ·   '), S, { size: 9 });
  w.h2('Mobilisation', S);
  w.para(
    'The company has access to a large fleet of construction and stringing equipment, and can mobilise it per project. The Pakistan Engineering Council licence, the certificate of incorporation and the full project list are available on request.',
    S,
  );
  // office block
  {
    const a = contact.address;
    const lines = [`${a.line1}, ${a.line2}`, `${a.city}, ${a.country}`, ...contact.phones.map((p) => `Tel ${p}`), ...contact.emails];
    const h = 40 + lines.length * 13;
    w.need(h + 10, S);
    w.y -= 6;
    w.page.drawRectangle({ x: M, y: w.y - h, width: W, height: h, color: NAVY });
    w.t('HEAD OFFICE', M + 16, w.y - 20, 8, f.bold, SKY);
    lines.forEach((l, i) => w.t(l, M + 16, w.y - 38 - i * 13, 10.5, i === 0 ? f.bold : f.reg, PAPER));
    logo(w.page, A4[0] - M - 90, w.y - 16, 30, PAPER);
    w.y -= h + 10;
  }

  // footers
  const today = new Date();
  const edition = today.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });
  w.pages.forEach((pg, i) => {
    const n = `${i + 2}`;
    pg.drawText(safe(f.reg, `${company.name}  ·  Company profile  ·  ${edition}`), { x: M, y: M - 18, size: 7.5, font: f.reg, color: MUTED });
    pg.drawText(n, { x: A4[0] - M - f.light.widthOfTextAtSize(n, 8), y: M - 18, size: 8, font: f.light, color: MUTED });
  });
  return doc.save({ useObjectStreams: true });
}
