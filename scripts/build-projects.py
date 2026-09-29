#!/usr/bin/env python3
"""Generate src/data/projects.json from the transcription of the two source PDFs.

Every row below was transcribed by reading the scanned pages of
source/Nazir_and_Sons_profile.pdf (P1) and source/Second_profile.pdf (P2).
The page number is the PDF page (1-based) where the row appears.

Row tuple:
  (country, group, pdf, page, sr, name, client_key, year, kv, km, sector, role,
   scope, value, currency, notes, extra)
year: completion year as printed (None where the source conflicts).
value: as printed in the source; never rendered unless verified.
"""
import json, re, pathlib

ROOT = pathlib.Path(__file__).resolve().parent.parent
P1 = "Nazir_and_Sons_profile.pdf"
P2 = "Second_profile.pdf"

# Client display names. Current name first, "(formerly ...)" only where the
# rename is documented (see data/facts.md, section "Client names").
CLIENTS = {
    "NGC": "NGC (formerly NTDC)",
    "NGC_WAPDA": "NGC (formerly NTDC) / WAPDA",
    "WAPDA": "WAPDA",
    "IEC_WAPDA": "IEC / WAPDA",
    "MDA": "Multan Development Authority",
    "KVH": "Khan Village Housing",
    "DLH": "Dream Land Housing",
    "PHED": "Public Health Engineering Department, Gujrat",
    "NHA": "National Highway Authority",
    "NHA_NHB": "National Highway Authority (formerly National Highway Board)",
    "PKHA": "Pakhtunkhwa Highways Authority (formerly Frontier Highway Authority)",
    "FIEDMC": "FIEDMC, Faisalabad",
    "SIAL": "Sialkot International Airport Ltd (SIAL)",
    "PHD_GRW": "Provincial Highway Division, Gujranwala",
    "PHD_SKT": "Provincial Highway Division, Sialkot",
    "PHD_FSD": "Provincial Highway Division, Faisalabad",
    "SCH": "Star City Housing",
    "PRIVATE": "Private sector",
    "DHA": "Defence Housing Authority Lahore",
    "CDA": "Capital Development Authority",
    "FDA": "Faisalabad Development Authority",
    "PUNJAB_HWY": "Punjab Highway Department",
    "PUNJAB_CW": "Punjab Communication and Works Department",
    "NLC": "National Logistics Cell",
    "GBC": "GBC",
    "LDA": "Lahore Development Authority",
    "LCCHS": "Lahore Cantt. Cooperative Housing Society",
    # Saudi Arabia
    "SEC_WOA": "Saudi Electricity Company (WOA)",
    "SEC_MULTI": "Saudi Electricity Company (WOA / SOA / COA)",
    "SEC_WRB": "Saudi Electricity Company (WRB)",
    "SEC_SRB": "Saudi Electricity Company (SRB)",
    "SEC_CRB": "Saudi Electricity Company (CRB)",
    "SIEMENS_SEC": "Siemens / Saudi Electricity Company (WRB)",
    "MASS_SEC": "MASS Project / Saudi Electricity Company (WRB)",
    "SCECO": "Saudi Electricity Company (formerly SCECO)",
    "SCECO_NPCC": "Saudi Electricity Company (formerly SCECO) / N.P.C.C",
    "SCECO_SIEMENS": "Saudi Electricity Company (formerly SCECO) / Siemens",
    "EWR_NPCC": "EWR / N.P.C.C",
    "EWR_MASS": "EWR / MASS",
    "EWR_SIEMENS": "EWR / Siemens",
    "EWR_SUED": "EWR / Suedrohrbau",
    "MODA": "MODA",
    "SOI": "SOI / LTII",
    "RCD": "Royal Committee for Development",
    "NEPCO": "NEPCO",
    "SSEM": "S.S.E.M / SECC",
    # Libya
    "GECOL": "GECOL",
    "GECOL_ELPCO": "GECOL (formerly ELPCO)",
    "GEC": "GEC",
    "ECCO": "ECCO",
    "ECT": "ECT",
    "SIRTE": "Sirte Oil Company",
    "AGOCO": "Arabian Gulf Oil Company",
    "WAHA": "Waha Oil Company",
    "SOE_LY": "S.O.E.",
    "ENERGOINVEST_SOE": "Energoinvest / S.O.E.",
    "ENERGOINVEST": "Energoinvest",
    "ITOCHU": "ITOCHU Corporation (formerly C. Itoh & Co.)",
    # Iraq
    "SOE_IQ": "State Organization of Electricity",
    "SOE_ENERGOINVEST": "State Organization of Electricity / Energoinvest",
    "MOD_IQ": "Ministry of Defence (Iraq)",
    "PTT_NIPPON": "PTT / Nippon Telecommunication Construction Co.",
    "PTT_MITSUBISHI": "PTT / Mitsubishi Corporation",
    # Iran, Malaysia, Mozambique
    "FURUKAWA": "Furukawa Electric Co.",
    "JAMES_SCOTT": "James Scott",
    "TNB": "Tenaga Nasional Berhad (TNB)",
    "CI2000": "Consorzio Italia 2000",
}

# Clients that are themselves contractors: the company worked under them.
SUB_CLIENTS = {"IEC_WAPDA", "SIEMENS_SEC", "MASS_SEC", "SCECO_NPCC", "SCECO_SIEMENS",
               "EWR_NPCC", "EWR_MASS", "EWR_SIEMENS", "EWR_SUED", "ENERGOINVEST_SOE",
               "ENERGOINVEST", "ITOCHU", "SOE_ENERGOINVEST", "PTT_NIPPON",
               "PTT_MITSUBISHI", "FURUKAWA", "JAMES_SCOTT", "CI2000"}

T, S, D, I, O, C, X = ("transmission", "substation", "distribution", "industrial",
                       "oil-and-gas-electrical", "civil", "other")

R = []
def row(*a):
    R.append(a)

# ---------------------------------------------------------------- Pakistan: national grid (P1 p.29)
G = "national-grid"
row("pakistan", G, P1, 29, 1, "Barotha–Rewat 500 kV transmission lines", "NGC_WAPDA", 2007, 500, 156, T, "unknown",
    "Contract No. 2017-9: construction of the Barotha–Rewat 500 kV transmission lines.", 2608.00, "Rs million",
    "Length 156 km from the second profile (p.14).", {"flagship": True, "region": "Punjab", "km_src": (P2, 14)})
row("pakistan", G, P1, 29, 2, "Guddu–Sibi 220 kV transmission lines (Section II)", "NGC", 1997, 220, 175, T, "unknown",
    "Contract No. GSO-6(A) Section II: construction of 220 kV transmission lines from Guddu to Sibi.", 130.53, "Rs million",
    "Length 175 km from the second profile (p.14).", {"region": "Sindh and Balochistan", "km_src": (P2, 14)})
row("pakistan", G, P1, 29, 3, "Peshawar–Daudkhel 220 kV double-circuit line", "NGC", 1996, 220, 122, T, "unknown",
    "Contract No. ADB-11-10 (Lot I): construction of the 220 kV double-circuit Peshawar–Daudkhel transmission line.", 95.53, "Rs million",
    "Length 122 km from the second profile (p.14).", {"region": "Khyber Pakhtunkhwa and Punjab", "km_src": (P2, 14)})
row("pakistan", G, P1, 29, 4, "Peshawar 500/220 kV substation", "NGC", 1995, 500, None, S, "unknown",
    "Contract No. 566-37 (Lot I): construction of the 500/220 kV substation at Peshawar.", 100.32, "Rs million", "", {"region": "Khyber Pakhtunkhwa"})
row("pakistan", G, P1, 29, 5, "Tarbela–Salt Range 500 kV second circuit", "NGC", 1985, 500, 174, T, "unknown",
    "Contract No. 362-10: construction of the second circuit of the 500 kV transmission line from Tarbela to Salt Range.", 42.75, "Rs million",
    "Length 174 km from the second profile (p.14).", {"region": "Khyber Pakhtunkhwa and Punjab", "km_src": (P2, 14)})
row("pakistan", G, P1, 29, 6, "Jamshoro–Karachi 220 kV double-circuit line", "WAPDA", 1984, 220, 130, T, "unknown",
    "Construction of the 220 kV double-circuit transmission line from Jamshoro to Karachi.", 34.36, "Rs million",
    "Length 130 km from the second profile (p.14).", {"region": "Sindh", "km_src": (P2, 14)})
row("pakistan", G, P1, 29, 7, "Larkana–Jamshoro 500 kV transmission line", "WAPDA", 1983, 500, 257, T, "unknown",
    "Contract No. 216-10: construction of the 500 kV transmission line from Larkana to Jamshoro.", 48.49, "Rs million",
    "Length 257 km from the second profile (p.14).", {"region": "Sindh", "km_src": (P2, 14)})
