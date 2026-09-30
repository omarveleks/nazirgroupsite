# Nazir and Company website: build brief

Read this whole file first. All decisions are made. Ask Omar only if something under "Open items" blocks you, and batch those questions into a single message.

## 1. Goal
A fast, credible, English-only website for **Nazir and Company (Pvt) Ltd**, an electrical and civil engineering contractor in Lahore, founded 1958. Primary job: convince main contractors, procurement managers and clients (Libya, Gulf, Pakistan) that the company has a real, verifiable record, and make it easy to get in touch and download a company profile. Audience is balanced: about half project owners and clients, half main contractors and partners.

Brand is **Nazir only**. "Nazcon" is a dead name. Do not use it anywhere on the site, in code, in filenames or in image alt text. Ignore Nazcon colours (green) and its logo.

## 2. Content rules (non-negotiable)
1. Every number, date, client, voltage and length must come from the two source PDFs in `source/` (Nazir_and_Sons_profile.pdf, Second_profile.pdf) (page cited in `data/facts.md`), or from an original client/primary source found by web search (URL cited). Nothing unsourced ships. If a fact conflicts between sources, use the primary source; if there is none, leave the fact out and list it in `data/OPEN_ITEMS.md`.
2. Never publish: NTN number, PEC certificate scan or its dates, equipment list, tax or bank details, Nazcon-only claims (solar, oil and gas, manpower supply) that have no documentary evidence.
3. PEC: state "Registered with the Pakistan Engineering Council, Licence No. 1, category C-A (no limit)". No expiry date.
4. Equipment: no list. Say only that the company has access to a large fleet of construction and stringing equipment, and can mobilise it per project.
5. Libya status wording: "Historic record in Libya (48 projects, 1978–2011). Now seeking electrical projects and subcontracts in Libya." Do not claim a current office or current contracts there.
6. Contract values: show only for flagship projects, and only after verifying against an original client source. Otherwise show client, country, year, voltage, length, scope. When a value is shown, print it in its original currency and year. Never convert or mix currencies.
7. Director: **Sheikh Tanveer Ahmed**. Founder: Alhaj Sheikh Nazir Ahmed (1930–2005). Incorporated 12 August 1972. Founded 1958.
8. Voice: third person institutional ("Nazir and Company has…", "The company…"). No "we/our/us". Short sentences. No slogans without a fact behind them.
9. Address: 100 Abu Bakr Block, New Garden Town, Lahore. **Publish no phone numbers and no email address for now** (Omar will add them later). Contact details live in `src/data/contact.json` with `phones: []`, `emails: []`, `whatsapp: null`; every component that shows them renders nothing when empty (no empty labels, no dead `tel:`/`mailto:` links), so adding a number later is a one-line data change that appears everywhere. Never publish the yahoo address.

## 3. Design: "The Corridor"
Concept: the site reads like a route survey along a transmission line. Engineering-drawing language: fine lines, title blocks, grid ticks, kV and km figures in monospace.

- Colours: ink navy `#0B1F3A`, paper `#F6F3EC`, amber `#E0A100` accent, text `#14202E`, muted `#5B6773`. Define as CSS variables. Check contrast: body text at least 4.5:1.
- Type (self-hosted, `font-display: swap`, subset to Latin): heritage serif for headlines (Fraunces or Newsreader), clean sans for body (Inter or IBM Plex Sans), mono for figures (IBM Plex Mono).
- Logo: recreate the house-roof outline plus "NAZIR" as clean SVG from the profile. Use one colour, works on navy and paper.
- Hero: one static inline SVG of a 220 kV tower and conductors, drawn in fine lines. Headline anchored on a real fact (the 750 km Benghazi–eastern border 220 kV line, 2001). Below it, four count-up-free static figures: founded 1958, projects documented (compute from data), countries (compute), years of record (compute).
- Imagery: real photos (section 6) in duotone-free, natural colour, with thin frame lines and caption title blocks. Drawings and maps between them. No stock photos.
- **Performance and motion (hard limit):** no scroll-jacking, no parallax, no large animated libraries, no video autoplay, no Lottie. Allowed: CSS-only transitions of 150–200 ms on hover/focus, one 600 ms fade-in on hero SVG, and `prefers-reduced-motion` respected. JS budget under 40 KB gzipped for the whole site. Lighthouse targets on mobile: Performance ≥ 95, Accessibility 100, Best Practices ≥ 95, SEO 100. LCP under 2.0 s on 4G.
- Mobile first: design at 360 px, then scale up. Tap targets ≥ 44 px. The project register becomes stacked cards on phones.

