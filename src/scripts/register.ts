// Project register filters. The full table is in the HTML; this only hides rows.
type Filters = { q: string; sector: string; band: string; client: string; decade: string; country: string };
const KEYS: (keyof Filters)[] = ['q', 'sector', 'band', 'client', 'decade', 'country'];

const norm = (s: string) =>
  s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[–—-]/g, ' ')
    .trim();

function setup(root: HTMLElement) {
  const form = root.querySelector<HTMLFormElement>('[data-filters]');
  if (!form) return;
  const rows = [...root.querySelectorAll<HTMLTableRowElement>('tbody tr')];
  const groups = [...root.querySelectorAll<HTMLElement>('[data-group]')];
  const shown = root.querySelector<HTMLElement>('[data-shown]');

  const read = (): Filters => {
    const fd = new FormData(form);
    const f = {} as Filters;
    for (const k of KEYS) f[k] = String(fd.get(k) ?? '');
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
    const el = form.elements.namedItem(k) as HTMLInputElement | HTMLSelectElement | null;
    if (v && el) {
      el.value = v;
      fromUrl = true;
    }
  }

  form.addEventListener('input', apply);
  form.addEventListener('change', apply);
  form.addEventListener('submit', (e) => e.preventDefault());
  form.addEventListener('reset', () => setTimeout(apply, 0));
  apply();

  const details = root.closest('details');
  if (details && fromUrl) details.open = true;

  // Global search box outside the register (projects index)
  const globalBox = document.querySelector<HTMLInputElement>(`[data-global-search="${root.dataset.register}"]`);
  const inner = form.elements.namedItem('q') as HTMLInputElement | null;
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