row("pakistan", G, P1, 29, 8, "Tarbela–Burhan 220 kV double-circuit line (foundations)", "IEC_WAPDA", 1978, 220, None, T, "sub",
    "Construction of foundations for the 220 kV double-circuit transmission line from Tarbela to Burhan.", 11.40, "Rs million", "", {"region": "Khyber Pakhtunkhwa and Punjab"})
row("pakistan", G, P1, 29, 9, "Tarbela–Faisalabad 500 kV transmission line (foundations)", "IEC_WAPDA", 1977, 500, None, T, "sub",
    "Construction of foundations for the 500 kV transmission line from Tarbela to Faisalabad.", 19.20, "Rs million", "", {"region": "Punjab"})

# ---------------------------------------------------------------- Pakistan: regional (P1 pp.30-34)
G = "regional"
row("pakistan", G, P1, 30, 1, "Fatima Jinnah Town Phase I infrastructure, Multan", "MDA", 2020, None, None, C, "unknown",
    "Construction of water supply, sewerage, overhead water tank, roads and boundary wall for the Fatima Jinnah Town Phase I scheme, Vehari Road, Multan.", 1989.00, "Rs million", "", {"region": "Punjab"})
row("pakistan", G, P1, 30, 2, "Fatima Jinnah Town Phase I water supply and paving, Multan", "MDA", 2020, None, None, C, "unknown",
    "Construction of chambers and water supply pipelines, and dry brick pavement and soling, in Fatima Jinnah Town Phase I, Vehari Road, Multan.", 600.00, "Rs million", "", {"region": "Punjab"})
row("pakistan", G, P1, 30, 3, "Khan Village Housing, Chakri Road, Rawalpindi", "KVH", 2018, None, None, C, "unknown",
    "Construction of Khan Village Housing, Chakri Road, Rawalpindi.", 567.00, "Rs million", "", {"region": "Punjab"})
row("pakistan", G, P1, 30, 4, "Dream Land Housing City Vehari, Phase II", "DLH", 2017, None, None, C, "unknown",
    "Construction of Dream Land Housing City Vehari, Phase II.", 72.00, "Rs million", "", {"region": "Punjab"})
row("pakistan", G, P1, 30, 5, "Dream Land City Housing Mian Channu, Phase III", "DLH", 2016, None, None, C, "unknown",
    "Construction of Dream Land City Housing, Mian Channu, Phase III.", 72.00, "Rs million", "", {"region": "Punjab"})
row("pakistan", G, P1, 30, 6, "Dream Land City Chishtian", "DLH", 2016, None, None, C, "unknown",
    "Construction of Dream Land City, Chishtian.", 60.00, "Rs million", "", {"region": "Punjab"})
row("pakistan", G, P1, 30, 7, "Gujrat city water supply system (Group II)", "PHED", 2015, None, None, C, "unknown",
    "Construction of the water supply system for Gujrat city (Group II).", 230.00, "Rs million", "", {"region": "Punjab"})
row("pakistan", G, P1, 30, 8, "Dream Land City Vehari, Phase I", "DLH", 2015, None, None, C, "unknown",
    "Construction of Dream Land City Vehari, Phase I.", 72.00, "Rs million", "", {"region": "Punjab"})
row("pakistan", G, P1, 30, 9, "Periodic maintenance, KM 1104+000 to 1106+500", "NHA", 2015, None, None, C, "unknown",
    "Periodic maintenance works between KM 1104+000 and KM 1106+500.", 272.00, "Rs million", "", {})
row("pakistan", G, P1, 30, 10, "Swabi–Topi road improvement, Package 1", "PKHA", 2013, None, None, C, "unknown",
    "Improvement and rehabilitation of the Swabi–Topi road, Package 1.", 192.933, "Rs million", "", {"region": "Khyber Pakhtunkhwa"})
row("pakistan", G, P1, 30, 11, "Development works, M-3 Industrial City, Faisalabad", "FIEDMC", 2013, None, None, C, "unknown",
    "Development works at M-3 Industrial City, Faisalabad.", 47.948, "Rs million", "", {"region": "Punjab"})
row("pakistan", G, P1, 31, 12, "Mardan–Swabi bypass road", "PKHA", 2013, None, None, C, "unknown",
    "Construction of the Mardan–Swabi bypass road.", 216.956, "Rs million", "", {"region": "Khyber Pakhtunkhwa"})
row("pakistan", G, P1, 31, 13, "Chach Interchange, Motorway M-1", "NHA", 2011, None, None, C, "unknown",
    "Construction of Chach Interchange on Motorway M-1.", 151.826, "Rs million", "", {"region": "Punjab"})
row("pakistan", G, P1, 31, 14, "Dream Land Housing City, Mian Channu", "DLH", 2011, None, None, C, "unknown",
    "Construction works at Dream Land Housing City, Mian Channu.", 58.00, "Rs million", "", {"region": "Punjab"})
row("pakistan", G, P1, 31, 15, "Sialkot International Airport, Package III-A-3 (landside development)", "SIAL", None, None, None, C, "unknown",
    "Construction of Sialkot International Airport Package III-A-3, landside development works.", 215.575, "Rs million",
    "Listed twice in the profile: completion 2011 (p.31, Rs 215.575 million) and 2005 (p.32, Rs 215.58 million). Year withheld until confirmed.", {"region": "Punjab", "dupe": (32, 29)})
row("pakistan", G, P1, 31, 16, "Dualisation of old G.T. Road, Gujranwala (2010)", "PHD_GRW", 2010, None, None, C, "unknown",
    "Dualisation of the old G.T. Road, Gujranwala.", 44.65, "Rs million", "", {"region": "Punjab"})
row("pakistan", G, P1, 31, 17, "Star City Housing Society, Vehari", "SCH", 2009, None, None, C, "unknown",
    "Construction works at Star City Housing Society, Vehari.", 72.00, "Rs million", "", {"region": "Punjab"})
row("pakistan", G, P1, 31, 18, "Hafizabad to Pindi Bhattian Interchange road (widening and improvement)", "PHD_GRW", 2009, None, None, C, "unknown",
    "Widening and improvement of the road from Hafizabad to Pindi Bhattian Interchange, District Hafizabad.", 338.637, "Rs million", "", {"region": "Punjab"})
row("pakistan", G, P1, 31, 19, "Sargodha–Salam Interchange road via Bhalwal (widening and improvement)", "PHD_FSD", 2009, None, None, C, "unknown",
    "Widening and improvement of the road from Sargodha to Salam Interchange via Bhalwal.", 281.951, "Rs million", "", {"region": "Punjab"})
row("pakistan", G, P1, 31, 20, "Narowal–Lahore road, Group I and II (KM 3 to 13)", "PHD_SKT", 2009, None, None, C, "unknown",
    "Construction of the road from Narowal to Lahore via Baddomalhi, Narang, Kala Khatai and Shahdara, Group I and II (KM 3 to 13).", 78.167, "Rs million", "", {"region": "Punjab"})
row("pakistan", G, P1, 31, 21, "Narowal–Lahore road via Baddomalhi, Narang and Kala Khatai (2009)", "PHD_SKT", 2009, None, None, C, "unknown",
    "Construction of the road from Narowal to Lahore via Baddomalhi, Narang and Kala Khatai.", 35.189, "Rs million", "", {"region": "Punjab"})
row("pakistan", G, P1, 31, 22, "Sambrial Dry Port–Dhanawali metalled road", "PHD_SKT", None, None, None, C, "unknown",
    "Construction of the metalled road from Sambrial Dry Port to Dhanawali.", 45.531, "Rs million",
    "Listed twice in the profile: 2009, Group 2, Rs 45.531 million (p.31) and 2007, Rs 455.31 million (p.32). Year and value withheld until confirmed.", {"region": "Punjab", "dupe": (32, 24)})
row("pakistan", G, P1, 31, 23, "Fencing and barbed wire on bypasses (TMP-BWP), Sections I and II", "NHA", None, None, None, C, "unknown",
    "Construction of fencing and barbed wire on bypasses (TMP-BWP project), Sections I and II.", 56.99, "Rs million",
    "Listed with completion 2009 (p.31, Rs 56.99 million) and 2005 (p.32, Rs 56.985 million). Year withheld until confirmed.", {"dupe": (32, 27)})
row("pakistan", G, P1, 32, 25, "Twenty housing units", "PRIVATE", 2007, None, None, C, "unknown",
    "Construction of 20 housing units.", 220.00, "Rs million", "", {})
