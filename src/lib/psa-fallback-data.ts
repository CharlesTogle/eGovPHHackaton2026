/**
 * PSA Geographic Reference Datasets & eReport Categories
 *
 * Sourced directly from eReport System API Datasets (eReport-API-Documentation.md).
 * Used as high-fidelity offline/demo fallback data when API access is offline or rate-limited.
 */

export interface RegionItem {
  id: string
  name: string
}

export interface ProvinceItem {
  id: string
  region_code: string
  name: string
}

export interface MunicipalityItem {
  id: string
  region_code: string
  province_code: string
  name: string
}

export interface BarangayItem {
  id: string
  region_code: string
  province_code: string
  municipality_code: string
  name: string
}

export interface ReportTypeItem {
  id: string
  code: string
  name: string
  sequence: number
  is_visible: boolean
  is_active: boolean
}

export const PSA_REPORT_TYPES: ReportTypeItem[] = [
  { id: "8b749070-1a87-4d87-b998-08b6faace7f0", code: "fire", name: "Fire & Disaster Emergency Response", sequence: 1, is_visible: true, is_active: true },
  { id: "f4f149c3-b089-48f6-a4a1-78c86ed52dfc", code: "accident", name: "Accident & Medical Emergency", sequence: 2, is_visible: true, is_active: true },
  { id: "faa2eb76-db67-4c17-9bc6-6c65e87a0ea1", code: "red_tape", name: "Red Tape / Calamity Assistance Concern", sequence: 3, is_visible: true, is_active: true },
]

export const PSA_REGIONS: RegionItem[] = [
  { id: "010000000", name: "REGION I (ILOCOS REGION)" },
  { id: "020000000", name: "REGION II (CAGAYAN VALLEY)" },
  { id: "030000000", name: "REGION III (CENTRAL LUZON)" },
  { id: "040000000", name: "REGION IV-A (CALABARZON)" },
  { id: "050000000", name: "REGION V (BICOL REGION)" },
  { id: "060000000", name: "REGION VI (WESTERN VISAYAS)" },
  { id: "070000000", name: "REGION VII (CENTRAL VISAYAS)" },
  { id: "080000000", name: "REGION VIII (EASTERN VISAYAS)" },
  { id: "090000000", name: "REGION IX (ZAMBOANGA PENINSULA)" },
  { id: "100000000", name: "REGION X (NORTHERN MINDANAO)" },
  { id: "110000000", name: "REGION XI (DAVAO REGION)" },
  { id: "120000000", name: "REGION XII (SOCCSKSARGEN)" },
  { id: "130000000", name: "NATIONAL CAPITAL REGION (NCR)" },
  { id: "140000000", name: "CORDILLERA ADMINISTRATIVE REGION (CAR)" },
  { id: "150000000", name: "AUTONOMOUS REGION IN MUSLIM MINDANAO (ARMM)" },
  { id: "160000000", name: "REGION XIII (Caraga)" },
  { id: "170000000", name: "MIMAROPA REGION" },
  { id: "180000000", name: "NEGROS ISLAND REGION (NIR)" },
]

