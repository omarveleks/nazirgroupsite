// Small enhancements for the interactive blocks. Every block renders its first state in
// the HTML and works (or degrades to a static view) without JavaScript. No autoplay.

// Hero project card: previous / next and dots
for (const root of document.querySelectorAll<HTMLElement>('[data-carousel]')) {
  const slides = [...root.querySelectorAll<HTMLElement>('[data-slide]')];
  const dots = [...root.querySelectorAll<HTMLButtonElement>('[data-to]')];
  let i = 0;
  const show = (n: number) => {
    i = (n + slides.length) % slides.length;
    slides.forEach((s, j) => (s.hidden = j !== i));
    dots.forEach((d, j) => d.setAttribute('aria-current', String(j === i)));
  };
  dots.forEach((d, j) => d.addEventListener('click', () => show(j)));
  root.querySelector('[data-prev]')?.addEventListener('click', () => show(i - 1));
  root.querySelector('[data-next]')?.addEventListener('click', () => show(i + 1));
}

// Capability list: tabs that switch the photo panel on click, keyboard or hover
for (const root of document.querySelectorAll<HTMLElement>('[data-tabs]')) {
  const tabs = [...root.querySelectorAll<HTMLButtonElement>('[role="tab"]')];
  const panels = tabs.map((t) => document.getElementById(t.getAttribute('aria-controls') ?? ''));
  const imgs = [...root.querySelectorAll<HTMLElement>('[data-img]')];
  const select = (n: number, focus = false) => {
    tabs.forEach((t, j) => {
      const on = j === n;
      t.setAttribute('aria-selected', String(on));
      t.tabIndex = on ? 0 : -1;
      if (panels[j]) panels[j]!.hidden = !on;
      imgs[j]?.classList.toggle('is-on', on);
    });
    if (focus) tabs[n]?.focus();
  };
  tabs.forEach((t, j) => {
    t.addEventListener('click', () => select(j));
    t.addEventListener('mouseenter', () => select(j));
    t.addEventListener('keydown', (e) => {
      const k = e.key;
      const last = tabs.length - 1;
      const to = k === 'ArrowDown' || k === 'ArrowRight' ? (j === last ? 0 : j + 1) : k === 'ArrowUp' || k === 'ArrowLeft' ? (j === 0 ? last : j - 1) : k === 'Home' ? 0 : k === 'End' ? last : -1;
      if (to >= 0) {
        e.preventDefault();
        select(to, true);
      }
    });
  });
}

// Featured rows: previous / next, "1 – 3 of 6" and the progress bar
for (const root of document.querySelectorAll<HTMLElement>('[data-track]')) {
  const list = root.querySelector<HTMLElement>('[data-track-list]');
  const count = root.querySelector<HTMLElement>('[data-count]');
  const bar = root.querySelector<HTMLElement>('[data-prog]');
  if (!list) continue;
  const n = list.children.length;
  const gap = () => parseFloat(getComputedStyle(list).columnGap) || 0;
  const step = () => ((list.firstElementChild as HTMLElement | null)?.offsetWidth ?? 1) + gap();
  const update = () => {
    const s = step();
    const vis = Math.max(1, Math.min(n, Math.floor((list.clientWidth + gap()) / s)));
    const i = Math.min(n - vis, Math.round(list.scrollLeft / s));
    if (count) count.textContent = `${i + 1} – ${Math.min(i + vis, n)} of ${n}`;
    if (bar) {
      const w = (vis / n) * 100;
      const max = list.scrollWidth - list.clientWidth;
      bar.style.width = `${w}%`;
      bar.style.left = `${(max > 0 ? list.scrollLeft / max : 0) * (100 - w)}%`;
    }
  };
  const smooth = matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth';
  root.querySelector('[data-next]')?.addEventListener('click', () => list.scrollBy({ left: step(), behavior: smooth }));
  root.querySelector('[data-prev]')?.addEventListener('click', () => list.scrollBy({ left: -step(), behavior: smooth }));
  list.addEventListener('scroll', update, { passive: true });
  addEventListener('resize', update, { passive: true });
  update();
}

// Heritage decades: pills switch the photo card
for (const root of document.querySelectorAll<HTMLElement>('[data-decades]')) {
  const pills = [...root.querySelectorAll<HTMLButtonElement>('[data-d]')];
  const cards = [...root.querySelectorAll<HTMLElement>('[data-dslide]')];
  pills.forEach((p) =>
    p.addEventListener('click', () => {
      pills.forEach((q) => q.setAttribute('aria-pressed', String(q === p)));
      cards.forEach((c) => (c.hidden = c.dataset.dslide !== p.dataset.d));
    }),
  );
}
