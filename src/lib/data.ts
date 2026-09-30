import projectsJson from '../data/projects.json';
import companyJson from '../data/company.json';
import engineersJson from '../data/engineers.json';
import contactJson from '../data/contact.json';

export type Sector =
  | 'transmission'
  | 'substation'
  | 'distribution'
  | 'industrial'
  | 'oil-and-gas-electrical'
  | 'civil'
  | 'other';

export interface Project {
  id: string;
  slug: string;
  name: string;
  client: string;
  country: string;
  country_slug: string;
  region: string | null;
  group: string | null;
  sector: Sector;
  voltage_kv: number | null;
  length_km: number | null;
  year_start: number | null;
  year_end: number | null;
  role: 'main' | 'jv' | 'sub' | 'unknown';
  scope: string;
  value: { amount: number | null; currency: string; year: number | null; verified: boolean; show: boolean };
  flagship: boolean;
  hotline: boolean;
  images: string[];
  source: { pdf: string; page: number; url: string | null; length_from?: { pdf: string; page: number } };
  notes: string;
}

export const projects = projectsJson as Project[];
export const company = companyJson;
export const engineers = engineersJson;
export const contact = contactJson as {
  address: { line1: string; line2: string; city: string; country: string; map_url: string };
  phones: string[];
  emails: string[];
  whatsapp: string | null;
};

export const SECTOR_LABEL: Record<Sector, string> = {
  transmission: 'Transmission lines',
  substation: 'Substations',
  distribution: 'Distribution',
  industrial: 'Industrial electrical',
  'oil-and-gas-electrical': 'Oil-field electrical',
  civil: 'Civil and infrastructure',
  other: 'Pipelines and telecom',
};

export const ROLE_LABEL: Record<Project['role'], string> = {
  main: 'Main contractor',
  jv: 'Joint-venture partner',
  sub: 'Subcontractor',
  unknown: 'Not stated',
};

export const PDF_LABEL: Record<string, string> = {
  'Nazir_and_Sons_profile.pdf': 'Company profile',
  'Second_profile.pdf': 'Company profile, 2023 edition',
};

/** Projects ordered newest first; projects without a year go last. */
export function byNewest(a: Project, b: Project): number {
  const ay = a.year_end ?? -1;
  const by = b.year_end ?? -1;
  if (ay !== by) return by - ay;
  return a.name.localeCompare(b.name);
}

export interface CountryInfo {
  slug: string;
  name: string;
  count: number;
  first: number | null;
  last: number | null;
  projects: Project[];
}

export const countries: CountryInfo[] = (() => {
  const map = new Map<string, CountryInfo>();
  for (const p of projects) {
    const c = map.get(p.country_slug) ?? { slug: p.country_slug, name: p.country, count: 0, first: null, last: null, projects: [] };
    c.count++;
    c.projects.push(p);
    const y0 = p.year_start ?? p.year_end;
    const y1 = p.year_end;
    if (y0 !== null) c.first = c.first === null ? y0 : Math.min(c.first, y0);
    if (y1 !== null) c.last = c.last === null ? y1 : Math.max(c.last, y1);
    map.set(p.country_slug, c);
  }
  const list = [...map.values()];
  list.forEach((c) => c.projects.sort(byNewest));
  return list.sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
})();

export function country(slug: string): CountryInfo {
  const c = countries.find((x) => x.slug === slug);
  if (!c) throw new Error(`Unknown country ${slug}`);
  return c;
}

const years = projects.flatMap((p) => [p.year_start, p.year_end]).filter((y): y is number => y !== null);

export const stats = {
  founded: company.founded,
  projects: projects.length,
  countries: countries.length,
  firstYear: Math.min(...years),
  lastYear: Math.max(...years),
  get recordYears() {
    return this.lastYear - this.firstYear;
  },
};