export const PSA_PROVINCES: Record<string, ProvinceItem[]> = {
  // 01: Ilocos
  "010000000": [
    { id: "010550000", region_code: "010000000", name: "PANGASINAN" },
    { id: "010280000", region_code: "010000000", name: "ILOCOS NORTE" },
    { id: "010290000", region_code: "010000000", name: "ILOCOS SUR" },
    { id: "010330000", region_code: "010000000", name: "LA UNION" },
  ],
  // 02: Cagayan Valley
  "020000000": [
    { id: "020150000", region_code: "020000000", name: "CAGAYAN" },
    { id: "020310000", region_code: "020000000", name: "ISABELA" },
    { id: "020500000", region_code: "020000000", name: "NUEVA VIZCAYA" },
  ],
  // 03: Central Luzon
  "030000000": [
    { id: "030540000", region_code: "030000000", name: "PAMPANGA" },
    { id: "030140000", region_code: "030000000", name: "BULACAN" },
    { id: "030690000", region_code: "030000000", name: "TARLAC" },
    { id: "030710000", region_code: "030000000", name: "ZAMBALES" },
  ],
  // 04: CALABARZON
  "040000000": [
    { id: "042100000", region_code: "040000000", name: "CAVITE" },
    { id: "041000000", region_code: "040000000", name: "BATANGAS" },
    { id: "043400000", region_code: "040000000", name: "LAGUNA" },
    { id: "045600000", region_code: "040000000", name: "QUEZON" },
    { id: "045800000", region_code: "040000000", name: "RIZAL" },
  ],
  // 05: Bicol Region
  "050000000": [
    { id: "050050000", region_code: "050000000", name: "ALBAY" },
    { id: "050170000", region_code: "050000000", name: "CAMARINES SUR" },
    { id: "050620000", region_code: "050000000", name: "SORSOGON" },
  ],
  // 06: Western Visayas
  "060000000": [
    { id: "060300000", region_code: "060000000", name: "ILOILO" },
    { id: "060040000", region_code: "060000000", name: "AKLAN" },
    { id: "060190000", region_code: "060000000", name: "CAPIZ" },
  ],
  // 07: Central Visayas
  "070000000": [
    { id: "070220000", region_code: "070000000", name: "CEBU" },
    { id: "070120000", region_code: "070000000", name: "BOHOL" },
    { id: "070460000", region_code: "070000000", name: "NEGROS ORIENTAL" },
  ],
  // 08: Eastern Visayas
  "080000000": [
    { id: "080370000", region_code: "080000000", name: "LEYTE" },
    { id: "080480000", region_code: "080000000", name: "NORTHERN SAMAR" },
    { id: "080600000", region_code: "080000000", name: "SAMAR (WESTERN SAMAR)" },
  ],
  // 09: Zamboanga Peninsula
  "090000000": [
    { id: "090730000", region_code: "090000000", name: "ZAMBOANGA DEL SUR" },
    { id: "090720000", region_code: "090000000", name: "ZAMBOANGA DEL NORTE" },
  ],
  // 10: Northern Mindanao
  "100000000": [
    { id: "100430000", region_code: "100000000", name: "MISAMIS ORIENTAL" },
    { id: "100130000", region_code: "100000000", name: "BUKIDNON" },
  ],
  // 11: Davao Region
  "110000000": [
    { id: "110240000", region_code: "110000000", name: "DAVAO DEL SUR" },
    { id: "110230000", region_code: "110000000", name: "DAVAO DEL NORTE" },
  ],
  // 12: SOCCSKSARGEN
  "120000000": [
    { id: "120630000", region_code: "120000000", name: "SOUTH COTABATO" },
    { id: "120470000", region_code: "120000000", name: "COTABATO (NORTH COTABATO)" },
  ],
  // 13: NCR
  "130000000": [
    { id: "130740000", region_code: "130000000", name: "NCR, SECOND DISTRICT (Quezon City, Marikina, etc.)" },
    { id: "130390000", region_code: "130000000", name: "NCR, FIRST DISTRICT (Manila)" },
    { id: "130760000", region_code: "130000000", name: "NCR, FOURTH DISTRICT (Makati, Pasay, Taguig, etc.)" },
  ],
  // 14: CAR
  "140000000": [
    { id: "140110000", region_code: "140000000", name: "BENGUET" },
    { id: "140270000", region_code: "140000000", name: "IFUGAO" },
  ],
  // 15: ARMM
  "150000000": [
    { id: "150380000", region_code: "150000000", name: "MAGUINDANAO" },
    { id: "150360000", region_code: "150000000", name: "LANAO DEL SUR" },
  ],
  // 16: Caraga
  "160000000": [
    { id: "160020000", region_code: "160000000", name: "AGUSAN DEL NORTE" },
    { id: "160670000", region_code: "160000000", name: "SURIGAO DEL NORTE" },
  ],
  // 17: MIMAROPA
  "170000000": [
    { id: "170530000", region_code: "170000000", name: "PALAWAN" },
    { id: "170520000", region_code: "170000000", name: "ORIENTAL MINDORO" },
  ],
  // 18: NIR
  "180000000": [
    { id: "180450000", region_code: "180000000", name: "NEGROS OCCIDENTAL" },
    { id: "180460000", region_code: "180000000", name: "NEGROS ORIENTAL" },
  ],
}

