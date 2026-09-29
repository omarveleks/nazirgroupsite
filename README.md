# Nazir and Company website

Static website for Nazir and Company (Pvt) Ltd, Lahore: electrical and civil engineering contractor since 1958.
Built with Astro (static output), TypeScript and plain CSS. Hosted on Cloudflare Pages, with one Pages Function for the enquiry form.

## Commands

| Command | What it does |
|---|---|
| `npm ci` | Install dependencies (Node 22) |
| `npm run dev` | Local development server |
| `npm run build` | Build to `dist/` (`SITE_MODE=review` by default; `SITE_MODE=live` for the public site) |
| `npm run preview` | Serve `dist/` on http://localhost:4321 with the production headers |
| `npm run check` | TypeScript and Astro type check |
| `npm run qa` | Release gate: builds live and review versions and runs every check (see QA_REPORT.md). Must pass before any deploy |
| `npm run data` | Regenerate `src/data/projects.json` from the transcription in `scripts/build-projects.py` |
| `npm run assets` | Regenerate the Open Graph image and favicons |

## Where things are

- `src/data/projects.json`: single source of truth for every project (schema in CLAUDE.md, section 5). All registers, counts, maps, figures and the PDFs are generated from it.
- `src/data/company.json`, `engineers.json`, `contact.json`: company facts, people, enlistments, contact details (phones and emails render only when present).
- `src/data/facts.md` (also `data/facts.md`): every fact with its source page or URL.
- `data/OPEN_ITEMS.md`: conflicts, withheld facts and questions for the company.
- `src/data/image-credits.json`: internal record of image sources (never published).
- `source/`: the two company profiles the content is taken from (not published).
- `functions/`: Cloudflare Pages Functions (enquiry form, pages.dev redirect).
- `scripts/postbuild.mjs`: writes `_headers` (CSP and security headers), `robots.txt`, `sitemap.xml` (live only) and `_routes.json`.
- `scripts/qa/`: the QA gate.
- `REVIEW.md`: review checklist for the company. `GO_LIVE.md`: deploy, form and domain steps.
