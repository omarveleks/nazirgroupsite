// Enquiry form enhancement. Without JavaScript the form posts normally to
// /api/contact, which redirects to a thank-you or error page.
const MAX = 5 * 1024 * 1024;
const OK_EXT = /\.(pdf|docx?|xlsx?|jpe?g|png)$/i;

const form = document.querySelector<HTMLFormElement>('[data-enquiry]');
if (form) {
  const status = form.querySelector<HTMLElement>('[data-status]');
  const submit = form.querySelector<HTMLButtonElement>('button[type="submit"]');
  const file = form.querySelector<HTMLInputElement>('#file');
  const say = (msg: string, kind: 'ok' | 'error' | '' = '') => {
    if (!status) return;
    status.textContent = msg;
    status.dataset.kind = kind;
  };

  // Pre-select from the link, e.g. /contact/?type=subcontract&country=Libya
  const params = new URLSearchParams(location.search);
  const type = params.get('type');
  const country = params.get('country');
  const typeSel = form.querySelector<HTMLSelectElement>('#type');
  if (type && typeSel && [...typeSel.options].some((o) => o.value === type)) typeSel.value = type;
  const countryIn = form.querySelector<HTMLInputElement>('#country');
  if (country && countryIn) countryIn.value = country.slice(0, 80);

  const checkFile = (): string => {
    const f = file?.files?.[0];
    if (!f) return '';
    if (!OK_EXT.test(f.name)) return 'The file must be a PDF, Word, Excel, JPEG or PNG file.';
    if (f.size > MAX) return 'The file is larger than 5 MB.';
    return '';
  };

  file?.addEventListener('change', () => {
    const err = checkFile();
    file.setAttribute('aria-invalid', err ? 'true' : 'false');
    file.setCustomValidity(err);
    say(err, err ? 'error' : '');
  });

  form.addEventListener('submit', async (e) => {
    if (submit?.disabled) {
      e.preventDefault();
      return;
    }
    const err = checkFile();
    if (err) {
      e.preventDefault();
      say(err, 'error');
      file?.focus();
      return;
    }
    if (!form.checkValidity()) return; // let the browser show its messages
    e.preventDefault();
    if (submit) submit.disabled = true;
    say('Sending…');
    try {
      const res = await fetch(form.action, { method: 'POST', body: new FormData(form), headers: { Accept: 'application/json' } });
      const data = (await res.json().catch(() => ({}))) as { ok?: boolean; error?: string };
      if (res.ok && data.ok) {
        form.reset();
        say('Thank you. The enquiry has been sent and will be answered by the company.', 'ok');
      } else {
        say(data.error || 'The enquiry could not be sent. Please try again later.', 'error');
      }
    } catch {
      say('The enquiry could not be sent. Check the connection and try again.', 'error');
    } finally {
      if (submit) submit.disabled = false;
    }
  });
}
