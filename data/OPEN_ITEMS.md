# Open items

Facts left out, conflicts found, and decisions to confirm. Nothing here is shown on the site as fact.

## A. Conflicts inside the sources (fact withheld or shown once)

1. **Sialkot International Airport, Package III-A-3.** Listed twice in P1: completion 2011, Rs 215.575 million (p.31) and 2005, Rs 215.58 million (p.32). Shown once, **year withheld**.
2. **Sambrial Dry Port–Dhanawali road.** P1 p.31: 2009, "Group 2", Rs 45.531 million. P1 p.32: 2007, Rs 455.31 million. Probably the same contract with a misplaced decimal. Shown once, **year withheld**.
3. **Fencing and barbed wire on bypasses (TMP-BWP), Sections I and II.** P1 p.31: 2009, Rs 56.99 million; P1 p.32: 2005, Rs 56.985 million. Shown once, **year withheld**. A third entry (2004, Rs 44.67 million, p.33) is shown separately.
4. **Ghazi-Barotha Hydropower Project civil works.** Listed for 2004 and 2005 with the same value (P1 p.32). Shown once, 2004–2005.
5. **Haram Sharif underground cable, Makkah (1990).** Items 36 and 37 on P1 p.38 are identical. Shown once.
6. **Yanbu North overhead line (2003).** Voltage printed "32 KV" (P1 p.36). Probably 132 kV. **Voltage withheld.**
7. **Khor Al-Zubair lines, Iraq (1978).** Voltage not stated. Withheld.
8. **Nafoora field well electrification (1994).** Value printed "1,379,467" in a column headed "Million" (P1 p.40). Value not legible with certainty.
9. **DHA Lahore Phase VI structures (2004).** Value not legible (P1 p.32).
10. **ADB rural road No. 12041 vs 12401** (P1 p.33 vs P2 p.12). Site uses 12041 (P1).
11. **Line lengths from the second profile.** Six NTDC/WAPDA line lengths come from P2 p.14 only (not in P1). They are shown with that source cited. Confirm they are correct.
12. **Second profile values** are "USD (Approx)", converted from the P1 rupee values. P1 is preferred; no values are shown anyway.
13. **"5000 KV 2nd Circuit Peshawar"** (P2 p.14) does not match any P1 row exactly; probably the Peshawar 500/220 kV substation. Not used.

## B. Client and place names (resolved silently on the site, logged here)

14. **ELPCO → GECOL.** The brief says "ELPCO now GECOL". No web source could be read to confirm it (client sites blocked by the session's network policy). Shown as "GECOL (formerly ELPCO)". Confirm.
15. **GEC (Libya)** appears 1982–2010. Unclear whether this is GECOL or another body. Kept as "GEC". Confirm the full name.
16. **S.O.E. (Libya)**, client of the Benghazi–eastern border line (2001). Full name not stated. Confirm.
17. **"EECO Company" (2008) and "ECCO Company" (2005)** are probably one client. Site uses "ECCO". Confirm the spelling and full name.
18. **ECT (Libya), EWR, MASS, N.P.C.C, NEPCO, MODA, S.S.E.M / SECC, SOI / LTII, IEC, GBC**: acronyms kept as printed. Full names wanted.
19. **National Highway Board → National Highway Authority**; **Frontier Highway Authority → Pakhtunkhwa Highways Authority**; **C. Itoh & Co. → ITOCHU Corporation**; **SCECO → Saudi Electricity Company**; **NTDC → NGC**. Shown as "current (formerly old)". Confirm you are happy with this for historic contracts.
20. **State Organization of Electricity (Iraq)** kept under its historic name (its successor could not be confirmed).
21. **National Logistics Cell** kept as printed; confirm whether to show a current name.
22. Place spellings changed to one official form (full list in facts.md section 10), e.g. Terbela → Tarbela, Semnu/Samno → Samnu, Sirf → Sirte, Jungjong → Junjung, Dokan → Dukan. Confirm.

## C. Web verification not possible from this session

23. The session's network policy blocked direct access to nescon.com.ly, gecol.ly, ntdc.gov.pk, wapda.gov.pk, se.com.sa, tnb.com.my, ci2000.net, Wikipedia and Wikimedia. Web checks used search summaries only (facts.md section 8). No web source found names the company on a project. **No contract value can be shown** until each flagship value is verified against an original client document.
24. **Photos.** No project photos could be downloaded (image hosts blocked). The profile scans are 832 px wide at best (under the 800 px usable threshold once cropped) and the second profile's photos are stock images. The site uses line drawings only. Supply photos, or allow the image hosts, to add them.
25. **Client logos.** Could not be downloaded from client sites. The "Clients served" strips show client names in text, as the brief allows.
26. **nazirandcompany.com** exists and, per a search summary, describes "Nazir & Company (Pvt) Ltd" as having "over 5000 employees" and headquarters at "Descon Headquarters, 18 KM Ferozepur Road, Lahore". That text appears to be copied from another company. Check who controls this domain.

## D. Content decisions to confirm

27. **Director education**: the second profile says "graduated from the University of Houston, Texas". No degree is stated. The site shows the university only. Confirm the degree.
28. **Engineers shown** (6 of 11): Syed Muhammad Abbas, Behram Shahrokh Aslam, Abdul Qadir, Ulfat Hussain, Muhammad Shakeel, Mian Athar Mahmood. The profile gives no seniority, so the selection uses discipline and earliest PEC registration. Confirm, and supply one-line roles.
29. **Syed Imran Hassan**: the profile gives "Expert" with no discipline. Shown as "Adviser".
30. **Founder portrait and adviser photos** exist in the second profile. Not used (brief: no people photos unless supplied). Confirm if they may be used.
31. **UK**: listed only as a historic branch office (P1 p.9); no UK projects documented. Shown as a branch note on Global presence, with no country page.
32. **Years of record** figure is computed as the span of documented completion years (1977–2020).
33. **Roles** are shown only where stated or clear from the client column (facts.md section 7).
34. **Headcount, ISO/HSE certificates, values**: none documented; nothing shown.

## E. Deployment

35. **Cloudflare deploy from this session is blocked**: api.cloudflare.com is not in the session's allowed network hosts, so `wrangler pages deploy` cannot run here. A GitHub Actions workflow (`.github/workflows/deploy.yml`) deploys on push once the repository secrets `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID` are added. See GO_LIVE.md.
36. **MAIL_TO / mail provider** not set: the contact form shows "Form not yet connected".
37. **Turnstile site key** not set: the form works without it in review mode; set it before going live.