export function range(c: { first: number | null; last: number | null }): string {
  if (c.first === null || c.last === null) return '';
  return c.first === c.last ? String(c.first) : `${c.first}–${c.last}`;
}

export function projectUrl(p: Project): string {
  return `/projects/${p.country_slug}/${p.slug}/`;
}

export function projectBySlug(slug: string): Project {
  const p = projects.find((x) => x.slug === slug);
  if (!p) throw new Error(`Unknown project ${slug}`);
  return p;
}

export function fmtKv(kv: number | null, p?: Project): string {
  if (kv === null) return '';
  if (p && /HVDC/.test(p.name)) return `±${kv} kV DC`;
  return `${kv} kV`;
}

export function fmtKm(km: number | null): string {
  if (km === null) return '';
  return `${km.toLocaleString('en-GB')} km`;
}

/**
 * Contract value as listed in the company profile, in its original currency and
 * year. Only for projects approved for display (value.show); never converted.
 */
export function fmtValue(p: Project): string {
  const v = p.value;
  if (!v.show || v.amount === null) return '';
  const [cur, unit] = v.currency.split(' ');
  const n = v.amount.toLocaleString('en-GB', { maximumFractionDigits: 2 });
  return `${cur} ${n}${unit ? ` ${unit}` : ''}${v.year ? ` (${v.year})` : ''}`;
}

export function yearText(p: Project): string {
  if (p.year_end === null) return 'Not stated';
  if (p.year_start && p.year_start !== p.year_end) return `${p.year_start}–${p.year_end}`;
  return String(p.year_end);
}

export function voltageBand(p: Project): string {
  const kv = p.voltage_kv;
  if (kv === null) return 'na';
  if (/HVDC/.test(p.name)) return 'hvdc';
  if (kv <= 35) return 'mv';
  if (kv <= 138) return 'hv';
  if (kv <= 275) return 'ehv';
  return 'uhv';
}

export const VOLTAGE_BANDS: Record<string, string> = {
  mv: '11–35 kV',
  hv: '66–138 kV',
  ehv: '220–275 kV',
  uhv: '380–500 kV',
  hvdc: 'HVDC',
  na: 'Not stated',
};

export function decade(p: Project): string {
  return p.year_end === null ? 'na' : `${Math.floor(p.year_end / 10) * 10}s`;
}

export function sourceText(p: Project): string {
  const main = `${PDF_LABEL[p.source.pdf] ?? 'Company profile'}, p. ${p.source.page}`;
  const extra = p.source.length_from
    ? `; length: ${PDF_LABEL[p.source.length_from.pdf] ?? 'company profile'}, p. ${p.source.length_from.page}`
    : '';
  return main + extra;
}

/** Canonical client name for the "Clients served" strips: merges operating units and renamed bodies. */
export function clientCanon(name: string): string {
  const n = name.trim();
  if (n.startsWith('Saudi Electricity Company')) return 'Saudi Electricity Company (formerly SCECO)';
  if (n.startsWith('GECOL')) return 'GECOL (formerly ELPCO)';
  if (n.startsWith('National Highway Authority')) return 'National Highway Authority (formerly National Highway Board)';
  if (n.startsWith('Provincial Highway Division')) return 'Provincial Highway Divisions, Punjab';
  return n;
}

/** Clients served, deduplicated on the canonical display name. */
export function clientsFor(list: Project[]): string[] {
  const names = new Set<string>();
  for (const p of list) {
    for (const part of p.client.split(' / ')) {
      const n = clientCanon(part);
      if (n && n !== 'Private sector') names.add(n);
    }
  }
  return [...names];
}

export const SITE_MODE: 'review' | 'live' = import.meta.env.SITE_MODE === 'live' ? 'live' : 'review';
export const FORM_ENABLED = import.meta.env.PUBLIC_FORM_ENABLED === 'true';
export const TURNSTILE_SITE_KEY: string = import.meta.env.PUBLIC_TURNSTILE_SITE_KEY ?? '';