row("pakistan", G, P1, 32, 26, "Dualisation of old G.T. Road, Gujranwala (2006)", "PHD_GRW", 2006, None, None, C, "unknown",
    "Dualisation of the old G.T. Road, Gujranwala.", 133, "Rs million", "", {"region": "Punjab"})
row("pakistan", G, P1, 32, 28, "Pindi Bhattian–Faisalabad Motorway (M-3)", "NHA", 2005, None, 52.5, C, "jv",
    "Construction, commissioning, management, operation and maintenance of the Pindi Bhattian–Faisalabad Motorway (M-3), as a 10% partner in a joint venture led by Hussain Cotex.", 7290.00, "Rs million",
    "Joint-venture share and length (52.5 km) from the second profile (p.12).", {"region": "Punjab", "km_src": (P2, 12)})
row("pakistan", G, P1, 32, 30, "Ghazi-Barotha Hydropower Project, civil works", "WAPDA", 2005, None, None, C, "jv",
    "Civil works contracts for the Ghazi-Barotha Hydropower Project, as a 2.4% partner in a joint venture led by Impregilo of Italy.", 15898.26, "Rs million",
    "Listed twice in the profile (2004 and 2005, same value); shown once, completion 2005. Joint-venture share from the second profile (p.12).", {"region": "Punjab", "year_start": 2004})
row("pakistan", G, P1, 32, 32, "Narowal–Lahore road via Baddomalhi, Narang, Kala Khatai and Shahdara (2005)", "PHD_SKT", 2005, None, None, C, "unknown",
    "Construction of the road from Narowal to Lahore via Baddomalhi, Narang, Kala Khatai and Shahdara (L-26.70).", 38.60, "Rs million", "", {"region": "Punjab"})
row("pakistan", G, P1, 32, 33, "DHA Lahore Phase VI structures, water supply, electrification and street lights", "DHA", 2004, None, None, C, "unknown",
    "Construction of structures, water supply, electrification and street lighting works, Phase VI, Defence Housing Authority Lahore.", None, "Rs million",
    "Value on p.32 is not legible in the scan.", {"region": "Punjab"})
row("pakistan", G, P1, 32, 34, "DHA Lahore Phase VI Main Boulevard", "DHA", 2004, None, None, C, "unknown",
    "Construction of the Main Boulevard, Phase VI, Defence Housing Authority Lahore Cantt.", 83.27, "Rs million", "", {"region": "Punjab"})
row("pakistan", G, P1, 33, 35, "Re-carpeting of roads and streets, sectors G-6 and G-7, Islamabad", "CDA", 2004, None, None, C, "unknown",
    "Rehabilitation and re-carpeting of roads and streets in sectors G-6 and G-7, Islamabad.", 46.68, "Rs million", "", {"region": "Islamabad"})
row("pakistan", G, P1, 33, 36, "Fencing and barbed wire on bypasses (TMP-BWP), Sections I and II (2004)", "NHA", 2004, None, None, C, "unknown",
    "Construction of fencing and barbed wire on bypasses (TMP-BWP project), Sections I and II.", 44.67, "Rs million", "", {})
row("pakistan", G, P1, 33, 37, "DHA Lahore Phase V internal roads", "DHA", 2004, None, None, C, "unknown",
    "Construction of internal roads, Phase V, Defence Housing Authority Lahore Cantt.", 22.23, "Rs million", "", {"region": "Punjab"})
row("pakistan", G, P1, 33, 38, "Synthetic turf, Hockey Stadium Faisalabad", "FDA", 2003, None, None, C, "unknown",
    "Providing and laying synthetic turf in the Hockey Stadium, Faisalabad.", 32.00, "Rs million", "", {"region": "Punjab"})
row("pakistan", G, P1, 33, 39, "Raiwind–Kasur road widening", "PUNJAB_HWY", 2003, None, 6, C, "unknown",
    "Improvement and widening of the Raiwind–Kasur road.", 20.22, "Rs million", "Length 6 km from the second profile (p.12).", {"region": "Punjab", "km_src": (P2, 12)})
row("pakistan", G, P1, 33, 40, "Japanese-assisted rural road No. 13301-III, District Kasur", "PUNJAB_CW", 2002, None, 7.35, C, "unknown",
    "Construction of Japanese-assisted Rural Roads Project Phase 1, Road No. 13301-III, District Kasur.", 30.65, "Rs million", "Length 7.35 km from the second profile (p.12).", {"region": "Punjab", "km_src": (P2, 12)})
row("pakistan", G, P1, 33, 41, "ADB rural access road No. 14411, Sholawal–Raza Abad, District Okara", "PUNJAB_CW", 2002, None, 17.96, C, "unknown",
    "ADB-assisted Rural Access Roads Project Phase 1, Road No. 14411 (Sholawal to Raza Abad), District Okara.", 548.37, "Rs million", "Length 17.96 km from the second profile (p.12).", {"region": "Punjab", "km_src": (P2, 12)})
row("pakistan", G, P1, 33, 42, "ADB rural access road No. 15316, Bhoa Hassan–Rarka Bala, District Mandi Bahauddin", "PUNJAB_CW", 2002, None, 16.64, C, "unknown",
    "ADB-assisted Rural Access Roads Project Phase 1, Road No. 15316 (Bhoa Hassan to Rarka Bala), District Mandi Bahauddin.", 449.43, "Rs million", "Length 16.64 km from the second profile (p.12).", {"region": "Punjab", "km_src": (P2, 12)})
row("pakistan", G, P1, 33, 43, "Islamabad Expressway, Faizabad to Flying Club turning", "CDA", 2002, None, None, C, "unknown",
    "Construction of the Islamabad Expressway from Faizabad to the Flying Club turning.", 372.10, "Rs million", "", {"region": "Islamabad"})
row("pakistan", G, P1, 33, 44, "Rural access road No. 14217, Theh Kalan–Dhariwal, District Kasur", "PUNJAB_CW", 2002, None, 6.79, C, "unknown",
    "Rural Access Roads Project Phase 1, Road No. 14217 (Theh Kalan to Dhariwal), District Kasur.", 233.51, "Rs million",
    "Client listed on p.33 as 'Communication & Works Organization'; the second profile (p.12) lists the same road under the Punjab Communication and Works Department. Length 6.79 km from the second profile.", {"region": "Punjab", "km_src": (P2, 12)})
row("pakistan", G, P1, 33, 45, "ADB rural access road No. 12041, Chanjri Nawabeala Link, District Bhakkar", "PUNJAB_CW", 2002, None, 9.09, C, "unknown",
    "ADB-assisted Rural Access Roads Project Phase 1, Road No. 12041 (Chanjri Nawabeala Link), District Bhakkar.", 198.50, "Rs million",
    "Road number printed as 12041 (p.33) and 12401 (second profile p.12). Length 9.09 km from the second profile.", {"region": "Punjab", "km_src": (P2, 12)})
row("pakistan", G, P1, 34, 46, "ADB rural access roads project", "PUNJAB_CW", 2002, None, None, C, "unknown",
    "ADB-assisted Rural Access Roads Project.", 22.24, "Rs million", "", {"region": "Punjab"})
row("pakistan", G, P1, 34, 47, "Plant-mixed asphalt concrete for road carpeting, Faisalabad", "NLC", 2002, None, None, C, "unknown",
    "Production and laying of plant-mixed asphalt concrete for carpeting of roads in Faisalabad.", 86.50, "Rs million", "", {"region": "Punjab"})
row("pakistan", G, P1, 34, 48, "Ghazi–Faqirabad road repairs", "GBC", 2001, None, None, C, "unknown",
    "Repairing the Ghazi–Faqirabad road, including diversions.", 47.09, "Rs million", "", {})
row("pakistan", G, P1, 34, 49, "Gujranwala–Chenab Bridge additional carriageway", "NHA", 1995, None, 48.57, C, "unknown",
    "Construction of an additional carriageway between Gujranwala and Chenab Bridge (48.57 km), including the Dinga flyover (8 x 30 m spans, 2 m piles).", 576.37, "Rs million",
    "Dinga flyover detail from the second profile (p.13).", {"region": "Punjab"})
row("pakistan", G, P1, 34, 50, "Chenab Bridge–Kharian additional carriageway", "NHA", 1993, None, 44.67, C, "unknown",
    "Construction of an additional carriageway between Chenab Bridge and Kharian (44.67 km), including the Wazirabad flyover over the Wazirabad–Jhelum railway line (3 spans, 2 m piles).", 458.48, "Rs million",
    "Flyover detail from the second profile (p.13).", {"region": "Punjab"})
row("pakistan", G, P1, 34, 51, "Lahore canal bank roads rehabilitation", "PUNJAB_CW", 1992, None, 52, C, "unknown",
    "Rehabilitation of roads on the left and right banks of the canal passing through Lahore city (52 km).", 129.90, "Rs million", "", {"region": "Punjab"})
