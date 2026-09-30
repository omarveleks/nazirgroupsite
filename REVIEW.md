# Review checklist

For the company's review before the site goes public.

**Review address:** https://nazir-and-company.pages.dev
While in review mode the site tells search engines not to index it (noindex on every page and in robots.txt), so it can be shared privately.

How to use this list: open each page on a phone and on a computer, read every sentence and every figure, and note anything wrong, missing or not to be published. Every figure comes from the two company profiles; `src/data/facts.md` gives the page it came from.

## Intentionally missing (added later)

- **Phone numbers, email address and WhatsApp.** None are shown yet. When supplied, they are added in one file (`src/data/contact.json`) and appear everywhere automatically.
- **Domain.** The site runs on the free pages.dev address until the domain is bought (GO_LIVE.md).
- **Enquiry form destination.** The form is built but shows "Form not yet connected" until a mailbox is set.
- **Contract values of smaller projects.** Values are shown only for the seven projects listed above Rs 2 billion (or the equivalent), as printed in the company profile.
- **Project photographs.** The photos show the type of work, not specific company projects; project pages say so. Real project photos can replace them one by one.
- **Client logos.** Saudi Electricity Company and Tenaga Nasional show their logos; the other seven clients show their names until official logo files are supplied.
- **Registration details.** Only "Pakistan Engineering Council, Licence No. 1" and "Pre-qualified: NHA, WAPDA" are shown. Categories and enlistment letters are no longer listed.
- **Equipment list, tax number, bank details, PEC certificate scan and dates.** Deliberately never published.

## Page by page

The site follows the approved v7 design: white pages, large light headlines, full-width photographs, corporate blue for buttons and active states.

### Home (`/`)
- [ ] Hero: "Powering Nations Since 1958", with the project card (Benghazi–eastern border, Makkah/Taif/Madinah, Barotha–Rewat, Nasiriya–Baghdad).
- [ ] Figures band: 1958; 7 countries; 500 kV; PEC Licence No. 1.
- [ ] Capabilities list (five items), featured projects (six cards), Libya band, heritage timeline by decade.
- [ ] Global presence rows, "Discover" tiles, clients grid and registration row.
- [ ] "Let's Build What's Next": Partner With Nazir and Build Your Career cards.

### Projects (`/projects/`) and country pages (`/projects/pakistan/` etc.)
- [ ] Country cards and the "All countries" project list with search and filters.
- [ ] Pakistan is split into "NTDC/WAPDA (national grid)" and "Regional and provincial works".
- [ ] Project names, clients, years, voltages and lengths match the company's records.
- [ ] Place names use one spelling (for example Tarbela, Samnu, Sirte, Junjung, Dukan). See the list in facts.md, section 10.
- [ ] Current client names: "NGC (formerly NTDC)", "Saudi Electricity Company (formerly SCECO)", "GECOL (formerly ELPCO)", "National Highway Authority (formerly National Highway Board)", "Pakhtunkhwa Highways Authority (formerly Frontier Highway Authority)".
- [ ] Filters (sector, voltage, client, decade) and search work on a phone.

### A project page (for example `/projects/libya/benghazi-eastern-border-220-kv-double-circuit-lines-750-km/`)
- [ ] Facts grid: client, country, region, year, voltage, length, role, sector.
- [ ] Role is shown only where the profile states it (joint-venture shares, turnkey contracts, work for another contractor).
- [ ] Source line (profile and page).
- [ ] Contract value, on the seven largest projects only, in the original currency and year: Ghazi-Barotha (Rs 15,898.26 million, joint-venture contract), M-3 motorway (Rs 7,290 million, joint-venture contract), Barotha–Rewat (Rs 2,608 million), Makkah/Taif/Madinah distribution (SR 288,000,000), Makkah/Taif/Madinah 380/110 kV (SR 112,598,244), Benghazi–eastern border (LD 151 million), Samnu–Sebha (LD 28.65 million).

### Libya (`/libya/`)
- [ ] Wording: "For over three decades, Nazir and Company built the backbone of Libya's power network ... Today the company is positioned to play a central role in the next chapter of Libya's grid."
- [ ] Featured lines: Samnu–Sebha, Benghazi–eastern border, Hun–Wadi Arial–Samnu, Misurata–Sirte and the Tripoli ring, and the oil-field works.
- [ ] "Working With Main Contractors": five scope items and documents on request.
- [ ] The enquiry button opens the form with "Main contractor subcontract enquiry" and Libya pre-filled.

### Services (`/services/`)
- [ ] Seven services, each with recent example projects and a photo marked "illustration".

### Capabilities (`/capabilities/`)
- [ ] Five capabilities; registration: "Pakistan Engineering Council, Licence No. 1" and "Pre-qualified: NHA, WAPDA".
- [ ] Equipment: "access to a large fleet of construction and stringing equipment, and can mobilise it per project" (no list).

### About (`/about/`) and Leadership (`/leadership/`)
- [ ] Heritage: founded 1958, incorporated 12 August 1972, PEC Licence No. 1; decade timeline.
- [ ] Director: Sheikh Tanveer Ahmed. Bio: joined 1985; Director in Libya 1987–2002; Director in Saudi Arabia 2004–2014; graduate of the University of Houston, Texas. **Please supply the degree.**
- [ ] Founder: Alhaj Sheikh Nazir Ahmed (1930–2005).
- [ ] Advisers: Syed Imran Hassan, Khalid Mehmood (telecommunication), Engr. Muhammad Yousaf Barakzai (civil works), Behram Shahrokh Aslam.
- [ ] Six engineers shown out of the eleven on the PEC licence.

### Global presence (`/global-presence/`)
- [ ] Map and country rows. The United Kingdom is shown only as a historic branch office.

### Downloads (`/downloads/`)
- [ ] Open all three PDFs: company profile (nine pages), capability statement (one page) and project list.
- [ ] Company profile: every page, especially the Director bio, the selected projects and their values.

### Contact (`/contact/`)
- [ ] Enquiry types: Client, Main contractor subcontract enquiry, Partnership, Careers, Other.
- [ ] Address: 100 Abu Bakr Block, New Garden Town, Lahore.

### Privacy, Accessibility, 404
- [ ] Wording acceptable.

## Questions to answer

See the final list in the hand-over message and `data/OPEN_ITEMS.md`.