## 4. Stack and architecture
- Astro (static output), TypeScript, plain CSS with variables (no Tailwind needed), no UI framework. Small vanilla JS islands only for register filtering and the mobile menu.
- Hosting: Cloudflare Pages. Contact form via a Cloudflare Pages Function with Turnstile and a rate limit; sends email through the provider set in env vars (`MAIL_API_KEY`, `MAIL_TO`). Do not hard-code secrets.
- Single source of truth: `src/data/projects.json` (schema in section 5). All pages that list projects are generated from it. Also `src/data/company.json` (facts, people, enlistments) and `src/data/facts.md` (each fact with source: PDF name and page, or URL).
- Static generation of one page per country (`/projects/[country]/`) and one per project (`/projects/[country]/[slug]/`). Country slugs: lowercase, hyphenated. The Libya page, Global presence map and Home regions strip all link into these country pages.
- Sitemap, robots.txt, canonical URLs, Open Graph images (generated from the SVG hero), JSON-LD `Organization` and `LocalBusiness`, favicon set.
- No cookies, no analytics beyond Cloudflare Web Analytics (cookieless).

## 5. Sitemap and pages
1. **Home**: hero, four figures, "Selected projects" (6 flagship), regions strip, Libya call-out for contractors, download-profile button, contact strip.
2. **About**: 1958 to today timeline (route-profile layout), founder page section, incorporation 1972, what the company is today. Values only if documented.
3. **Services**: overhead transmission lines (66 kV to 500 kV/HVDC), substations and grid works, distribution 11–66 kV, industrial and oil-field electrical, hot-line maintenance, civil and infrastructure works (only categories with documented projects). Each service links to filtered projects.
4. **Projects** (country-first): `/projects/` opens with one large tile per country (Pakistan, Saudi Arabia, Libya, Iraq, Iran, Malaysia, Mozambique, plus any others found), each showing project count, year range and a small line-art route marker. Order tiles by project count, but keep Libya second-to-none in prominence on the Libya page. Below the tiles: a global search box and an "All countries" toggle.
   - **Country pages** `/projects/[country]/` (e.g. `/projects/libya/`): the country's projects as a register table, newest first, with filters for sector, voltage, client and decade, plus live count. Pakistan is sub-grouped into "NTDC/WAPDA (national grid)" and "Regional and provincial works".
   - Every project belongs to exactly one country. Multi-country or unknown-country items are assigned by where the work was executed; note ambiguities in `OPEN_ITEMS.md`.