row("pakistan", G, P1, 34, 52, "Sukkur–Kot Bangalow road rehabilitation", "NHA", 1989, None, 55, C, "unknown",
    "Rehabilitation of the road from Sukkur to Kot Bangalow.", 513.70, "Rs million",
    "Length 55 km from the second profile (p.12), where the client is given as the National Highway Board.", {"region": "Sindh", "km_src": (P2, 12)})
row("pakistan", G, P1, 34, 53, "Wahdat Road improvement, Lahore", "LDA", 1989, None, None, C, "unknown",
    "Improvement and remodelling of Wahdat Road, Lahore.", 20.94, "Rs million", "", {"region": "Punjab"})
row("pakistan", G, P1, 34, 54, "Rohri–Kot Diji road rectification and periodic maintenance", "NHA_NHB", 1988, None, 217, C, "unknown",
    "Rectification of the Rohri–Kot Diji road and periodic maintenance.", 16.42, "Rs million", "Length 217 km from the second profile (p.12).", {"region": "Sindh", "km_src": (P2, 12)})
row("pakistan", G, P1, 34, 55, "Nowshera–Mardan dual carriageway", "NHA_NHB", 1987, None, 23, C, "unknown",
    "Construction of a dual carriageway between Nowshera and Mardan.", 42.49, "Rs million", "Length 23 km from the second profile (p.13).", {"region": "Khyber Pakhtunkhwa", "km_src": (P2, 13)})
row("pakistan", G, P1, 34, 56, "Kot Diji–Kandiaro road", "NHA_NHB", 1985, None, 31, C, "unknown",
    "Construction of the road from Kot Diji to Kandiaro (31 km).", 112.00, "Rs million", "", {"region": "Sindh"})
# Civil projects documented only in the second profile (no completion year given there)
row("pakistan", G, P2, 11, "c1", "Makran Coastal Highway, Ormara–Pasni section II", "NHA", None, None, 51.12, C, "jv",
    "Construction of the Makran Coastal Highway, Ormara–Pasni Section II (51.12 km), as lead partner (51%) of a joint venture with AMC.", 16.15, "USD million (approx.)",
    "Documented in the second profile only; no completion year given. Not yet confirmed by an NHA source.", {"region": "Balochistan"})
row("pakistan", G, P2, 13, "c2", "Rohri–Kot Diji road rehabilitation", "NHA_NHB", None, None, 44.70, C, "unknown",
    "Rehabilitation of the Rohri–Kot Diji road (44.70 km).", 2.45, "USD million (approx.)",
    "Documented in the second profile only; no completion year given.", {"region": "Sindh"})
row("pakistan", G, P2, 13, "c3", "Khairabad–Nowshera national highway rehabilitation", "NHA_NHB", None, None, 26.40, C, "unknown",
    "Rehabilitation of the Khairabad–Nowshera section of the national highway (26.40 km).", 0.69, "USD million (approx.)",
    "Documented in the second profile only; no completion year given.", {"region": "Khyber Pakhtunkhwa"})
row("pakistan", G, P2, 13, "c4", "Peshawar–Charsadda road rehabilitation", "NHA_NHB", None, None, 26.80, C, "unknown",
    "Rehabilitation of the Peshawar–Charsadda road (26.80 km).", 0.57, "USD million (approx.)",
    "Documented in the second profile only; no completion year given.", {"region": "Khyber Pakhtunkhwa"})
row("pakistan", G, P2, 13, "c5", "Three overhead water reservoirs, Lahore Cantt.", "LCCHS", None, None, None, C, "unknown",
    "Construction of three overhead water reservoirs of 100,000 gallons each.", 0.15, "USD million (approx.)",
    "Documented in the second profile only; no completion year given.", {"region": "Punjab"})

# ---------------------------------------------------------------- Saudi Arabia (P1 pp.35-38)
G = None
row("saudi-arabia", G, P1, 35, 1, "Riyadh HV and LV overhead distribution network, up to 35 kV", "SEC_WOA", 2015, 35, None, D, "unknown",
    "Construction, maintenance, expansion and reinforcement of the HV and LV overhead distribution network up to 35 kV in Riyadh.", 20625000, "SR", "", {"region": "Riyadh"})
row("saudi-arabia", G, P1, 35, 2, "380/110 kV overhead lines and fibre-optic network, Makkah, Taif and Madinah", "SEC_WOA", 2014, 380, None, T, "main",
    "Turnkey project for the construction of 380 kV / 110 kV overhead transmission lines and establishment of a fibre-optic cable network in the Makkah, Taif and Madinah area.", 112598244, "SR", "", {"flagship": True, "region": "Makkah and Madinah"})
row("saudi-arabia", G, P1, 35, 3, "Distribution network up to 33 kV, Makkah, Taif and Madinah", "SEC_MULTI", 2014, 33, None, D, "unknown",
    "Construction of the distribution network up to 33 kV, underground cable and overhead line, in the Makkah, Taif and Madinah area.", 288000000, "SR", "", {"region": "Makkah and Madinah"})
row("saudi-arabia", G, P1, 35, 4, "Wadi Al Faraa 33 kV distribution network", "SEC_WRB", 2013, 33, None, D, "unknown",
    "Construction of the 33 kV distribution network, Wadi Al Faraa.", 48517500, "SR", "", {"region": "Madinah"})
row("saudi-arabia", G, P1, 35, 5, "Mahd Al Dhahab 33 kV distribution network", "SEC_WRB", 2012, 33, None, D, "unknown",
    "Construction of the 33 kV distribution network, Mahd Al Dhahab.", 44968750, "SR", "", {"region": "Madinah"})
row("saudi-arabia", G, P1, 35, 6, "Hajur Phase 1 and Wadi Al Faraa II underground distribution connections", "SEC_WOA", 2011, 33, None, D, "unknown",
    "Design, supply and construction of 33/0.231-0.127 kV underground distribution connections for Part 1 of the electrification of Hajur Phase 1 and Wadi Al Faraa II, Makkah and Madinah area.", 46200000, "SR", "", {"region": "Makkah and Madinah"})
row("saudi-arabia", G, P1, 35, 7, "Makkah 33/13.8 kV underground and overhead distribution network (2009)", "SCECO", 2009, 33, None, D, "unknown",
    "Construction of the 33 kV / 13.8 kV underground and overhead distribution network, Makkah.", 16443750, "SR", "", {"region": "Makkah"})
row("saudi-arabia", G, P1, 35, 8, "Wadi Jaleel 380/110 kV line: access roads and tower foundations", "EWR_NPCC", 2006, 380, None, T, "sub",
    "Construction of access roads and tower foundations for the 380 kV / 110 kV overhead transmission line, Wadi Jaleel, Makkah.", 22500000, "SR", "", {"region": "Makkah"})
row("saudi-arabia", G, P1, 36, 9, "Shoaiba–Jeddah 380 kV overhead transmission line", "EWR_MASS", 2005, 380, None, T, "sub",
    "Supply, design and construction of the 380 kV overhead transmission line, Shoaiba–Jeddah.", 46500000, "SR", "", {"region": "Makkah"})
row("saudi-arabia", G, P1, 36, 10, "HV and LT underground distribution network expansion, up to 35 kV", "SEC_WOA", 2005, 35, None, D, "main",
    "Turnkey project for the expansion and reinforcement of the HV and LT underground distribution network up to 35 kV.", 5000000, "SR", "", {})
row("saudi-arabia", G, P1, 36, 11, "Tihama–Suffa 132 kV double-circuit overhead line", "SEC_SRB", 2004, 132, None, T, "unknown",
    "Construction of the 132 kV double-circuit overhead transmission line, Tihama–Suffa.", 19927000, "SR", "", {})
row("saudi-arabia", G, P1, 36, 12, "Radwan 33 kV distribution network", "SEC_WRB", 2003, 33, None, D, "unknown",
    "Construction of the 33 kV distribution network (Radwan project).", 39003750, "SR", "", {})
row("saudi-arabia", G, P1, 36, 13, "Yanbu North double-circuit overhead line", "SEC_WRB", 2003, None, None, T, "unknown",
    "Construction of a double-circuit overhead transmission line, Yanbu North.", 8800000, "SR",
    "Voltage printed as '32 KV' on p.36; withheld until confirmed.", {"region": "Madinah"})
row("saudi-arabia", G, P1, 36, 14, "110 kV underground power cable laying", "SIEMENS_SEC", 2003, 110, None, T, "sub",
    "Laying of 110 kV underground power cable.", 1377000, "SR", "", {})
