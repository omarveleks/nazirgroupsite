# Review checklist

For the company's review before the site goes public.

**Review address:** `https://nazir-and-company.pages.dev` (live once the Cloudflare deploy in GO_LIVE.md, step 1, has run).
While in review mode the site tells search engines not to index it (noindex on every page and in robots.txt), so it can be shared privately.

How to use this list: open each page on a phone and on a computer, read every sentence and every figure, and note anything wrong, missing or not to be published. Every figure comes from the two company profiles; `src/data/facts.md` gives the page it came from.

## Intentionally missing (added later)

- **Phone numbers, email address and WhatsApp.** None are shown yet. When supplied, they are added in one file (`src/data/contact.json`) and appear everywhere automatically.
- **Domain.** The site runs on the free pages.dev address until the domain is bought (GO_LIVE.md).
- **Enquiry form destination.** The form is built but shows "Form not yet connected" until a mailbox is set.
- **Contract values of smaller projects.** Values are shown only for the seven projects listed above Rs 2 billion (or the equivalent), as printed in the company profile.
- **Project photographs.** No photo is yet confirmed to show a company project. The Services page uses four general photos marked "illustration".
- **Client logos.** Client names are shown in text in the "Clients served" lists.
- **Equipment list, tax number, bank details, PEC certificate scan and dates.** Deliberately never published.

## Page by page

### Home (`/`)
- [ ] Headline: 750 km of 220 kV line, Benghazi to the eastern border, 2001.
- [ ] Four figures: founded 1958; 187 projects documented; 7 countries; 43 years of documented projects (1977–2020).
- [ ] The six selected projects are the right ones to lead with.
- [ ] Libya call-out wording: "Historic record in Libya (48 projects, 1978–2011). Now seeking electrical projects and subcontracts in Libya."
- [ ] Client names in "Clients served" are correct and may be shown.

### Projects (`/projects/`) and country pages (`/projects/pakistan/` etc.)
- [ ] Country tiles: counts and year ranges.
- [ ] Pakistan is split into "NTDC/WAPDA (national grid)" and "Regional and provincial works".
- [ ] Project names, clients, years, voltages and lengths match the company's records.
- [ ] Place names use one spelling (for example Tarbela, Samnu, Sirte, Junjung, Dukan). See the list in facts.md, section 10.
- [ ] Current client names: "NGC (formerly NTDC)", "Saudi Electricity Company (formerly SCECO)", "GECOL (formerly ELPCO)", "National Highway Authority (formerly National Highway Board)", "Pakhtunkhwa Highways Authority (formerly Frontier Highway Authority)".
- [ ] Filters (sector, voltage, client, decade) and search work on a phone.

### A project page (for example `/projects/libya/benghazi-eastern-border-220-kv-double-circuit-lines-750-km/`)
- [ ] Title block: client, country, region, year, voltage, length, role, sector.
- [ ] Role is shown only where the profile states it (joint-venture shares, turnkey contracts, work for another contractor).
- [ ] Source line (profile and page).
- [ ] Contract value, on the seven largest projects only, in the original currency and year: Ghazi-Barotha (Rs 15,898.26 million, joint-venture contract), M-3 motorway (Rs 7,290 million, joint-venture contract), Barotha–Rewat (Rs 2,608 million), Makkah/Taif/Madinah distribution (SR 288,000,000), Makkah/Taif/Madinah 380/110 kV (SR 112,598,244), Benghazi–eastern border (LD 151 million), Samnu–Sebha (LD 28.65 million).
- [ ] Sialkot Airport III-A-3, Sambrial–Dhanawali road and TMP-BWP fencing now appear as separate projects for each year.

### Libya (`/libya/`)
- [ ] 48 projects, 1978–2011, split by client group.
- [ ] Map: places and the schematic 220 kV routes.
- [ ] Four flagship lines.
- [ ] "Working with main contractors": scope, engineers, mobilisation, documents on request.
- [ ] The enquiry button opens the form with "Main contractor subcontract enquiry" and Libya pre-filled.

### Services (`/services/`)
- [ ] Seven services, each with the number of documented projects and recent examples.
- [ ] Four general photos (towers, substation, hydropower channel, pipelines), each captioned "illustration".

### About (`/about/`)
- [ ] Timeline stations from 1958 to 2020.
- [ ] Founder section: Alhaj Sheikh Nazir Ahmed (1930–2005), with his portrait.
- [ ] "Today" section.

### Leadership and team (`/leadership/`)
- [ ] Director: Sheikh Tanveer Ahmed. Bio: joined 1985; Director in Libya 1987–2002; Director in Saudi Arabia 2004–2014; graduate of the University of Houston, Texas. Portrait from the 2023 profile. **Please supply the degree.**
- [ ] Advisers: Syed Imran Hassan, Khalid Mehmood (telecommunication), Engr. Muhammad Yousaf Barakzai (civil works), Behram Shahrokh Aslam.
- [ ] Six engineers shown out of the eleven on the PEC licence.
- [ ] Portraits of the Director, founder and advisers; engineers have line-art placeholders.

### Capabilities and compliance (`/capabilities/`)
- [ ] PEC statement: "Registered with the Pakistan Engineering Council, Licence No. 1, category C-A (no limit)".
- [ ] Enlistments with the year of each letter.
- [ ] Equipment: "access to a large fleet of construction and stringing equipment, and can mobilise it per project" (no list).

### Global presence (`/global-presence/`)
- [ ] Map and country table. The United Kingdom is shown only as a historic branch office.

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