5. **Project page** (title-block layout) at `/projects/[country]/[slug]/`: name, client, country, year, voltage, length, role (main or JV), scope, image if available, source note, and "more from [country]" links. Breadcrumb: Projects › Country › Project.
6. **Libya**: dedicated page. Track record: 48 projects on a map and list (GECOL, ELPCO, S.O.E., GEC, Arabian Gulf Oil, Sirte Oil, Waha Oil). Flagships: Semnu–Sebha 220 kV D/C twin-bundle (2011), Benghazi–eastern border 750 km 220 kV turnkey (2001), Hun–Wadi Arial–Samno 220 kV (1989), Misurata–Sirt and Tripoli ring 220 kV (1980). "Working with main contractors" block: what the company offers as an electrical subcontractor (scope categories, engineers, mobilisation, documents available on request). Enquiry button pre-selects "Libya subcontract".
7. **Global presence**: world map with countries and counts (Pakistan, Saudi Arabia, Libya, Iraq, Iran, Malaysia, Mozambique, UK if documented), year range per country.
8. **Capabilities and compliance**: PEC registration, enlistments with the year they applied (Punjab Irrigation Cat A, DHA Lahore, NHA, KP C&W, PKHA, Punjab HUD&PHE), engineers, quality/HSE only if documented. Downloadable documents on request. Do not show expiring items as current if they carry dates; use "Enlisted with … (year)".
9. **Leadership and Team**: three blocks only.
   - **Director: Sheikh Tanveer Ahmed.** Portrait slot, name, title, a short bio (3–5 sentences). Facts supplied by Omar (use as given): with the company since 1985; Director in Libya 1987–2002; Director in Saudi Arabia 2004–2014. Education: Omar believes it is the University of Toledo or the University of Houston, and it is in the profile. Find it in the PDFs (image-only, read visually), publish the degree and university only as the profile states it, and if it cannot be confirmed leave education out and list it in the final question batch. Do not guess between the two. Further bio facts come only from the two PDFs or verifiable sources (projects led, qualifications). Search both PDFs for everything about him. Do not invent career details. If the sources give too little, write a 2-sentence factual bio and list the missing facts in the final question batch. Include the founder tribute (Alhaj Sheikh Nazir Ahmed, 1930–2005) as a short section beside it.
   - **Key advisors:** Syed Imran Hassan; Khalid Mehmood (telecom); Engr. Muhammad Yousaf Barakzai (civil); Behram Shahrokh Aslam. Name, discipline, one line each from the profile.
   - **Engineers:** a selection from the profile's PEC-registered engineers list (11 names; the PDF is image-only, so read that page visually or OCR it). Show up to 6: those with the most senior or relevant electrical experience per the profile. Name, discipline, one-line role. Store the full list in `src/data/engineers.json`, but render only the selection, with a note that the full technical team is available on request.
   - Never publish individual PEC registration numbers, CNICs, phones or emails. No photos unless Omar supplies them; use a neutral line-art placeholder.
   - Do not state a total headcount.
10. **Downloads**: company profile PDF (Omar supplies), project list PDF (generate from `projects.json` at build time), capability statement (1 page, generate).
11. **Contact**: form with type selector (Client / Main contractor subcontract enquiry / Partnership / Careers / Other), country, project details, file upload up to 5 MB; address and map link (phones/emails only if present in `contact.json`); no map embed (keep fast).
12. Utility: privacy note, accessibility statement, 404.

Navigation: Projects, Services, Libya, About, Capabilities, Contact. Footer carries global presence and downloads.

### `projects.json` schema
`id, slug, name, client, country, region, sector (transmission|substation|distribution|industrial|oil-and-gas-electrical|civil|other), voltage_kv, length_km, year_start, year_end, role (main|jv|sub|unknown), scope, value {amount, currency, year, verified: bool}, flagship: bool, images: [], source {pdf, page, url}, notes`.