row("saudi-arabia", G, P1, 36, 15, "Jamia 380 kV to Hamrah 110 kV underground cable", "MASS_SEC", 2002, 110, None, T, "sub",
    "Installation of 110 kV underground power cable from the 380 kV Jamia substation to the 110 kV Hamrah substation.", 3250000, "SR", "", {"region": "Makkah"})
row("saudi-arabia", G, P1, 36, 16, "Energy meters and standby generator interlocking, Al Minar Village, Jeddah", "MODA", 2001, None, None, D, "unknown",
    "Installation of energy meters and adjustment of the network for the interlocking system of standby generators at Al Minar Village, Jeddah.", 580000, "SR", "", {"region": "Makkah"})
row("saudi-arabia", G, P1, 36, 17, "132 kV cable circuits between substations 8007, 8075 and 8060, Riyadh", "SEC_CRB", 2001, 132, None, T, "main",
    "Turnkey construction of 132 kV cable circuits between substations 8007, 8075 and 8060 in the Riyadh area.", 410000, "SR", "", {"region": "Riyadh"})
row("saudi-arabia", G, P1, 36, 18, "110 kV overhead line to King Khalid National Hospital substation, Jeddah", "EWR_SIEMENS", 2001, 110, None, T, "sub",
    "Turnkey construction of the 110 kV overhead transmission line to the King Khalid National Hospital substation, Jeddah.", 5600000, "SR", "", {"region": "Makkah"})
row("saudi-arabia", G, P1, 36, 19, "Makkah 33/13.8 kV underground and overhead distribution network (2001)", "SCECO", 2001, 33, None, D, "unknown",
    "Construction of the 33 kV / 13.8 kV underground and overhead distribution network, Makkah.", 26250000, "SR", "", {"region": "Makkah"})
row("saudi-arabia", G, P1, 37, 20, "Usheyrah–Al Mowayah 110 kV overhead transmission line", "EWR_SIEMENS", 2001, 110, None, T, "sub",
    "Turnkey construction of the 110 kV overhead transmission line, Usheyrah–Al Mowayah.", 40725000, "SR", "", {})
row("saudi-arabia", G, P1, 37, 21, "Makkah 33/13.8 kV underground and overhead distribution network (2000)", "SCECO", 2000, 33, None, D, "unknown",
    "Construction of the 33 kV / 13.8 kV underground and overhead distribution network, Makkah.", 20000000, "SR", "", {"region": "Makkah"})
row("saudi-arabia", G, P1, 37, 22, "Makkah 33/13.8 kV overhead distribution network (1999)", "SCECO", 1999, 33, None, D, "unknown",
    "Construction of the 33 kV / 13.8 kV overhead distribution network, Makkah.", 14375000, "SR", "", {"region": "Makkah"})
row("saudi-arabia", G, P1, 37, 23, "HT and LT cable trenching and laying for substation networks, Makkah", "SCECO", 1999, None, None, D, "unknown",
    "Trenching and laying of HT and LT cables for substation distribution networks, Makkah.", 6000000, "SR", "", {"region": "Makkah"})
row("saudi-arabia", G, P1, 37, 24, "Mobile telecom repeater stations, Western Region", "SOI", 1999, None, None, X, "unknown",
    "Installation of repeater stations for the mobile telecom network in the Western Region.", 6000000, "SR", "", {})
row("saudi-arabia", G, P1, 37, 25, "Yanbu–Madinah 380 kV and Badr–Al Musayjid 110 kV line rehabilitation", "SCECO_NPCC", 1997, 380, None, T, "sub",
    "Rehabilitation of the 380 kV Yanbu–Madinah and 110 kV Badr–Al Musayjid power transmission lines.", 1325000, "SR", "", {"region": "Madinah"})
row("saudi-arabia", G, P1, 37, 26, "110 kV cable trenching and laying, EWR Project No. 131/1/13, Jeddah", "EWR_SUED", 1997, 110, None, T, "sub",
    "Trenching and laying of 110 kV cables, EWR Project No. 131/1/13, Jeddah.", 917000, "SR", "", {"region": "Makkah"})
row("saudi-arabia", G, P1, 37, 27, "Umm Al-Qura University–South Aziziyah 110 kV double-circuit line, Makkah", "SCECO_SIEMENS", 1996, 110, None, T, "sub",
    "Supply, erection and commissioning of the 110 kV double-circuit overhead transmission line from the new Umm Al-Qura University to South Aziziyah, Makkah.", 12960000, "SR", "", {"region": "Makkah"})
row("saudi-arabia", G, P1, 37, 28, "Makkah 33/13.8 kV underground and overhead distribution network (1993)", "SCECO", 1993, 33, None, D, "unknown",
    "Construction of the 33 kV / 13.8 kV underground and overhead distribution network, Makkah.", 12190000, "SR", "", {"region": "Makkah"})
row("saudi-arabia", G, P1, 37, 29, "Jeddah 33 kV underground and overhead distribution network", "SCECO", 1993, 33, None, D, "unknown",
    "Construction of the 33 kV underground and overhead distribution network, Jeddah.", 3972500, "SR", "", {"region": "Makkah"})
row("saudi-arabia", G, P1, 37, 30, "Riyadh 33/13.8 kV underground and overhead distribution network (1992)", "SCECO", 1992, 33, None, D, "unknown",
    "Construction of the 33 kV / 13.8 kV underground and overhead distribution network, Riyadh.", 2500000, "SR", "", {"region": "Riyadh"})
row("saudi-arabia", G, P1, 37, 31, "Tower foundation protection, 110 kV line, Madinah", "SCECO", 1992, 110, None, T, "unknown",
    "Protection works for tower foundations of the 110 kV overhead line in the Madinah Al-Munawwarah area.", 602000, "SR", "", {"region": "Madinah"})
row("saudi-arabia", G, P1, 38, 32, "Makkah 33/13.8 kV underground and overhead distribution network (1991)", "SCECO", 1991, 33, None, D, "unknown",
    "Construction of the 33 kV / 13.8 kV underground and overhead distribution network at Makkah.", 8370000, "SR", "", {"region": "Makkah"})
row("saudi-arabia", G, P1, 38, 33, "Riyadh 33/13.8 kV underground distribution network (1991)", "SCECO", 1991, 33, None, D, "unknown",
    "Construction of the 33 kV / 13.8 kV underground distribution network in the Riyadh area.", 7000000, "SR", "Client printed as 'SCECOP' on p.38.", {"region": "Riyadh"})
row("saudi-arabia", G, P1, 38, 34, "Riyadh 13.8 kV underground and overhead distribution network (1990)", "SCECO", 1990, 13.8, None, D, "unknown",
    "Construction of the 13.8 kV underground and overhead distribution network, Riyadh.", 14500000, "SR", "", {"region": "Riyadh"})
row("saudi-arabia", G, P1, 38, 35, "Makkah 13.8 kV underground and overhead distribution network (1990)", "SCECO", 1990, 13.8, None, D, "unknown",
    "Construction of the 13.8 kV underground and overhead distribution network, Makkah.", 7920000, "SR", "", {"region": "Makkah"})
row("saudi-arabia", G, P1, 38, 36, "Underground power cable around the Haram Sharif, Makkah", "RCD", 1990, None, None, D, "unknown",
    "Laying of underground electrical power cable around the Haram Sharif, Makkah.", 2970000, "SR",
    "The same entry appears twice on p.38 (items 36 and 37); shown once.", {"region": "Makkah"})
row("saudi-arabia", G, P1, 38, 38, "Makkah 110 kV overhead line extension and reinforcement", "SCECO", 1988, 110, None, T, "unknown",
    "Extension and reinforcement of the 110 kV overhead line in Makkah.", 10800000, "SR", "", {"region": "Makkah"})
row("saudi-arabia", G, P1, 38, 39, "Yanbu 132 kV double-circuit line (foundations)", "SCECO", 1988, 132, None, T, "unknown",
    "Construction of foundations for the 132 kV double-circuit line in the Yanbu area.", 6000000, "SR", "", {"region": "Madinah"})
row("saudi-arabia", G, P1, 38, 40, "Al Jouf 13.8 kV overhead lines and distribution network", "NEPCO", 1986, 13.8, None, D, "unknown",
    "Construction of 13.8 kV overhead lines for the Al Jouf electrification and distribution network.", 2009000, "SR", "", {"region": "Al Jouf"})
row("saudi-arabia", G, P1, 38, 41, "Shoaiba–Makkah–Taif 110 kV towers: assembly and erection", "SSEM", 1986, 110, None, T, "sub",
    "Assembly and erection of 110 kV overhead transmission line towers for the Shoaiba–Makkah–Taif section.", 1200000, "SR", "", {"region": "Makkah"})
