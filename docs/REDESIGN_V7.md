# Prompt for Claude Code: restyle the site to match nazir-homepage-v7.html

Paste everything below into Claude Code, and attach `nazir-homepage-v7.html` to the same message.

---

Restyle the whole site to match the attached `nazir-homepage-v7.html`. It is the approved design, modelled on bechtel.com and groupmaire.com. It should feel like a large infrastructure company: calm, spacious and confident, not technical. Copy its CSS tokens, spacing, type and components into the Astro project, and apply them to every page.

**Keep everything already built:** `projects.json`, `facts.md`, `company.json`, `engineers.json`, the sourced photos and logos, routes, the contact form, deployment, QA scripts and the content rules in `CLAUDE.md`. **Do NOT redo research, re-read the PDFs, or re-source images.** Change only the design, layout, components and copy tone. The preview uses sample text; use real data from the data files, and take counts from `projects.json`.

## Design rules
- **Space:** section padding of about 180–240 px on desktop and 100–130 px on mobile. Large empty areas are intentional. Text columns stay narrow (40–46 characters). Never fill space with extra elements.
- **Type:** Inter Tight **Light (300)** for headlines, in sentence case and large (up to 112 px), in the Bechtel style. Use Inter Tight **Regular (400) UPPERCASE** only for Maire-style statements, one per page at most, on white. Body text is Inter Light (300), 17 px, in grey `#5F6B77`. Use Instrument Serif italic for at most one accent word per page (e.g. "Back to *Libya*"). JetBrains Mono is only for small light-blue location tags on cards. Never use bold headlines.
- **Colour:** white-first. Ink `#0B1B2E`, slate text `#2C3A48`, rules `#E3E6EA`, corporate blue `#1F4FB8` (tint `#E7EEFB`) for the round arrow buttons, the MENU block and active states, and footer `#14232F`. **No orange or amber anywhere.** Warm or sunset photos get the navy monochrome grade used in the preview.
- **Tone of copy:** strong, corporate and confident, like a large international contractor. Never signal weakness or need. Banned phrasing includes "small", "seeking", "looking for", "can request", "open to", and "has engineers" as a selling point. Lead with delivery, scale, clients and terrain. Keep jargon off the Home, About and Libya pages; technical detail (voltage, length, client) stays on project pages. Third person only, with no "we", "our" or "us". Reuse the homepage copy in the preview word for word.
- **Registrations:** show ONLY "Pakistan Engineering Council, Licence No. 1" and generic pre-qualification with NHA, NTDC and WAPDA. Never show categories, grades, years or minor enlistments (DHA, PKHA, provincial departments).

## Components (copy from the preview)
- **Header:** a solid ink bar (Maire style), 84 px tall and sticky. The logo sits in its own cell with a vertical divider. The links run across full height with a 3 px blue underline on hover. On the far right is a solid blue full-height "MENU" block with lines. On mobile, show the logo and the MENU block only; it opens a full-screen ink panel.
- **Hero:** a full-screen photo with a gradient from the left and a large light headline. Below it, a round blue arrow link. On the right, a white project card with a stacked shadow card behind it, arrows and a progress bar. On mobile the card sits below the text and drops its image.
- **Maire statement:** a huge uppercase line on white, a hairline rule, a paragraph on the left and an ink pill button on the right.
- **Bechtel two-column:** headline, text and arrow link on the left; a rounded photo on the right over a dot grid.
- **Full-bleed photo bands:** about 900 px tall, with the headline bottom-left and the text and link bottom-right.
- **Featured projects:** a horizontal scroll-snap row of tall rounded photo cards, each with an light-blue mono country tag, a title and a round arrow, plus a "1 – 3 of N" control.
- **Legacy timeline:** story text and the founder and Director portraits on the left. On the right, a decade selector (pills from the 1950s to the 2020s) and a large photo card that changes with the decade. Use the milestones from `facts.md`.
- **In figures:** 1958, 187, 7 and 750 km in extra-light numerals.
- **Capabilities:** 5 numbered rows, each with a round arrow that fills blue on hover.
- **Global presence:** country rows in two columns.
- **Selected clients:** set as text or greyscale logos.
- **Registration row:** PEC Licence No. 1, NHA, and NTDC & WAPDA.
- **CTA:** "PARTNER WITH NAZIR AND COMPANY" in Maire-style uppercase, a rule, text and a pill button.
- **Footer:** a five-column dark footer with the logo.


