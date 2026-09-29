// Project register filters. The full table is in the HTML; this only hides rows.
type Filters = { q: string; sector: string; band: string; client: string; decade: string; country: string };
const KEYS: (keyof Filters)[] = ['q', 'sector', 'band', 'client', 'decade', 'country'];

const norm = (s: string) =>
  s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[–—-]/g, ' ')
    .trim();

function setup(root: HTMLElement) {
  const form = root.querySelector<HTMLElement>('[data-filters]');
  if (!form) return;
  const field = (k: string) => form.querySelector<HTMLInputElement | HTMLSelectElement>(`[name="${k}"]`);
  const rows = [...root.querySelectorAll<HTMLTableRowElement>('tbody tr')];
  const groups = [...root.querySelectorAll<HTMLElement>('[data-group]')];
  const shown = root.querySelector<HTMLElement>('[data-shown]');

  const read = (): Filters => {
    const f = {} as Filters;
    for (const k of KEYS) f[k] = field(k)?.value ?? '';
    return f;
  };

  const apply = () => {
    const f = read();
    const terms = norm(f.q).split(/\s+/).filter(Boolean);
    let n = 0;
    for (const tr of rows) {
      const d = tr.dataset;
      const ok =
        (!f.sector || d.sector === f.sector) &&
        (!f.band || d.band === f.band) &&
        (!f.decade || d.decade === f.decade) &&
        (!f.country || d.country === f.country) &&
        (!f.client || (d.client ?? '').split('|').includes(f.client)) &&
        terms.every((t) => (d.text ?? '').includes(t));
      tr.hidden = !ok;
      if (ok) n++;
    }
    for (const g of groups) {
      const visible = g.querySelectorAll('tbody tr:not([hidden])').length;
      const empty = g.querySelector<HTMLElement>('[data-empty]');
      const table = g.querySelector('table');
      if (empty) empty.hidden = visible > 0;
      if (table) table.hidden = visible === 0;
      const gc = g.querySelector<HTMLElement>('[data-group-count]');
      if (gc) gc.textContent = `(${visible})`;
    }
    if (shown) shown.textContent = String(n);
  };

  // Pre-fill from the URL, e.g. /projects/?sector=transmission
  const params = new URLSearchParams(location.search);
  let fromUrl = false;
  for (const k of KEYS) {
    const v = params.get(k);
    const el = field(k);
    if (v && el) {
      el.value = v;
      fromUrl = true;
    }
  }

  form.addEventListener('input', apply);
  form.addEventListener('change', apply);
  form.querySelector('[data-reset]')?.addEventListener('click', () => {
    for (const k of KEYS) {
      const el = field(k);
      if (el) el.value = '';
    }
    const g = document.querySelector<HTMLInputElement>(`[data-global-search="${root.dataset.register}"]`);
    if (g) g.value = '';
    apply();
  });
  apply();

  const details = root.closest('details');
  if (details && fromUrl) details.open = true;

  // Global search box outside the register (projects index)
  const globalBox = document.querySelector<HTMLInputElement>(`[data-global-search="${root.dataset.register}"]`);
  const inner = field('q');
  if (globalBox && inner) {
    if (params.get('q')) globalBox.value = params.get('q') ?? '';
    globalBox.addEventListener('input', () => {
      inner.value = globalBox.value;
      if (details && globalBox.value) details.open = true;
      apply();
    });
  }
}

document.querySelectorAll<HTMLElement>('[data-register]').forEach(setup);