row("saudi-arabia", G, P1, 38, 42, "Makkah–Taif 110 kV overhead line extension", "SCECO_SIEMENS", 1979, 110, None, T, "sub",
    "Construction of the 110 kV overhead transmission line, Makkah–Taif extension.", 2840000, "SR", "", {"region": "Makkah"})

# ---------------------------------------------------------------- Libya (P1 pp.39-43)
row("libya", G, P1, 39, 1, "Samnu–Sebha 220 kV double-circuit twin-bundle line", "GECOL", 2011, 220, None, T, "unknown",
    "Construction of the 220 kV double-circuit twin-bundle transmission line from Samnu to the 220 kV Sebha grid station, Sebha province.", 28.65, "LD million", "", {"flagship": True, "region": "Sebha"})
row("libya", G, P1, 39, 2, "Jalo area infrastructure works", "GEC", 2010, None, None, C, "unknown",
    "Construction of infrastructure works in the Jalo area.", 2.85, "LD million", "", {"region": "Al Wahat"})
row("libya", G, P1, 39, 3, "33 kV transmission lines and substations", "GECOL_ELPCO", 2009, 33, None, D, "unknown",
    "Construction of 33 kV transmission lines and substations.", 17.55, "LD million", "", {})
row("libya", G, P1, 39, 4, "66 kV double-circuit single-conductor line: foundations, erection and stringing", "ECCO", 2008, 66, None, T, "unknown",
    "Foundations, erection and stringing of a 66 kV double-circuit single-conductor transmission line.", 1.68, "LD million", "Client printed as 'EECO Company' on p.39.", {})
row("libya", G, P1, 39, 5, "Raguba hi-line replacement, Phase III", "SIRTE", 2007, None, None, O, "unknown",
    "Raguba hi-line replacement, Phase III.", 0.33, "LD million", "", {"region": "Raguba field"})
row("libya", G, P1, 39, 6, "Ammonia I and II plants installation works", "SIRTE", 2006, None, None, I, "unknown",
    "Installation works at the Ammonia I and II plants.", 0.92, "LD million", "", {})
row("libya", G, P1, 39, 7, "Electrification of four wells, Messla and Sarir", "AGOCO", 2006, None, None, O, "unknown",
    "Electrification of four wells in the Messla and Sarir fields.", 0.78, "LD million", "", {"region": "Messla and Sarir fields"})
row("libya", G, P1, 39, 8, "66 kV double-circuit single-conductor line: stringing", "ECCO", 2005, 66, None, T, "unknown",
    "Stringing of a 66 kV double-circuit single-conductor transmission line.", 1.36, "LD million", "", {})
row("libya", G, P1, 39, 9, "Hot-line maintenance of a 138 kV transmission line", "WAHA", 2004, 138, None, O, "unknown",
    "Hot-line (live-line) maintenance of a 138 kV transmission line.", 12.33, "LD million", "", {"hotline": True})
row("libya", G, P1, 39, 10, "Sarir field electrical refurbishment in hazardous areas", "AGOCO", 2004, None, None, O, "unknown",
    "Refurbishment of electrical installations in hazardous areas, Sarir field.", 2.5, "LD million", "", {"region": "Sarir field"})
row("libya", G, P1, 40, 11, "Sarir field underground cable works", "AGOCO", 2003, None, None, O, "unknown",
    "Supply, design, erection and construction of underground cable works at Sarir field.", 1.00, "LD million", "", {"region": "Sarir field"})
row("libya", G, P1, 40, 12, "Underground telephone cable civil works, Aziziya to Gharyan", "AGOCO", 2003, None, None, X, "unknown",
    "Civil works for an underground telephone cable from Aziziya to Gharyan.", 1.4, "LD million", "", {})
row("libya", G, P1, 40, 13, "Steel pole refurbishment, 33 kV Sarir and 11 kV Messla overhead lines", "AGOCO", 2002, 33, None, O, "unknown",
    "Refurbishment of steel poles on the 33 kV overhead lines at Sarir and the 11 kV overhead line in the Messla field.", 2.9, "LD million", "", {"region": "Messla and Sarir fields"})
row("libya", G, P1, 40, 14, "Benghazi–eastern border 220 kV double-circuit lines, 750 km", "SOE_LY", 2001, 220, 750, T, "main",
    "Turnkey project for 220 kV double-circuit transmission lines from Benghazi to the eastern border (750 km).", 151.00, "LD million", "", {"flagship": True, "region": "Cyrenaica"})
row("libya", G, P1, 40, 15, "Sarir area 11 kV overhead lines", "AGOCO", 2000, 11, None, O, "unknown",
    "Construction of 11 kV overhead lines in the Sarir area.", 1.2, "LD million", "", {"region": "Sarir field"})
row("libya", G, P1, 40, 16, "Sarir field flow line, 20 km", "AGOCO", 1997, None, 20, X, "unknown",
    "Flow line, 20 km, Sarir field.", 0.4, "LD million", "", {"region": "Sarir field"})
row("libya", G, P1, 40, 17, "Messla field cathodic protection", "AGOCO", 1997, None, None, O, "unknown",
    "Cathodic protection, Messla field.", 1.45, "LD million", "", {"region": "Messla field"})
row("libya", G, P1, 40, 18, "Messla field 33 kV cable termination", "AGOCO", 1997, 33, None, O, "unknown",
    "Termination of the 33 kV transmission line cable, Messla field.", 1.7, "LD million", "", {"region": "Messla field"})
row("libya", G, P1, 40, 19, "Hamada field corroded trunk line renewal, 15 km extra job", "AGOCO", 1995, None, 15, X, "unknown",
    "Renewal of corroded trunk lines, extra job of 15 km, Hamada field.", 0.6, "LD million", "", {"region": "Hamada field"})
row("libya", G, P1, 40, 20, "Messla field 11 and 33 kV lines and four substations", "AGOCO", 1994, 33, None, O, "unknown",
    "Construction of 11 kV and 33 kV transmission lines and four substations, Messla field.", 16.55, "LD million", "", {"region": "Messla field"})
row("libya", G, P1, 40, 21, "Nafoora field water source well electrification", "AGOCO", 1994, None, None, O, "unknown",
    "Electrification of water source wells, Nafoora field.", None, "LD",
    "Value printed as '1,379,467' in a column headed 'Million' (p.40); not legible with certainty.", {"region": "Nafoora field"})
row("libya", G, P1, 41, 22, "El Giza electrical power supply", "AGOCO", 1994, None, None, O, "unknown",
    "Supply of electrical power, El Giza.", 1.20, "LD million", "", {})
row("libya", G, P1, 41, 23, "Tajoura underground power cable (1994)", "GEC", 1994, None, None, D, "unknown",
    "Supply and laying of underground power cable, Tajoura area.", 2.00, "LD million", "", {"region": "Tripoli"})
row("libya", G, P1, 41, 24, "Zuwara 11 kV line", "GEC", 1994, 11, None, D, "unknown",
    "Construction of an 11 kV transmission line, Zuwara.", 1.00, "LD million", "", {"region": "Zuwara"})
row("libya", G, P1, 41, 25, "Al-Quasim underground power cable (1994)", "GEC", 1994, None, None, D, "unknown",
    "Laying of underground power cable in the Al-Quasim area.", 1.00, "LD million", "", {})
row("libya", G, P1, 41, 26, "220 kV transmission line maintenance (1994)", "GEC", 1994, 220, None, T, "unknown",
    "Maintenance of 220 kV transmission lines.", 1.00, "LD million", "", {})
row("libya", G, P1, 41, 27, "Hamada field flow line, 15 km", "AGOCO", 1994, None, 15, X, "unknown",
    "Flow line, 15 km, Hamada field.", 0.6, "LD million", "", {"region": "Hamada field"})
row("libya", G, P1, 41, 28, "Hamada field crude oil pipeline modification", "AGOCO", 1994, None, None, X, "unknown",
    "Modification of crude oil pipelines, Hamada field.", 0.4, "LD million", "", {"region": "Hamada field"})
row("libya", G, P1, 41, 29, "Hamada field corroded trunk line renewal", "AGOCO", 1994, None, None, X, "unknown",
    "Renewal of corroded trunk lines, Hamada field.", 0.5, "LD million", "", {"region": "Hamada field"})
row("libya", G, P1, 41, 30, "Nafoora field 4,000-barrel water tank", "AGOCO", 1994, None, None, C, "unknown",
    "Construction of a 4,000-barrel water tank, Nafoora field.", 0.58, "LD million", "", {"region": "Nafoora field"})
row("libya", G, P1, 41, 31, "220 kV transmission line maintenance (1993)", "GEC", 1993, 220, None, T, "unknown",
    "Maintenance of 220 kV transmission lines.", 0.90, "LD million", "", {})