## v7 additions (references: Bechtel, Maire, Burns & McDonnell, Turner, AECOM)
- **Copywriting:** Bechtel/Turner style. Headlines are short and in Title Case ("Powering Nations Since 1958", "Delivering the Infrastructure Nations Run On", "Built for the World's Toughest Terrain", "A Legacy of Delivery in Libya", "Six Decades of Delivery", "Let's Build What's Next"). Body copy is confident and outcome-led. Never list project counts or year ranges as selling points ("48 projects between…", "187 projects"). Never explain commercial positioning ("as contractor and as partner…"). Never mention the founder or Director on the Home page; they belong on About and Leadership. Reuse the v7 copy word for word.
- **No monospace anywhere.** Decade selectors and tags use Inter Tight.
- **Burns & McDonnell about block:** a photo on the left overlapping into a full-width blue stats band (1958 · 7 countries · 500 kV · PEC No. 1).
- **Capabilities:** a Bechtel-style interactive list on the left (large light titles, the active item with a blue edge) and a large photo panel on the right that changes on hover or click.
- **Photo for the terrain band:** a desert transmission photo. The preview uses "Overhead power lines in Qatari desert" (Wikimedia Commons). Replace it with a licensed or real Nazir desert photo if one is available.
- **Turner details:** thin vertical grid lines behind white sections (desktop only). Secondary links are "UPPERCASE LABEL ⟶" with a long thin blue arrow. The nav has an extra "Partner With Nazir" cell before the MENU block.
- **AECOM mosaic:** a "Discover Nazir and Company" tile grid (7/5 and 6/6 columns) with white label chips (Region, Capability, Project, People, Company).
- **Clients:** a logo grid (3 × 3, greyscale, colour on hover). Source official logo files for GECOL, NTDC, WAPDA, NHA, Arabian Gulf Oil, Sirte Oil and Waha Oil from their official sites. The preview has real logos only for Saudi Electricity Company and Tenaga Nasional; the others are temporary text marks.
- **Let's Connect:** a Burns-style photo band with two white cards, "Partner With Nazir" and "Build Your Career".
- **Global presence:** each country row shows a capability descriptor, not a project count.

## Apply the design to every page (routes unchanged)
- **Projects:** a Maire statement, then country cards as a featured-style row, then a clean list with filters. Each country page has a photo hero and project rows. The project page has a photo hero, a large light title, a simple facts grid and "More from [country]".
- **Libya:** a photo band hero, the story, featured Libya projects, and a "Working with main contractors" section in the two-column style.
- **About:** the legacy timeline, then Leadership (Director and four advisors, rounded portraits), then selected engineers.
- **Services, Capabilities, Downloads, Contact:** the same components with lots of space. The form has large, clean fields and an ink pill submit button.

## Performance and quality (must pass)
- No video.
- CSS-only motion (0.3–1 s hovers) plus a tiny script for the carousels. No autoplay. Respect `prefers-reduced-motion`.
- JS under 40 KB.
- Self-host the fonts as WOFF2 subsets with metric-matched fallbacks.
- Serve images as AVIF or WebP with `srcset`, preload the hero image, and lazy-load everything else.
- CLS must be 0.
- Mobile Lighthouse targets: Performance 95 or higher, Accessibility 100. Text over photos must pass 4.5:1 contrast.
- No horizontal scroll at any width from 320 px up.

## Done when
- `npm run qa` passes.
- Screenshots at 390 px and 1440 px of Home, Projects, one country page, one project page, Libya and About are saved in `qa/`.
- The site is redeployed to the same Cloudflare Pages project.
- Your reply is a 5-line summary with the link. Start no new research.
