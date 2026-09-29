# Facts register

Every figure, date, name, voltage and length on the site traces to a line in this file.

**Sources**

- **P1** = `source/Nazir_and_Sons_profile.pdf` (54 pages, scanned, image-only; read visually and by OCR). Page numbers are PDF page numbers.
- **P2** = `source/Second_profile.pdf` (16 pages, 2023). Used only for civil projects, for details of projects already in P1, for the Director's education, and for the adviser list, as the build brief allows.
- **WEB** = a web page found by search. The session's network policy blocked direct fetching of most sites, so web sources were read through search-result summaries only. Each is marked with what it confirms.

Nothing on the site uses a fact that is not listed here.

## 1. Company

| Fact | Value used on site | Source |
|---|---|---|
| Legal name | Nazir and Company (Pvt) Ltd (profile spells it "Nazir & Company (Pvt) Ltd") | P1 p.2, p.9 |
| Founded | 1958 | P1 p.4 ("founded in 1958"), P1 p.5 ("was established in 1958") |
| Founder | Alhaj Sheikh Nazir Ahmed, 1930–2005 | P1 p.5 ("Tribute to the founder, 1930 - 2005") |
| Incorporated | 12 August 1972, private company limited by shares, Companies Act 1913, Lahore | P1 p.27 (certificate of incorporation, dated August 1972, annotated "dt. 12-8-72"); P1 p.3 ("in 1972 it was incorporated as a Private Limited Company") |
| Work abroad since the 1970s | "has the honour to serve other countries ... since 1970" | P1 p.4; P1 p.5 |
| PEC registration | Licence No. 1 (printed 00001), category C-A (no limit) | P1 p.9 (general information), P1 p.12 (licence) |
| First PEC licence holder | "First licence holder from Pakistan Engineering Council (PEC)" | P1 p.2, P1 p.5 |
| Head office | 100 Abu Bakr Block, New Garden Town, Lahore | P1 p.9 |
| Historic branches abroad | Saudi Arabia, Libya, United Kingdom, Malaysia, Mozambique | P1 p.9 ("Branches abroad") |
| Pre-qualified by | NHA, WAPDA, Communication and Works Department (Govt of Punjab) | P1 p.3 |
| Projects financed by | World Bank, Asian Development Bank, Islamic Development Bank | P1 p.3 |
| Fields of work | Civil division, electrical works, telecommunication networks | P1 p.3 |
| Fields of specialisation (10) | Roads and pavements; bridge structures; marine structures; dams and water-retaining structures; oil and gas pipelines; sewerage and water supply; general civil engineering works; high-voltage installation; telecommunication installation; underground cable laying | P1 p.10 |
| Equipment | "a large fleet of equipment and machinery" (list not published) | P1 p.6 (Director's message); P1 pp.47–54 (list, withheld) |
| Libya start (related company) | NESCON "was originally working by the name Nazir Company, established in 1958 in Pakistan and in 1975 on Libyan soil" | WEB: https://nescon.com.ly/ (search summary; confirms 1975 start in Libya; not used as a Nazir project) |

## 2. Founder

| Fact | Source |
|---|---|
| Established the company in 1958 | P1 p.5 |
| Registered it as the first licence holder of PEC | P1 p.5 |
| "had the vision to serve ... in different countries in 1970s" | P1 p.5 |
| "numbers of life time achievement awards were given to him" | P1 p.5 |
| Set up schools, orphanage houses, dispensaries and hospitals; headed school boards and orphanage organisations | P1 p.5 |

## 3. Director

| Fact | Source |
|---|---|
| Sheikh Tanveer Ahmed, Director, Nazir & Company (Pvt) Ltd | P1 p.6 (signature to Director's message) |
| With the company since 1985 | Supplied by Omar (build brief, section 5.9) |
| Director in Libya, 1987–2002 | Supplied by Omar; P2 p.7 ("Resident Director of Libya for Nazir & Co.") |
| Director in Saudi Arabia, 2004–2014 | Supplied by Omar; P2 p.7 ("Resident Director in KSA for Nazir & Co.") |
| Director of Projects and Procurement | P2 p.7 |
| Graduated from the University of Houston, Texas (degree not stated) | P2 p.7. P1 has no education detail (P1 p.6 checked). |

## 4. Advisers

| Name | Line on site | Source |
|---|---|---|
| Syed Imran Hassan | Adviser ("Expert") | P2 p.15 |
| Khalid Mehmood | Telecommunication ("Telecommunication expert") | P2 p.15 |
| Engr. Muhammad Yousaf Barakzai | Civil works ("Civil works expert") | P2 p.15 |
| Behram Shahrokh Aslam | Adviser ("Expert"); electrical engineer on the PEC licence | P2 p.15; P1 p.13 |

## 5. Engineers

Eleven engineers are listed on the reverse of the PEC licence (P1 p.13) with registration number and name. Discipline is taken from the registration prefix (ELECT, ELECTRO, TELE, CIVIL, MECH, CHEM). Registration numbers are not published. Full list: `src/data/engineers.json`.

## 6. Enlistments

| Body | Detail | Year shown | Source |
|---|---|---|---|
| Irrigation Department, Govt of the Punjab | Category A (C-A), Rupees no limit | 2017–18 | P1 pp.17–18 (letter dated 3 April 2018) |
| DHA Lahore | Renewal, category C-A | 2018–19 | P1 p.19 (letter dated October 2018) |
| NHA, Central Zone | Declared a qualified bidder, periodic maintenance works | 2018 | P1 pp.20–21 (letters of 2 May 2018 and 27 August 2018) |
| C&W Department, Govt of Khyber Pakhtunkhwa | Government contractor, category PK-1 (no limit) | 2011 | P1 p.25 (dated 21-12-2011) |
| Pakhtunkhwa Highways Authority | Category A, road and bridge works up to Rs 1,000 million | 2011 | P1 p.26 (fee for the year ending 30/06/2012) |
| HUD & PHE Department, Govt of the Punjab | Category A class, no limit | 2013–14 and 2014–15 | P1 p.24 (letter dated 25 July 2014) |

Not used: P1 pp.15–16 (technical bid evaluation, issuing body not legible), P1 pp.22–23 (WAPDA 2014 letter discontinuing civil-works enlistment categories).

## 7. Projects

All projects are in `src/data/projects.json`, each with `source.pdf` and `source.page`. The lists are:

| List in the profile | Pages | Rows | Notes |
|---|---|---|---|
| Some NTDC completed projects in Pakistan | P1 p.29 | 9 | Values in Rs million |
| Some completed regional projects in Pakistan | P1 pp.30–34 | 56 | Values in Rs million. Four pairs of rows describe the same contract (see OPEN_ITEMS) and are shown once. |
| Projects completed in Saudi Arabia | P1 pp.35–38 | 42 | Values in SR. Items 36 and 37 are identical and shown once. |
| Some completed projects in Libya | P1 pp.39–43 | 48 | Values in LD million. Completion years 1978–2011. |
| Some completed projects in Iraq | P1 pp.43–45 | 23 | Values in USD thousand |
| Some completed projects in Iran | P1 p.46 | 2 | Value column "Million", currency not stated |
| Some completed projects in Malaysia | P1 p.46 | 3 | One combined value, "6,300MR" |
| Some completed projects in Mozambique | P1 p.46 | 1 | Value column "Million", currency not stated |
| Civil works (second profile) | P2 pp.11–13 | 5 added | Only rows not already in P1. No years. Values "USD (Approx)". |
| Power projects (second profile) | P2 p.14 | 0 added | Used only for line lengths of P1 projects: Barotha–Rewat 156 km, Guddu–Sibi 175 km, Peshawar–Daudkhel 122 km, Tarbela–Salt Range 174 km, Jamshoro–Karachi 130 km, Larkana–Jamshoro 257 km |

**Computed figures** (built from `projects.json` at build time, never typed by hand): number of projects documented, number of countries, year range per country, years of documented record (first to last completion year).

**Contract values** are stored exactly as printed (amount and currency) but are not rendered anywhere: none has yet been verified against an original client source (build brief rule 2.6).

**Roles.** `jv` only where the profile states a joint-venture share (M-3 motorway 10%, Ghazi-Barotha 2.4%, Makran Coastal Highway 51%). `main` only where the profile describes a turnkey contract for the owner. `sub` where the listed client is itself a contractor (Siemens, Energoinvest, Consorzio Italia 2000, Furukawa, James Scott, ITOCHU, Mitsubishi, Nippon Telecommunication Construction, IEC, EWR/MASS/N.P.C.C/Suedrohrbau). All others `unknown` (not shown).

## 8. Flagship projects: web checks

| Project | Web source | What it confirms |
|---|---|---|
| Songo–Apollo ±533 kV HVDC, 1997 | https://www.ci2000.net/r/hvdc-transmission-lines-cahora-bassa/ ; https://www.waterpowermagazine.com/analysis/cahora-bassa-comes-back-to-life/ ; https://www.tdworld.com/transmission-reliability/article/21249679/the-refurbishment-of-the-cahora-bassa-hvdc-system | Consorzio Italia 2000 held a rehabilitation contract on the Cahora Bassa HVDC line (Songo–Apollo); the scheme returned to commercial operation in October 1997. Confirms client and year context. Does not name the company. |
| Barotha–Rewat 500 kV, 2007 | https://www.adb.org/projects/documents/pak-59002-001-rp-0 | A 500 kV Ghazi-Barotha–Rewat line exists in the NTDC network. Does not name the company. |
| Samnu–Sebha 220 kV, 2011 | https://libyaninvestment.com/gecol-220-kv-transmission-lines-and-substation-projects/ | GECOL 220 kV network in the Sebha region. Does not confirm this line or the company. |
| Benghazi–eastern border 220 kV, 750 km, 2001 | https://www.tdworld.com/overhead-transmission/article/20969595/conflict-damage-and-reconstruction | 220 kV network in eastern Libya up to the Egyptian interconnection at Tobruk. Does not confirm this contract. |
| Hun–Wadi Arial–Samnu 220 kV, 1989 | none found | — |
| Misurata–Sirte and Tripoli ring 220 kV, 1980 | none found | — |
| Ayer Tawar–Junjung 500 kV, 1998 | https://en.wikipedia.org/wiki/National_Grid_(Malaysia) (search summary) | TNB 500 kV system from Gurun southwards, begun 1994, includes Ayer Tawar. Does not name the company. |
| 380/110 kV Makkah, Taif and Madinah, 2014 | none found | — |

No web source found names the company on any project. Projects stay on the site because they are in the company's own records; no detail beyond the profile is added.

## 9. Client names (current name first)

| As printed | Used on site | Basis |
|---|---|---|
| NTDC | NGC (formerly NTDC) | NTDC renamed National Grid Company of Pakistan Ltd, 20 March 2025: https://www.adb.org/projects/documents/pak-59002-001-rp-0 (search summary); https://en.wikipedia.org/wiki/National_Transmission_&_Despatch_Company |
| SCECO / SCECOP | Saudi Electricity Company (formerly SCECO) | SEC formed 5 April 2000 by merging the regional SCECOs: https://en.wikipedia.org/wiki/Saudi_Electricity_Company |
| SEC/WOA, SEC/WRB, SEC-SRB, SEC-CRB, SEC/WOA/SOA/COA | Saudi Electricity Company (unit in brackets) | P1 pp.35–36 |
| ELPCO (Libya) | GECOL (formerly ELPCO) | Build brief section 7.5 ("ELPCO now GECOL"); not confirmed by a web source (see OPEN_ITEMS) |
| GECOL Tripoli | GECOL | General Electricity Company of Libya: https://www.gecol.ly/HomeEnglish |
| Frontier Highway Authority, Peshawar | Pakhtunkhwa Highways Authority (formerly Frontier Highway Authority) | PKHA registration letter, P1 p.26 |
| National Highway Board | National Highway Authority (formerly National Highway Board) | NHA succeeded the NHB in 1991 (see OPEN_ITEMS for confirmation) |
| C. Itoh & Co of Japan | ITOCHU Corporation (formerly C. Itoh & Co.) | C. Itoh & Co. renamed ITOCHU in 1992 |
| Consorzia Italia 2000 (Italy) | Consorzio Italia 2000 | Company's own spelling: https://www.ci2000.net/ |
| TENAGA of Malaysia | Tenaga Nasional Berhad (TNB) | https://en.wikipedia.org/wiki/Tenaga_Nasional |
| EECO Company / ECCO Company | ECCO | One spelling kept (see OPEN_ITEMS) |

## 10. Place spellings

One spelling per place, following the client's or the usual official form. Changes from the profile text: Terbela → Tarbela; Sibbi → Sibi; Hifzabad → Hafizabad; Norowal → Narowal; Baddomali/Badomalhi → Baddomalhi; Semnu/Samno → Samnu; Sirf → Sirte; Jallo → Jalo; Zawara → Zuwara; Tajoora → Tajoura; Geddamis → Ghadames; Jabl Al-Gharb → Jabal al Gharbi; Aziza → Aziziya; Bab-e-Azizia → Bab al-Aziziya; Suq Juma → Suq al-Juma; Mousal Dam → Mosul Dam; Dhouk → Dohuk; Rutaba → Rutba; Baliji → Baiji; Harmrin → Hamrin; Dokan → Dukan; Sulemaniya → Sulaymaniyah; Busher → Bushehr; Jungjong → Junjung; Yongpeng → Yong Peng; Wadi Al Fari → Wadi Al Faraa; Mahad Al Dahab → Mahd Al Dhahab; Umm-Ul-Qura → Umm Al-Qura; Almusay Jid → Al Musayjid; Kopt Diji → Kot Diji. Logged in OPEN_ITEMS.
