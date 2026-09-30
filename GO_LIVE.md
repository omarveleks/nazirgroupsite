# Deploy and go live

Two stages: **review** (now, on the free `*.pages.dev` address, hidden from search engines) and **live** (when the domain is bought and the review is approved).

Build flag: `SITE_MODE=review|live`. Review mode adds `noindex` (meta tag and `X-Robots-Tag` header), `Disallow: /` in robots.txt, and omits the sitemap. Canonical and Open Graph URLs use `PUBLIC_SITE_URL`.

## 1. Review deploy (once)

The build environment used to create the site could not reach Cloudflare's API, so the first deploy is run from GitHub or a computer with Node 22.

### Option A: GitHub Actions (recommended; every later change deploys automatically)

1. In Cloudflare: **My Profile › API Tokens › Create Token › "Edit Cloudflare Workers" template**, or a custom token with **Account › Cloudflare Pages › Edit**. Copy the token. Note the **Account ID** (Workers & Pages overview, right-hand side).
2. In GitHub, repository **omarveleks/nazirgroupsite › Settings › Secrets and variables › Actions**:
   - Secrets: `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`.
   - Variables (optional): `CF_PAGES_PROJECT` = `nazir-and-company`, `SITE_MODE` = `review`.
3. Merge the site branch into `main` (or run **Actions › Deploy to Cloudflare Pages › Run workflow**).
4. The workflow runs `npm run qa` (the full QA gate) and, only if it passes, deploys `dist/` with `wrangler pages deploy`. It creates the Pages project on first run. The address is `https://<project>.pages.dev`. If `nazir-and-company` is taken, set `CF_PAGES_PROJECT` and `PUBLIC_SITE_URL` to match.

### Option B: from a computer

```bash
git clone https://github.com/omarveleks/nazirgroupsite && cd nazirgroupsite
npm ci
npx playwright install chromium        # for the QA gate
npm run qa                             # must pass; leaves the review build in dist/
npx wrangler login                     # approve in the browser once
npx wrangler pages project create nazir-and-company --production-branch=main
npx wrangler pages deploy dist --project-name=nazir-and-company --branch=main
```

### Rollback

Cloudflare keeps every deployment. **Workers & Pages › nazir-and-company › Deployments › (previous deployment) › Rollback to this deployment.** Instant.

## 2. Contact form (before going public)

**Current set-up (Cloudflare only, no third-party account):** Email Routing is on for nazirco.com and the destination address is verified. The Pages Function sends through Cloudflare Email Service. In **Workers & Pages › nazir-and-company › Settings › Variables and secrets** (Production), add as **Secret**: `MAIL_TO` (the verified destination address), `MAIL_API_KEY` (a Cloudflare API token with **Account › Email Sending › Edit**) and `CF_ACCOUNT_ID` (the account ID). Optional: `MAIL_FROM` (default `website@nazirco.com`). Then redeploy. The steps below describe the alternative providers.


1. Choose a mail provider: Resend (default), SendGrid or Postmark. Verify the sending domain there.
2. In **Workers & Pages › nazir-and-company › Settings › Variables and secrets** (Production), add:
   - `MAIL_TO` = the company mailbox (plain text variable)
   - `MAIL_FROM` = the verified sender, e.g. `website@<domain>`
   - `MAIL_PROVIDER` = `resend` | `sendgrid` | `postmark`
   - `MAIL_API_KEY` = provider API key (**secret**)
3. Turnstile: **Cloudflare › Turnstile › Add widget** for the domain (and the pages.dev address). Add `TURNSTILE_SECRET_KEY` (**secret**) to Pages, and `PUBLIC_TURNSTILE_SITE_KEY` as a GitHub Actions variable.
4. Rate limiting (optional but recommended): **Workers & Pages › KV › Create namespace** `nazir-rate-limit`, then **Pages › Settings › Bindings › KV namespace**: variable name `RATE_LIMIT`. Without it the function uses a per-instance limit (5 enquiries per 10 minutes per IP).
5. Set the GitHub Actions variable `PUBLIC_FORM_ENABLED` = `true` and redeploy. The "Form not yet connected" notice disappears and the send button is enabled.
6. Test: send an enquiry with and without an attachment; check the email arrives with the reply-to set to the sender.

**Going live is blocked until MAIL_TO is set**, otherwise enquiries are lost.

## 3. Going live (domain)

1. Buy the domain. Check availability in this order: `nazirandco.com`, `nazirgroup.com`, `nazir.com.pk`, `nazirco.com`.
2. **Workers & Pages › nazir-and-company › Custom domains › Set up a custom domain**: add `<domain>` and `www.<domain>`. If the domain's DNS is on Cloudflare this is automatic; otherwise add the CNAME records Cloudflare shows. Wait for "Active".
3. Redirect `www` to the bare domain (or the reverse): **Rules › Redirect Rules › Redirect from WWW to root**.
4. GitHub Actions variables:
   - `SITE_MODE` = `live`
   - `PUBLIC_SITE_URL` = `https://<domain>`
   - `PUBLIC_FORM_ENABLED` = `true` (after section 2)
5. Cloudflare Pages variable (Production): `REDIRECT_TO` = `https://<domain>`. The middleware then answers every request to `*.pages.dev` with a 301 to the same path on the domain.
6. Run the workflow (or push to `main`). In live mode the build removes `noindex` and the `X-Robots-Tag` header, allows all in robots.txt, writes `sitemap.xml`, and uses the domain in canonical, Open Graph and JSON-LD URLs.
7. Check:
   - `curl -sI https://<domain>/ | grep -i -E "x-robots|content-security"` shows the CSP and **no** X-Robots-Tag.
   - `curl -sI https://nazir-and-company.pages.dev/about/` returns `301` to `https://<domain>/about/`.
   - `https://<domain>/robots.txt` lists the sitemap; `https://<domain>/sitemap.xml` lists the pages.
   - Run the QA gate against the live build: `SITE_MODE=live PUBLIC_SITE_URL=https://<domain> npm run qa`.
8. Add the site to Google Search Console (domain property, DNS verification) and submit `https://<domain>/sitemap.xml`.
9. Turn on **Web Analytics** for the Pages project (cookieless). The CSP already allows it.

## 4. Adding phones, email or WhatsApp

Edit `src/data/contact.json`:

```json
"phones": ["+92 42 0000 0000"],
"emails": ["info@<domain>"],
"whatsapp": "+92 300 0000000"
```

Commit and push. They appear in the footer, on the contact page and in the capability statement. Empty lists show nothing.

## 5. Every later change

Commit, `npm run qa`, push to `main`. The workflow re-runs the QA gate and deploys only if it passes. The previous deployment stays available for rollback.
