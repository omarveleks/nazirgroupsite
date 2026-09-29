/**
 * Cloudflare Pages Function: POST /api/contact
 *
 * Environment (Cloudflare Pages > Settings > Variables and secrets):
 *   MAIL_TO               destination address (required; without it the form reports "not yet connected")
 *   MAIL_API_KEY          API key for the mail provider (secret)
 *   MAIL_PROVIDER         resend | sendgrid | postmark (default resend)
 *   MAIL_FROM             verified sender address at the provider
 *   TURNSTILE_SECRET_KEY  Cloudflare Turnstile secret (secret)
 *   RATE_LIMIT            optional KV namespace binding for rate limiting
 *
 * Secrets are never stored in the repository.
 */

interface KV {
  get(key: string): Promise<string | null>;
  put(key: string, value: string, opts?: { expirationTtl?: number }): Promise<void>;
}

interface Env {
  MAIL_TO?: string;
  MAIL_API_KEY?: string;
  MAIL_PROVIDER?: string;
  MAIL_FROM?: string;
  TURNSTILE_SECRET_KEY?: string;
  RATE_LIMIT?: KV;
}

interface Ctx {
  request: Request;
  env: Env;
}

const TYPES: Record<string, string> = {
  client: 'Client',
  subcontract: 'Main contractor subcontract enquiry',
  partnership: 'Partnership',
  careers: 'Careers',
  other: 'Other',
};
const MAX_FILE = 5 * 1024 * 1024;
const MAX_BODY = 6 * 1024 * 1024;
const WINDOW_S = 600;
const LIMIT = 5;
const FILE_TYPES: Record<string, { mime: string[]; magic: number[][] }> = {
  pdf: { mime: ['application/pdf'], magic: [[0x25, 0x50, 0x44, 0x46]] },
  png: { mime: ['image/png'], magic: [[0x89, 0x50, 0x4e, 0x47]] },
  jpg: { mime: ['image/jpeg'], magic: [[0xff, 0xd8, 0xff]] },
  jpeg: { mime: ['image/jpeg'], magic: [[0xff, 0xd8, 0xff]] },
  doc: { mime: ['application/msword'], magic: [[0xd0, 0xcf, 0x11, 0xe0]] },
  xls: { mime: ['application/vnd.ms-excel'], magic: [[0xd0, 0xcf, 0x11, 0xe0]] },
  docx: {
    mime: ['application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
    magic: [[0x50, 0x4b, 0x03, 0x04]],
  },
  xlsx: {
    mime: ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'],
    magic: [[0x50, 0x4b, 0x03, 0x04]],
  },
};

const memory = new Map<string, { n: number; t: number }>();

function reply(request: Request, ok: boolean, status: number, error?: string): Response {
  const wantsJson = (request.headers.get('accept') ?? '').includes('application/json');
  if (wantsJson) {
    return new Response(JSON.stringify(ok ? { ok: true } : { ok: false, error }), {
      status,
      headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' },
    });
  }
  const to = ok ? '/contact/thanks/' : '/contact/error/';
  return new Response(null, { status: 303, headers: { location: to, 'cache-control': 'no-store' } });
}

async function limited(env: Env, ip: string): Promise<boolean> {
  const key = `rl:${ip}`;
  if (env.RATE_LIMIT) {
    const n = Number((await env.RATE_LIMIT.get(key)) ?? '0');
    if (n >= LIMIT) return true;
    await env.RATE_LIMIT.put(key, String(n + 1), { expirationTtl: WINDOW_S });
    return false;
  }
  const now = Date.now() / 1000;
  const e = memory.get(key);
  if (!e || now - e.t > WINDOW_S) {
    memory.set(key, { n: 1, t: now });
    return false;
  }
  e.n++;
  return e.n > LIMIT;
}

function clean(v: FormDataEntryValue | null, max: number): string {
  return typeof v === 'string' ? v.replace(/\r\n?/g, '\n').trim().slice(0, max) : '';
}

function toBase64(buf: ArrayBuffer): string {
  const bytes = new Uint8Array(buf);
  let bin = '';
  for (let i = 0; i < bytes.length; i += 0x8000) bin += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  return btoa(bin);
}

async function checkFile(f: File): Promise<string | null> {
  if (f.size > MAX_FILE) return 'The file is larger than 5 MB.';
  const ext = (f.name.split('.').pop() ?? '').toLowerCase();
  const rule = FILE_TYPES[ext];
  if (!rule) return 'The file must be a PDF, Word, Excel, JPEG or PNG file.';
  if (f.type && !rule.mime.includes(f.type) && f.type !== 'application/octet-stream') return 'The file type does not match its name.';
  const head = new Uint8Array(await f.slice(0, 8).arrayBuffer());
  if (!rule.magic.some((m) => m.every((b, i) => head[i] === b))) return 'The file content does not match its type.';
  return null;
}

async function verifyTurnstile(secret: string, token: string, ip: string): Promise<boolean> {
  const body = new FormData();
  body.append('secret', secret);
  body.append('response', token);
  if (ip) body.append('remoteip', ip);
  const r = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', { method: 'POST', body });
  const data = (await r.json()) as { success?: boolean };
  return data.success === true;
}

interface Mail {
  subject: string;
  text: string;
  replyTo: string;
  file?: { name: string; type: string; b64: string };
}

async function send(env: Env, m: Mail): Promise<boolean> {
  const provider = (env.MAIL_PROVIDER ?? 'resend').toLowerCase();
  const from = env.MAIL_FROM ?? env.MAIL_TO!;
  const to = env.MAIL_TO!;
  let res: Response;
  if (provider === 'sendgrid') {
    res = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: { authorization: `Bearer ${env.MAIL_API_KEY}`, 'content-type': 'application/json' },
      body: JSON.stringify({
        personalizations: [{ to: [{ email: to }] }],
        from: { email: from },
        reply_to: { email: m.replyTo },
        subject: m.subject,
        content: [{ type: 'text/plain', value: m.text }],
        attachments: m.file ? [{ content: m.file.b64, filename: m.file.name, type: m.file.type }] : undefined,
      }),
    });
  } else if (provider === 'postmark') {
    res = await fetch('https://api.postmarkapp.com/email', {
      method: 'POST',
      headers: { 'x-postmark-server-token': env.MAIL_API_KEY!, 'content-type': 'application/json', accept: 'application/json' },
      body: JSON.stringify({
        From: from,
        To: to,
        ReplyTo: m.replyTo,
        Subject: m.subject,
        TextBody: m.text,
        Attachments: m.file ? [{ Name: m.file.name, Content: m.file.b64, ContentType: m.file.type }] : undefined,
      }),
    });
  } else {
    res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { authorization: `Bearer ${env.MAIL_API_KEY}`, 'content-type': 'application/json' },
      body: JSON.stringify({
        from,
        to: [to],
        reply_to: m.replyTo,
        subject: m.subject,
        text: m.text,
        attachments: m.file ? [{ filename: m.file.name, content: m.file.b64 }] : undefined,
      }),
    });
  }
  return res.ok;
}