## 6. Photos
Omar authorised using photos that appear in web searches for **"nescon libya"** and **"nazir and company pakistan"**, plus images in the two profile PDFs, and (Omar's later instruction) any other suitable photos found through Google image search.
1. Extract PDF images: `pdfimages -png` from both PDFs (about 164 and 37 usable images). Discard: duplicates, screenshots, low resolution (under 800 px wide), watermarked stock, anything with visible third-party branding, and anything Nazcon-branded.
2. Search both queries. Prefer images on the original owner's pages (client, project or news sites). For each image kept, record in `src/data/image-credits.json`: file, page URL, owner/publisher, date fetched, and whether it depicts a Nazir project (confirmed by caption/context) or is generic. Never label a generic photo as a Nazir project.
3. Only use a photo in a project page if the source confirms it shows that project. Otherwise use it only on generic sections with an honest caption ("Overhead line construction") or not at all.
4. Optimise: WebP and AVIF, sizes 480/960/1600, `srcset`, explicit width and height, lazy loading, hero image excepted. Add real alt text.
5. Omar confirms the company has bought the rights to all images. Do NOT build a credits page, footer credit line or on-image attribution, and do not add credits for Google-sourced photos either (Omar's explicit instruction). Keep `src/data/image-credits.json` as an internal build-time record only (not linked, not rendered on the site, excluded from the sitemap) so any image can be traced or removed later.

### Client logos and names (Omar's decision)
- Show client names on project pages and register rows, and show a **"Clients"** logo strip on the Home page and on the Projects page (and on each country page for that country's clients). Only clients documented in the PDFs (GECOL, ELPCO, WAPDA/NTDC, S.O.E., GEC, Arabian Gulf Oil Co, Sirte Oil, Waha Oil, Saudi clients, Consorzia Italia, etc.).
- Source each logo from the client's own site or official material; store as SVG where possible, greyscale on paper background (colour on hover only where no motion cost), uniform height (max 40 px), `alt` = client name, `loading="lazy"` below the fold. Use current client names with "(formerly \u2026)" only in text, not on logos. If a client's logo cannot be found in decent quality, show its name in text in the strip instead. Phrase the heading as "Clients served" (factual), never "trusted by" or partnership/endorsement language.

## 7. Research tasks (do before writing copy)
1. Read both PDFs fully. Build `facts.md`. Nazcon PDF content is used only where it documents civil projects; merge those into `projects.json` as Nazir projects, tagged `sector: civil`, and verify each online.
2. For each Libya project and each flagship, search for the original client or primary source (GECOL, ELPCO, Arabian Gulf Oil, Sirte Oil, Waha Oil, WAPDA/NTDC, Saudi Electricity Co, Consorzia Italia for Mozambique HVDC). Record URL and whether it confirms the project. Where no primary source exists, keep the project (it is in the company's own records) but do not add extra detail beyond the PDF.
3. Reconcile conflicts: contract value currencies (Rs million vs USD million), project counts, dates. Prefer the Nazir profile; record the conflict in `OPEN_ITEMS.md`.
4. Spelling: use one spelling per place/client (the client's own official spelling). Do NOT show alternate spellings or aliases anywhere, including search; resolve conflicts silently to the client-source spelling and log them in `OPEN_ITEMS.md`.
5. Find the current status of named clients (e.g. ELPCO now GECOL) and use current names with "(formerly …)".

## 8. Deployment (Omar's decision: upload to Cloudflare immediately, add the domain tomorrow after his father reviews)
1. **Deploy to Cloudflare Pages as soon as the first complete build passes `npm run qa`**, on the free `<project>.pages.dev` address. Do not wait for the domain, mailbox, phones or Omar's father's review. Use `wrangler pages deploy dist` (install wrangler; if not logged in, run `wrangler login` and ask Omar once to approve in the browser, or ask for a Cloudflare API token with Pages:Edit and store it only in the environment, never in the repo).
2. **Review mode until approved:** while on `pages.dev`, send `X-Robots-Tag: noindex, nofollow` (via `_headers`), a `noindex` meta tag, and `Disallow: /` in robots.txt, and omit the sitemap, so the unreviewed site is not indexed by Google. Use a build flag `SITE_MODE=review|live` to switch. In review mode the canonical URLs and Open Graph URLs point at the pages.dev address.
3. Give Omar the live link and a short review checklist for his father (`REVIEW.md`: what to check on each page, plus the list of things intentionally missing: phones, email, domain).
4. **Going live (tomorrow):** Omar buys the domain (check `nazirandco.com`, `nazirgroup.com`, `nazir.com.pk`, `nazirco.com` in that order). Claude Code then attaches it in Cloudflare Pages (Custom domains), sets `SITE_MODE=live`, `PUBLIC_SITE_URL`, canonical/OG/sitemap/JSON-LD URLs, removes noindex, redirects pages.dev to the domain (301), and re-runs `npm run qa` against the live URL. Provide `GO_LIVE.md` with the exact steps so this takes minutes.
5. Contact form: built now, with destination `MAIL_TO` set later. Until it is set, the review site's form must show a plain "Form not yet connected" notice instead of pretending to send; the go-live step is blocked until `MAIL_TO` is set (otherwise enquiries are lost).
6. Every later change: commit, `npm run qa`, redeploy. Keep the previous Cloudflare deployment available for instant rollback.

## 9. QA gate (must all pass before saying "done")
- `npm run build` clean; no TypeScript errors.
- Script checks: no occurrences of "Nazcon", "NTN", the yahoo address, "we ", "our ", " us " in built HTML; every internal link resolves; every image has alt text and dimensions; every project has a source; no expiry dates near "PEC".
- Lighthouse mobile ≥ targets in section 3. axe: zero violations.
- Manual: 360, 768 and 1280 px screenshots of every page, read every page of copy for typos and figures against `facts.md`.
- Produce `QA_REPORT.md` with results and a list of anything left in `OPEN_ITEMS.md`.

### Zero-defect and mobile standards (added; all mandatory)
- Test on emulated real devices: iPhone SE (375×667), iPhone 14 (390×844), Pixel 7 (412×915), a low-end Android (360×640, 4x CPU slowdown), and iPad. Throttle to "Slow 4G". Use Playwright (Chromium is installed) and Lighthouse CI; keep screenshots in `qa/`.
- Core Web Vitals on mobile: LCP < 2.0 s, CLS = 0 (reserve space for every image, font and embed), INP < 100 ms, TBT < 100 ms. Total page weight under 500 KB on first load for Home, under 350 KB for other pages (excluding lazy images below the fold).
- Fonts: max 3 families, WOFF2 only, subset, preloaded, with size-adjusted fallbacks so text does not jump. No layout shift from fonts.
- Images: AVIF/WebP with JPEG fallback, correct `sizes`, width/height set, hero image preloaded, everything else lazy. No image over 200 KB delivered to mobile.
- No horizontal scroll at any width from 320 px to 1920 px. No overlapping or clipped text. Long tables become cards on mobile. Respect safe-area insets and 200% text zoom.
- Forms: work without JavaScript failing silently; clear error and success states; 16 px input font (prevents iOS zoom); correct `inputmode`, `autocomplete` and `type` for phone and email; file upload validated by type and size on client and server.
- Zero broken links, zero console errors or warnings, zero 404s in network log, zero mixed content, zero missing alt text, zero axe violations, valid HTML (W3C validator), valid JSON-LD.
- Content proofreading pass: spelling (British English), consistent names and spellings of places and clients, consistent number formats (kV, km, years), every fact traceable in `facts.md`. Run a spell-check script and read every page at 390 px width.
- Add a CI script `npm run qa` that runs all of the above and fails the build on any violation. Do not report done until it passes.
- Add security headers (CSP, HSTS, X-Content-Type-Options, Referrer-Policy, Permissions-Policy) via Cloudflare `_headers`.

## 10. Open items to ask Omar in ONE message at the end (do not stop for these)
1. Company profile PDF for the Downloads page (or approve auto-generated).
2. Photos of people/office if any (optional; Google-found photos are already allowed).
3. Domain purchased? (Mailbox for `MAIL_TO`, phones and email can wait, but the form must have a destination before public launch.)
4. Which 6 to 10 flagship projects should show values, once you have verified them.
5. Any project years, headcount, or certificates (ISO, HSE) that can be shown with evidence.
6. Confirm the shortlist of up to 6 engineers shown, and any extra facts for the Director bio (education, years, projects led) plus portrait photos.

## 11. Changes after the brief (Omar, 30 Sep 2026)
These override the sections above where they conflict.
1. **Design:** section 3 ("The Corridor") is replaced by the v7 design in `docs/REDESIGN_V7.md` (white-first, Inter Tight / Inter / Instrument Serif, corporate blue `#1F4FB8`, no amber, no monospace). The preview's photos and logos are in `source/photos/` and `source/logos/`.
2. **Copy tone:** confident and corporate; no "small", "seeking", "looking for", "can request", "open to", "has engineers"; no project counts or year ranges as selling points; no founder or Director on the Home page. Facts still come only from the sources (section 2, rule 1).
3. **Libya wording:** "Today the company is positioned to play a central role in the next chapter of Libya's grid." (replaces rule 2.5's "Now seeking" line). Still no current office or contracts claimed.
4. **Registrations:** show only "Pakistan Engineering Council, Licence No. 1" and pre-qualification (NHA, WAPDA as documented; NTDC only with a document). No categories, grades, years or enlistments.
5. **Contract values:** shown for projects listed above Rs 2 billion or the equivalent, in original currency and year (`value.show` in projects.json).
6. **Company profile PDF:** generated from the data (`src/lib/profile-pdf.ts`).