row("libya", G, P1, 41, 32, "22.3 km, 8-inch crude oil trunk line", "AGOCO", 1993, None, 22.3, X, "unknown",
    "Construction of a 22.3 km, 8-inch diameter crude oil trunk line.", 3.50, "LD million", "", {})
row("libya", G, P1, 41, 33, "220 kV transmission line maintenance (1992)", "GEC", 1992, 220, None, T, "unknown",
    "Maintenance of 220 kV transmission lines.", 1.00, "LD million", "", {})
row("libya", G, P1, 41, 34, "Tajoura underground power cable (1992)", "GEC", 1992, None, None, D, "unknown",
    "Supply and laying of underground power cable, Tajoura area.", 1.95, "LD million", "", {"region": "Tripoli"})
row("libya", G, P1, 42, 35, "Al-Quasim 11 kV and LT underground cables (1991)", "GEC", 1991, 11, 10.65, D, "unknown",
    "Laying of the Al-Quasim 11 kV underground power cable (5.15 km) and LT underground power cable (5.5 km).", 1.00, "LD million", "", {})
row("libya", G, P1, 42, 36, "Potable water pipeline", "AGOCO", 1991, None, None, C, "unknown",
    "Installation of a potable water pipeline.", 0.30, "LD million", "", {})
row("libya", G, P1, 42, 37, "Hun–Wadi Arial–Samnu 220 kV transmission line", "GECOL_ELPCO", 1989, 220, None, T, "unknown",
    "Construction of the 220 kV transmission line Hun–Wadi Arial–Samnu.", 8.20, "LD million", "", {"flagship": True, "region": "Fezzan"})
row("libya", G, P1, 42, 38, "Jabal al Gharbi 66 kV transmission lines", "GEC", 1982, 66, None, T, "unknown",
    "Construction of 66 kV transmission lines, Jabal al Gharbi area.", 1.00, "LD million", "", {"region": "Jabal al Gharbi"})
row("libya", G, P1, 42, 39, "30 kV and 11 kV cable works", "GECOL_ELPCO", 1982, 30, None, D, "unknown",
    "Construction of 30 kV and 11 kV cable works.", 1.30, "LD million", "", {})
row("libya", G, P1, 42, 40, "Tripolitania 30 kV transmission lines (1981)", "ENERGOINVEST_SOE", 1981, 30, None, D, "sub",
    "Construction of 30 kV transmission lines in Tripolitania.", 2.30, "LD million", "", {"region": "Tripolitania"})
row("libya", G, P1, 42, 41, "Nalut–Ghadames 66 kV transmission line and extensions", "GECOL_ELPCO", 1981, 66, None, T, "unknown",
    "Construction of the 66 kV transmission line Nalut–Ghadames and extension works.", 8.62, "LD million", "", {"region": "Nalut and Ghadames"})
row("libya", G, P1, 42, 42, "Tripoli area 30 kV transmission lines, 200 km", "GECOL_ELPCO", 1981, 30, 200, D, "unknown",
    "Construction of 30 kV transmission lines around the Tripoli area (200 km).", 3.30, "LD million", "", {"region": "Tripoli"})
row("libya", G, P1, 42, 43, "Tripolitania 11 kV overhead lines", "ECT", 1981, 11, None, D, "unknown",
    "Construction of 11 kV overhead lines in Tripolitania.", 0.57, "LD million", "", {"region": "Tripolitania"})
row("libya", G, P1, 42, 44, "Jalo oasis 30 kV transmission lines", "GECOL_ELPCO", 1980, 30, None, D, "unknown",
    "Construction of 30 kV transmission lines in Jalo to the oasis.", 1.20, "LD million", "", {"region": "Al Wahat"})
row("libya", G, P1, 42, 45, "Tripolitania 30 kV transmission lines (1980)", "GECOL_ELPCO", 1980, 30, None, D, "unknown",
    "Construction of 30 kV transmission lines in Tripolitania.", 1.33, "LD million", "", {"region": "Tripolitania"})
row("libya", G, P1, 43, 46, "Misurata–Sirte 220 kV lines and Tripoli ring", "GECOL_ELPCO", 1980, 220, None, T, "unknown",
    "Construction of 220 kV transmission lines from Misurata to Sirte and the Tripoli ring.", 8.652, "LD million", "", {"flagship": True, "region": "Tripolitania"})
row("libya", G, P1, 43, 47, "Zuwara, Al-Asa and Zliten desalination plants: civil works", "ITOCHU", 1978, None, None, C, "sub",
    "Civil works for the desalination plants at Zuwara, Al-Asa and Zliten.", 3.73, "LD million", "", {})
row("libya", G, P1, 43, 48, "30/10 kV substations, Harbour site, Bab al-Aziziya and Suq al-Juma: civil works", "ENERGOINVEST", 1978, 30, None, S, "sub",
    "Civil works for 30/10 kV substations at the Harbour site, Bab al-Aziziya and Suq al-Juma.", 1.00, "LD million", "", {"region": "Tripoli"})

# ---------------------------------------------------------------- Iraq (P1 pp.43-45) values in USD thousand
row("iraq", G, P1, 43, 1, "Wasit–Kut 132 kV line, 26 km (stringing)", "SOE_IQ", 1986, 132, 26, T, "unknown",
    "Stringing of the 132 kV transmission line Wasit–Kut, 26 km.", 3921.00, "USD thousand", "", {"region": "Wasit"})
row("iraq", G, P1, 43, 2, "Rutba 33 kV line, 103 km (stringing)", "SOE_IQ", 1986, 33, 103, D, "unknown",
    "Stringing of the 33 kV line, Rutba, 103 km.", 3504.00, "USD thousand", "", {"region": "Anbar"})
row("iraq", G, P1, 43, 3, "Erection of 57 special towers", "MOD_IQ", 1986, None, None, X, "unknown",
    "Erection of 57 special towers.", 2807.00, "USD thousand", "", {})
row("iraq", G, P1, 43, 4, "Amara 132 kV line, 30 km (stringing)", "SOE_IQ", 1986, 132, 30, T, "unknown",
    "Stringing of the 132 kV line, Amara, 30 km.", 2457.00, "USD thousand", "", {"region": "Maysan"})
row("iraq", G, P1, 43, 5, "Mosul Dam–Dohuk 132 kV line, 60 km", "SOE_IQ", 1986, 132, 60, T, "unknown",
    "Erection and stringing of the 132 kV transmission line Mosul Dam–Dohuk (60 km).", 1499.00, "USD thousand", "", {"region": "Nineveh and Dohuk"})
row("iraq", G, P1, 43, 6, "Amara–Al-Adel 33 kV line, 22 km (stringing)", "SOE_IQ", 1986, 33, 22, D, "unknown",
    "Stringing of the 33 kV line Amara–Al-Adel, 22 km.", 746.00, "USD thousand", "", {"region": "Maysan"})
row("iraq", G, P1, 43, 7, "Akashat–Rutba 132 kV line, 100 km (stringing)", "SOE_IQ", 1983, 132, 100, T, "unknown",
    "Stringing of the 132 kV transmission line Akashat–Rutba, 100 km.", 9180.00, "USD thousand", "", {"region": "Anbar"})
row("iraq", G, P1, 44, 8, "Kirkuk 132 kV lines, 45 km", "SOE_IQ", 1983, 132, 45, T, "unknown",
    "132 kV transmission lines, Kirkuk, 45 km.", 4032.00, "USD thousand", "", {"region": "Kirkuk"})
row("iraq", G, P1, 44, 9, "Basrah–Al Qaim and Nasiriya–Baquba 33 kV lines, 120 km", "SOE_IQ", 1983, 33, 120, D, "unknown",
    "33 kV transmission lines Basrah–Al Qaim and Nasiriya–Kab–Baquba, 120 km.", 3270.00, "USD thousand", "", {})
row("iraq", G, P1, 44, 10, "Baghdad East–Baquba 400 kV line, 35 km (stringing)", "SOE_IQ", 1983, 400, 35, T, "unknown",
    "Stringing of the 400 kV line Baghdad East–Baquba, 35 km.", 3213.00, "USD thousand", "", {"region": "Baghdad and Diyala"})
row("iraq", G, P1, 44, 11, "Baghdad West–Baiji 400 kV line, 208 km", "SOE_IQ", 1983, 400, 208, T, "unknown",
    "400 kV transmission line Baghdad West–Baiji (208 km).", 2575.00, "USD thousand", "", {"region": "Baghdad and Salahuddin"})