export const onRequestPost = async ({ request, env }: Ctx): Promise<Response> => {
  if (!env.MAIL_TO || !env.MAIL_API_KEY) return reply(request, false, 503, 'Form not yet connected.');

  const len = Number(request.headers.get('content-length') ?? '0');
  if (len > MAX_BODY) return reply(request, false, 413, 'The enquiry is too large. Attach a file of up to 5 MB.');

  const ip = request.headers.get('cf-connecting-ip') ?? '';
  if (await limited(env, ip || 'unknown')) {
    return reply(request, false, 429, 'Too many enquiries from this connection. Please wait ten minutes and try again.');
  }

  let fd: FormData;
  try {
    fd = await request.formData();
  } catch {
    return reply(request, false, 400, 'The form could not be read.');
  }

  // Honeypot: bots fill every field. Answer as if sent, send nothing.
  if (clean(fd.get('website'), 200)) return reply(request, true, 200);

  const type = clean(fd.get('type'), 40);
  const name = clean(fd.get('name'), 200);
  const org = clean(fd.get('organisation'), 200);
  const email = clean(fd.get('email'), 254);
  const phone = clean(fd.get('phone'), 40);
  const country = clean(fd.get('country'), 80);
  const details = clean(fd.get('details'), 5000);

  if (!TYPES[type]) return reply(request, false, 400, 'Choose the type of enquiry.');
  if (!name) return reply(request, false, 400, 'Enter your name.');
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) return reply(request, false, 400, 'Enter a valid email address.');
  if (details.length < 10) return reply(request, false, 400, 'Add some project details.');

  if (env.TURNSTILE_SECRET_KEY) {
    const token = clean(fd.get('cf-turnstile-response'), 2048);
    if (!token || !(await verifyTurnstile(env.TURNSTILE_SECRET_KEY, token, ip))) {
      return reply(request, false, 400, 'The security check failed. Please reload the page and try again.');
    }
  }

  let file: Mail['file'];
  const f = fd.get('file');
  if (f && typeof f !== 'string' && f.size > 0) {
    const err = await checkFile(f);
    if (err) return reply(request, false, 400, err);
    file = { name: f.name.replace(/[^\w.\- ]+/g, '_').slice(0, 120), type: f.type || 'application/octet-stream', b64: toBase64(await f.arrayBuffer()) };
  }

  const label = type === 'subcontract' && /libya/i.test(country) ? 'Libya subcontract' : TYPES[type]!;
  const subject = `[${label}] ${name}${org ? `, ${org}` : ''}${country ? ` (${country})` : ''}`.slice(0, 200);
  const text = [
    `Type: ${TYPES[type]}`,
    `Name: ${name}`,
    `Organisation: ${org || '-'}`,
    `Email: ${email}`,
    `Phone: ${phone || '-'}`,
    `Country: ${country || '-'}`,
    '',
    details,
    '',
    file ? `Attachment: ${file.name}` : 'No attachment',
  ].join('\n');

  try {
    const ok = await send(env, { subject, text, replyTo: email, file });
    return ok ? reply(request, true, 200) : reply(request, false, 502, 'The enquiry could not be sent. Please try again later.');
  } catch {
    return reply(request, false, 502, 'The enquiry could not be sent. Please try again later.');
  }
};