export const PSA_MUNICIPALITIES: Record<string, MunicipalityItem[]> = {
  // Pangasinan (010550000)
  "010550000": [
    { id: "0105503000", region_code: "010000000", province_code: "010550000", name: "CITY OF ALAMINOS" },
    { id: "0105517000", region_code: "010000000", province_code: "010550000", name: "DAGUPAN CITY" },
    { id: "0105522000", region_code: "010000000", province_code: "010550000", name: "LINGAYEN (Capital)" },
  ],
  // Cagayan (020150000)
  "020150000": [
    { id: "0201529000", region_code: "020000000", province_code: "020150000", name: "TUGUEGARAO CITY (Capital)" },
    { id: "0201501000", region_code: "020000000", province_code: "020150000", name: "ABULUG" },
  ],
  // Pampanga (030540000)
  "030540000": [
    { id: "0305416000", region_code: "030000000", province_code: "030540000", name: "CITY OF SAN FERNANDO (Capital)" },
    { id: "0305401000", region_code: "030000000", province_code: "030540000", name: "ANGELES CITY" },
  ],
  // Cavite (042100000)
  "042100000": [
    { id: "042111000", region_code: "040000000", province_code: "042100000", name: "KAWIT" },
    { id: "042103000", region_code: "040000000", province_code: "042100000", name: "BACOOR CITY" },
    { id: "042109000", region_code: "040000000", province_code: "042100000", name: "IMUS CITY" },
  ],
  // Albay (050050000)
  "050050000": [
    { id: "0500506000", region_code: "050000000", province_code: "050050000", name: "LEGAZPI CITY (Capital)" },
    { id: "0500501000", region_code: "050000000", province_code: "050050000", name: "NAGA CITY" },
  ],
  // Iloilo (060300000)
  "060300000": [
    { id: "0603022000", region_code: "060000000", province_code: "060300000", name: "ILOILO CITY (Capital)" },
    { id: "0603001000", region_code: "060000000", province_code: "060300000", name: "PASSICITY" },
  ],
  // Cebu (070220000)
  "070220000": [
    { id: "0702217000", region_code: "070000000", province_code: "070220000", name: "CEBU CITY (Capital)" },
    { id: "0702226000", region_code: "070000000", province_code: "070220000", name: "LAPU-LAPU CITY" },
  ],
  // Bohol (070120000)
  "070120000": [
    { id: "0701200001", region_code: "070000000", province_code: "070120000", name: "TAGBILARAN CITY" },
  ],
  // Leyte (080370000)
  "080370000": [
    { id: "0803747000", region_code: "080000000", province_code: "080370000", name: "TACLOBAN CITY (Capital)" },
    { id: "0803738000", region_code: "080000000", province_code: "080370000", name: "ORMOC CITY" },
  ],
  // Zamboanga del Sur (090730000)
  "090730000": [
    { id: "0907332000", region_code: "090000000", province_code: "090730000", name: "ZAMBOANGA CITY" },
    { id: "0907322000", region_code: "090000000", province_code: "090730000", name: "PAGADIAN CITY (Capital)" },
  ],
  // Misamis Oriental (100430000)
  "100430000": [
    { id: "1004305000", region_code: "100000000", province_code: "100430000", name: "CAGAYAN DE ORO CITY (Capital)" },
  ],
  // Davao del Sur (110240000)
  "110240000": [
    { id: "1102402000", region_code: "110000000", province_code: "110240000", name: "DAVAO CITY" },
    { id: "1102401000", region_code: "110000000", province_code: "110240000", name: "DIGOS CITY (Capital)" },
  ],
  // South Cotabato (120630000)
  "120630000": [
    { id: "1206303000", region_code: "120000000", province_code: "120630000", name: "GENERAL SANTOS CITY" },
    { id: "1206306000", region_code: "120000000", province_code: "120630000", name: "KORONADAL CITY (Capital)" },
  ],
  // NCR Second District (130740000)
  "130740000": [
    { id: "1307404000", region_code: "130000000", province_code: "130740000", name: "QUEZON CITY" },
    { id: "1307402000", region_code: "130000000", province_code: "130740000", name: "MARIKINA CITY" },
  ],
  // Benguet (140110000)
  "140110000": [
    { id: "1401102000", region_code: "140000000", province_code: "140110000", name: "BAGUIO CITY" },
    { id: "1401101000", region_code: "140000000", province_code: "140110000", name: "LA TRINIDAD (Capital)" },
  ],
  // Maguindanao (150380000)
  "150380000": [
    { id: "1503805000", region_code: "150000000", province_code: "150380000", name: "COTABATO CITY" },
  ],
  // Agusan del Norte (160020000)
  "160020000": [
    { id: "1600202000", region_code: "160000000", province_code: "160020000", name: "BUTUAN CITY (Capital)" },
  ],
  // Palawan (170530000)
  "170530000": [
    { id: "1705316000", region_code: "170000000", province_code: "170530000", name: "PUERTO PRINCESA CITY (Capital)" },
  ],
  // Negros Occidental (180450000)
  "180450000": [
    { id: "1804501000", region_code: "180000000", province_code: "180450000", name: "BACOLOD CITY (Capital)" },
  ],
}

