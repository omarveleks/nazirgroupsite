// Mobile menu enhancement: the menu works without JavaScript (<details>).
// This only closes it on Escape, on outside click and after choosing a link.
const menu = document.querySelector<HTMLDetailsElement>('.nav-mobile');
if (menu) {
  const summary = menu.querySelector('summary');
  summary?.setAttribute('aria-controls', 'mobile-nav');
  menu.querySelector('.nav-panel')?.setAttribute('id', 'mobile-nav');
  const sync = () => summary?.setAttribute('aria-expanded', String(menu.open));
  sync();
  menu.addEventListener('toggle', sync);
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && menu.open) {
      menu.open = false;
      summary?.focus();
    }
  });
  document.addEventListener('click', (e) => {
    if (menu.open && !menu.contains(e.target as Node)) menu.open = false;
  });
}
