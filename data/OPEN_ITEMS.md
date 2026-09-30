# Open items

Facts left out, conflicts found, and decisions to confirm. Nothing here is shown on the site as fact.

## A. Conflicts inside the sources (fact withheld or shown once)

1. **Sialkot International Airport, Package III-A-3.** Listed for 2011 (Rs 215.575 million, p.31) and 2005 (Rs 215.58 million, p.32). Resolved (Omar, 30 Sep 2026): two projects at the same location. Shown as two projects with their years.
2. **Sambrial Dry Port–Dhanawali road.** P1 p.31: 2009, Group 2, Rs 45.531 million; p.32: 2007, Rs 455.31 million. Resolved (Omar): two projects. Shown separately.
3. **Fencing and barbed wire on bypasses (TMP-BWP), Sections I and II.** 2009 (p.31), 2005 (p.32) and 2004 (p.33). Resolved (Omar): separate projects. All three shown.
4. **Ghazi-Barotha Hydropower Project civil works.** Listed for 2004 and 2005 with the same value (P1 p.32). Shown once, 2004–2005.
5. **Haram Sharif underground cable, Makkah (1990).** Items 36 and 37 on P1 p.38 are identical. Shown once.
6. **Yanbu North overhead line (2003).** Voltage printed "32 KV" (P1 p.36). Probably 132 kV. **Voltage withheld.**
7. **Khor Al-Zubair lines, Iraq (1978).** Voltage not stated. Withheld.
8. **Nafoora field well electrification (1994).** Value printed "1,379,467" in a column headed "Million" (P1 p.40). Value not legible with certainty.
9. **DHA Lahore Phase VI structures (2004).** Value not legible (P1 p.32).
10. **ADB rural road No. 12041 vs 12401** (P1 p.33 vs P2 p.12). Site uses 12041 (P1).
11. **Line lengths from the second profile.** Six NTDC/WAPDA line lengths come from P2 p.14 only (not in P1). They are shown with that source cited. Confirm they are correct.
12. **Second profile values** are "USD (Approx)", converted from the P1 rupee values. Not used; values are shown from P1 only, for the seven projects above Rs 2 billion or equivalent (facts.md section 7).
13. **"5000 KV 2nd Circuit Peshawar"** (P2 p.14) does not match any P1 row exactly; probably the Peshawar 500/220 kV substation. Not used.

## B. Client and place names (resolved silently on the site, logged here)

14. **ELPCO → GECOL.** The brief says "ELPCO now GECOL". No web source could be read to confirm it (client sites blocked by the session's network policy). Shown as "GECOL (formerly ELPCO)". Confirm.
15. **GEC (Libya)** appears 1982–2010. Unclear whether this is GECOL or another body. Kept as "GEC". Confirm the full name.
16. **S.O.E. (Libya)**, client of the Benghazi–eastern border line (2001). Full name not stated. Confirm.
17. **"EECO Company" (2008) and "ECCO Company" (2005)**: shown as "Electrical Construction Company (ECCO)", a Libyan electrical contractor found online. Confirm it is the same client.
18. **Full names found online**: GBC = Ghazi-Barotha Contractors; N.P.C.C = National Power Construction Corporation; S.S.E.M = Saudi Services for Electro-Mechanic Works; MODA = Ministry of Defence and Aviation. **Still acronyms only** (no reliable source found): ECT (Libya), EWR, MASS, NEPCO (Saudi Arabia; not the Jordanian NEPCO), SECC, SOI / LTII, IEC.
19. **National Highway Board → National Highway Authority**; **Frontier Highway Authority → Pakhtunkhwa Highways Authority**; **C. Itoh & Co. → ITOCHU Corporation**; **SCECO → Saudi Electricity Company**; **NTDC → NGC**. Shown as "current (formerly old)". Confirm you are happy with this for historic contracts.
20. **State Organization of Electricity (Iraq)** kept under its historic name (its successor could not be confirmed).
21. **National Logistics Cell** kept as printed; confirm whether to show a current name.
22. Place spellings changed to one official form (full list in facts.md section 10), e.g. Terbela → Tarbela, Semnu/Samno → Samnu, Sirf → Sirte, Jungjong → Junjung, Dokan → Dukan. Confirm.

## C. Web verification not possible from this session

23. The session's network policy blocked direct access to nescon.com.ly, gecol.ly, ntdc.gov.pk, wapda.gov.pk, se.com.sa, tnb.com.my, ci2000.net, Wikipedia and Wikimedia. Web checks used search summaries only (facts.md section 8). No web source found names the company on a project. **No contract value can be shown** until each flagship value is verified against an original client document.
24. **Photos.** Image hosts are blocked in this session, so no photos could be downloaded from Google. Used: portraits from the second profile (founder, Director, four advisers) and four general photos supplied by Omar (transmission towers, substation, hydropower channel, pipelines), captioned as illustrations. The channel photo resembles the Ghazi-Barotha power channel; if Omar confirms it is, it can go on that project page.
25. **Client logos.** Could not be downloaded from client sites. The "Clients served" strips show client names in text, as the brief allows.
26. **nazirandcompany.com**: Omar says the domain is hacked. Left alone; not linked or referenced.

## D. Content decisions to confirm

27. **Director**: shown as the company's Director, who leads it (Omar: effectively the only director). "Director of Projects and Procurement" removed. Education: University of Houston, Texas, as the second profile states; degree not stated.
28. **Engineers shown** (6 of 11): Syed Muhammad Abbas, Behram Shahrokh Aslam, Abdul Qadir, Ulfat Hussain, Muhammad Shakeel, Mian Athar Mahmood. Confirmed by Omar ("fine as is").
29. **Syed Imran Hassan**: the profile gives "Expert" with no discipline. Shown as "Adviser".
30. **Portraits**: founder, Director and advisers now shown, from the second profile (Omar approved). Engineers keep line-art placeholders.
31. **UK**: listed only as a historic branch office (P1 p.9); no UK projects documented. Shown as a branch note on Global presence, with no country page.
32. **Years of record** figure is computed as the span of documented completion years (1977–2020).
33. **Roles** are shown only where stated or clear from the client column (facts.md section 7).
34. **Headcount, ISO/HSE certificates**: none documented; nothing shown. **Values**: shown for seven projects per Omar's rule (above Rs 2 billion or equivalent); not verified against client sources.

## E. Deployment

35. **Cloudflare deploy from this session is blocked**: api.cloudflare.com is not in the session's allowed network hosts, so `wrangler pages deploy` cannot run here. A GitHub Actions workflow (`.github/workflows/deploy.yml`) deploys on push once the repository secrets `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID` are added. See GO_LIVE.md.
36. **MAIL_TO / mail provider** not set: the contact form shows "Form not yet connected".
37. **Turnstile site key** not set: the form works without it in review mode; set it before going live.