export const PSA_BARANGAYS: Record<string, BarangayItem[]> = {
  // City of Alaminos (0105503000)
  "0105503000": [
    { id: "0105503021", region_code: "010000000", province_code: "010550000", municipality_code: "0105503000", name: "Poblacion" },
    { id: "0105503001", region_code: "010000000", province_code: "010550000", municipality_code: "0105503000", name: "Alos" },
    { id: "0105503010", region_code: "010000000", province_code: "010550000", municipality_code: "0105503000", name: "Lucap" },
  ],
  // Tuguegarao City (0201529000)
  "0201529000": [
    { id: "0201529001", region_code: "020000000", province_code: "020150000", municipality_code: "0201529000", name: "Centro 1 (Poblacion)" },
    { id: "0201529010", region_code: "020000000", province_code: "020150000", municipality_code: "0201529000", name: "Caritan Sur" },
  ],
  // San Fernando Pampanga (0305416000)
  "0305416000": [
    { id: "0305416001", region_code: "030000000", province_code: "030540000", municipality_code: "0305416000", name: "Dolores" },
    { id: "0305416010", region_code: "030000000", province_code: "030540000", municipality_code: "0305416000", name: "San Jose" },
  ],
  // Kawit (042111000)
  "042111000": [
    { id: "042111011", region_code: "040000000", province_code: "042100000", municipality_code: "042111000", name: "Toclong" },
    { id: "042111006", region_code: "040000000", province_code: "042100000", municipality_code: "042111000", name: "Poblacion" },
    { id: "042111014", region_code: "040000000", province_code: "042100000", municipality_code: "042111000", name: "Balsahan-Bisita" },
  ],
  // Legazpi City (0500506000)
  "0500506000": [
    { id: "0500506001", region_code: "050000000", province_code: "050050000", municipality_code: "0500506000", name: "Oro Site" },
    { id: "0500506010", region_code: "050000000", province_code: "050050000", municipality_code: "0500506000", name: "Rawis" },
  ],
  // Iloilo City (0603022000)
  "0603022000": [
    { id: "0603022001", region_code: "060000000", province_code: "060300000", municipality_code: "0603022000", name: "City Proper" },
    { id: "0603022010", region_code: "060000000", province_code: "060300000", municipality_code: "0603022000", name: "Mandurriao" },
  ],
  // Cebu City (0702217000)
  "0702217000": [
    { id: "0702217001", region_code: "070000000", province_code: "070220000", municipality_code: "0702217000", name: "Lahug" },
    { id: "0702217012", region_code: "070000000", province_code: "070220000", municipality_code: "0702217000", name: "Mabolo" },
  ],
  // Tagbilaran City (0701200001)
  "0701200001": [
    { id: "070120000101", region_code: "070000000", province_code: "070120000", municipality_code: "0701200001", name: "Poblacion I" },
    { id: "070120000102", region_code: "070000000", province_code: "070120000", municipality_code: "0701200001", name: "Cogon" },
    { id: "070120000103", region_code: "070000000", province_code: "070120000", municipality_code: "0701200001", name: "Bool" },
  ],
  // Tacloban City (0803747000)
  "0803747000": [
    { id: "0803747001", region_code: "080000000", province_code: "080370000", municipality_code: "0803747000", name: "Brgy. 83 (San Jose)" },
    { id: "0803747010", region_code: "080000000", province_code: "080370000", municipality_code: "0803747000", name: "Brgy. 84 (Sagkahan)" },
    { id: "0803747020", region_code: "080000000", province_code: "080370000", municipality_code: "0803747000", name: "Brgy. 88 (Anibong)" },
  ],
  // Zamboanga City (0907332000)
  "0907332000": [
    { id: "0907332001", region_code: "090000000", province_code: "090730000", municipality_code: "0907332000", name: "Tetuan" },
    { id: "0907332010", region_code: "090000000", province_code: "090730000", municipality_code: "0907332000", name: "Santa Maria" },
  ],
  // Cagayan de Oro (1004305000)
  "1004305000": [
    { id: "1004305001", region_code: "100000000", province_code: "100430000", municipality_code: "1004305000", name: "Carmen" },
    { id: "1004305010", region_code: "100000000", province_code: "100430000", municipality_code: "1004305000", name: "Lapasan" },
    { id: "1004305020", region_code: "100000000", province_code: "100430000", municipality_code: "1004305000", name: "Macasandig" },
  ],
  // Davao City (1102402000)
  "1102402000": [
    { id: "1102402001", region_code: "110000000", province_code: "110240000", municipality_code: "1102402000", name: "Poblacion 1-A" },
    { id: "1102402010", region_code: "110000000", province_code: "110240000", municipality_code: "1102402000", name: "Buhangin" },
  ],
  // General Santos (1206303000)
  "1206303000": [
    { id: "1206303001", region_code: "120000000", province_code: "120630000", municipality_code: "1206303000", name: "Dadiangas East" },
    { id: "1206303010", region_code: "120000000", province_code: "120630000", municipality_code: "1206303000", name: "Lagao" },
  ],
  // Quezon City (1307404000)
  "1307404000": [
    { id: "1307404001", region_code: "130000000", province_code: "130740000", municipality_code: "1307404000", name: "Batasan Hills" },
    { id: "1307404015", region_code: "130000000", province_code: "130740000", municipality_code: "1307404000", name: "Commonwealth" },
  ],
  // Baguio City (1401102000)
  "1401102000": [
    { id: "1401102001", region_code: "140000000", province_code: "140110000", municipality_code: "1401102000", name: "Session Road Area" },
    { id: "1401102010", region_code: "140000000", province_code: "140110000", municipality_code: "1401102000", name: "Irisan" },
  ],
  // Cotabato City (1503805000)
  "1503805000": [
    { id: "1503805001", region_code: "150000000", province_code: "150380000", municipality_code: "1503805000", name: "Poblacion 1" },
  ],
  // Butuan City (1600202000)
  "1600202000": [
    { id: "1600202001", region_code: "160000000", province_code: "160020000", municipality_code: "1600202000", name: "Diego Silang" },
  ],
  // Puerto Princesa (1705316000)
  "1705316000": [
    { id: "1705316001", region_code: "170000000", province_code: "170530000", municipality_code: "1705316000", name: "San Pedro" },
  ],
  // Bacolod City (1804501000)
  "1804501000": [
    { id: "1804501001", region_code: "180000000", province_code: "180450000", municipality_code: "1804501000", name: "Barangay 1 (Poblacion)" },
  ],
}