row("iraq", G, P1, 44, 12, "Tuz–Hamrin 33 kV line, 65 km (stringing)", "SOE_IQ", 1983, 33, 65, D, "unknown",
    "Stringing of the 33 kV line Tuz–Hamrin, 65 km.", 2211.00, "USD thousand", "", {"region": "Salahuddin"})
row("iraq", G, P1, 44, 13, "Hadiya–Al Baghdadi 33 kV line, 35 km", "SOE_IQ", 1983, 33, 35, D, "unknown",
    "33 kV transmission line Hadiya–Al Baghdadi, 35 km.", 953.00, "USD thousand", "", {"region": "Anbar"})
row("iraq", G, P1, 44, 14, "Special telephone buildings 1-BP and 4-BP, Baghdad", "PTT_NIPPON", 1982, None, None, X, "sub",
    "Five special telephone works, 1-BP and 4-BP, Baghdad.", 2050.00, "USD thousand", "", {"region": "Baghdad"})
row("iraq", G, P1, 44, 15, "Baghdad telephone exchange network and Tikrit cable network", "PTT_MITSUBISHI", 1980, None, None, X, "sub",
    "Seventeen telephone exchange networks in Baghdad and the telephone cable network in Tikrit: cable laying in ducts, jointing, pressurisation and allied civil works.", 11680.00, "USD thousand", "", {"region": "Baghdad and Salahuddin"})
row("iraq", G, P1, 44, 16, "Nasiriya–Wasit–Baghdad 400 kV line, 358 km", "SOE_IQ", 1980, 400, 358, T, "unknown",
    "Erection and stringing of the 400 kV transmission line Nasiriya–Wasit–Baghdad (358 km).", 3201.00, "USD thousand", "", {})
row("iraq", G, P1, 44, 17, "Baghdad West–Tameem 132 kV line, 225 km", "SOE_IQ", 1980, 132, 225, T, "unknown",
    "Construction of the 132 kV transmission line Baghdad West–Tameem (225 km).", 1552.00, "USD thousand", "", {})
row("iraq", G, P1, 44, 18, "Khor Al-Zubair–Nasiriya and Khor Al-Zubair–Hartha lines (stringing)", "SOE_IQ", 1978, None, 311, T, "unknown",
    "Stringing of the transmission lines Khor Al-Zubair–Nasiriya (205 km) and Khor Al-Zubair–Hartha (106 km).", 3685.00, "USD thousand",
    "Continues onto p.45. Voltage not stated.", {"region": "Basrah and Dhi Qar"})
row("iraq", G, P1, 45, 19, "Dukan–Erbil 132 kV line, 98 km", "SOE_ENERGOINVEST", 1978, 132, 98, T, "sub",
    "Construction of the 132 kV transmission line Dukan–Erbil (98 km).", 1399.00, "USD thousand", "", {"region": "Kurdistan Region"})
row("iraq", G, P1, 45, 20, "Dukan–Kirkuk 132 kV line, 76 km", "SOE_IQ", 1977, 132, 76, T, "unknown",
    "Construction of the 132 kV transmission line Dukan–Kirkuk (76 km).", 1656.00, "USD thousand", "", {})
row("iraq", G, P1, 45, 21, "Dukan–Sulaymaniyah 132 kV line, 65 km", "SOE_IQ", 1977, 132, 65, T, "unknown",
    "Construction of the 132 kV transmission line Dukan–Sulaymaniyah (65 km).", 2249.00, "USD thousand", "", {"region": "Kurdistan Region"})
row("iraq", G, P1, 45, 22, "West–Harriya 132 kV line, 25 km", "SOE_IQ", 1977, 132, 25, T, "unknown",
    "Construction of the 132 kV transmission line West–Harriya (25 km).", 3028.00, "USD thousand", "", {})
row("iraq", G, P1, 45, 23, "West–Marria 132 kV lines, 50 km", "SOE_IQ", 1977, 132, 50, T, "unknown",
    "Construction of the 132 kV transmission lines West–Marria (50 km).", 3633.00, "USD thousand", "", {})

# ---------------------------------------------------------------- Iran, Malaysia, Mozambique (P1 p.46)
row("iran", G, P1, 46, 1, "Tehran–Neka 400 kV transmission line", "FURUKAWA", 1982, 400, None, T, "sub",
    "Construction of the 400 kV transmission line from Tehran to Neka.", 56.765, "million (currency not stated)", "", {"region": "Tehran and Mazandaran"})
row("iran", G, P1, 46, 2, "Shiraz–Bushehr 230 kV transmission line (stringing)", "JAMES_SCOTT", 1979, 230, None, T, "sub",
    "Stringing of the 230 kV transmission line from Shiraz to Bushehr.", 5.35, "million (currency not stated)", "", {"region": "Fars and Bushehr"})
row("malaysia", G, P1, 46, 1, "Ayer Tawar–Junjung 500 kV double-circuit line, 80 km", "TNB", 1998, 500, 80, T, "unknown",
    "Erection and stringing of the double-circuit 500 kV transmission line from Ayer Tawar to Junjung (80 km).", None, "MR",
    "The profile gives one combined value (6,300 MR) for the three Malaysian lines.", {"flagship": True, "region": "Perak and Penang"})
row("malaysia", G, P1, 46, 2, "Junjung–Gurun 500 kV double-circuit line, 20 km", "TNB", 1998, 500, 20, T, "unknown",
    "Erection and stringing of the double-circuit 500 kV transmission line from Junjung to Gurun (20 km).", None, "MR",
    "The profile gives one combined value (6,300 MR) for the three Malaysian lines.", {"region": "Penang and Kedah"})
row("malaysia", G, P1, 46, 3, "Ayer Hitam–Yong Peng 275 kV double-circuit line, 40 km", "TNB", 1998, 275, 40, T, "unknown",
    "Erection and stringing of the double-circuit 275 kV transmission line from Ayer Hitam to Yong Peng (40 km).", None, "MR",
    "The profile gives one combined value (6,300 MR) for the three Malaysian lines.", {"region": "Johor"})
row("mozambique", G, P1, 46, 1, "Songo–Apollo ±533 kV HVDC transmission line", "CI2000", 1997, 533, None, T, "sub",
    "Works on the ±533 kV HVDC transmission line from Songo to Apollo, for Consorzio Italia 2000.", 62.72, "million (currency not stated)",
    "Consorzio Italia 2000 was a contractor for the rehabilitation of the Cahora Bassa HVDC line, returned to service in October 1997 (see facts.md).",
    {"flagship": True, "region": "Tete", "url": "https://www.ci2000.net/r/hvdc-transmission-lines-cahora-bassa/"})

COUNTRY_NAMES = {"pakistan": "Pakistan", "saudi-arabia": "Saudi Arabia", "libya": "Libya", "iraq": "Iraq",
                 "iran": "Iran", "malaysia": "Malaysia", "mozambique": "Mozambique"}


def slugify(s):
    s = s.lower().replace("±", "").replace("–", "-").replace("&", "and")
    s = re.sub(r"[^a-z0-9]+", "-", s).strip("-")
    return re.sub(r"-+", "-", s)


out, seen = [], set()
for (country, group, pdf, page, sr, name, ck, year, kv, km, sector, role, scope, value, cur, notes, extra) in R:
    base = slugify(name)
    base = re.sub(r"-(19|20)\d\d$", "", base)
    slug = base if base not in seen else f"{base}-{year or sr}"
    assert slug not in seen, slug
    seen.add(slug)
    if role == "unknown" and ck in SUB_CLIENTS:
        role = "sub"
    src = {"pdf": pdf, "page": page, "url": extra.get("url")}
    pages = [page]
    if "dupe" in extra:
        pages.append(extra["dupe"][0])
    if "km_src" in extra:
        src["length_from"] = {"pdf": extra["km_src"][0], "page": extra["km_src"][1]}
    out.append({
        "id": f"{country}-{sr}-{page}" if isinstance(sr, int) else f"{country}-{sr}",
        "slug": slug,
        "name": name,
        "client": CLIENTS[ck],
        "country": COUNTRY_NAMES[country],
        "country_slug": country,
        "region": extra.get("region"),
        "group": group,
        "sector": sector,
        "voltage_kv": kv,
        "length_km": km,
        "year_start": extra.get("year_start"),
        "year_end": year,
        "role": role,
        "scope": scope,
        "value": {"amount": value, "currency": cur, "year": None, "verified": False},
        "flagship": bool(extra.get("flagship")),
        "hotline": bool(extra.get("hotline")),
        "images": [],
        "source": src,
        "notes": notes,
    })

path = ROOT / "src" / "data" / "projects.json"
path.write_text(json.dumps(out, indent=2, ensure_ascii=False) + "\n")
from collections import Counter
print(len(out), "projects written")
print(Counter(p["country"] for p in out))
print(Counter(p["sector"] for p in out))
