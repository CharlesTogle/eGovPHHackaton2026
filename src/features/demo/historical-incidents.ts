export type HistoricalIncidentMeta = {
  campaignId: string
  historicalEventName: string
  regionCode: string
  provinceCode: string
  municipalityCode: string
  cityName: string
  barangayCodes: string[]
  barangayLabel: string
  historicalAffectedPeople: number
  historicalAffectedFamilies: number
  displacedPeople: number
  displacedFamilies: number
  evacuationCenters: number
  partiallyDamagedHouses: number
  totallyDamagedHouses: number
  neededSupplies: Array<{ label: string; quantity: string }>
  ereportReportType: 'red_tape' | 'accident' | 'fire'
  ereportSubject: string
  ereportMessage: string
}

export const HISTORICAL_INCIDENTS: HistoricalIncidentMeta[] = [
  // ==========================================
  // CITY 1: Tacloban City, Leyte (Region VIII)
  // ==========================================
  {
    campaignId: 'a1000000-0000-0000-0000-000000000001',
    historicalEventName: 'Typhoon Yolanda / Haiyan Storm Surge',
    regionCode: '080000000',
    provinceCode: '080370000',
    municipalityCode: '0803747000',
    cityName: 'Tacloban City',
    barangayCodes: ['0803747001'],
    barangayLabel: 'Brgy. 83 (San Jose), Tacloban City',
    historicalAffectedPeople: 612,
    historicalAffectedFamilies: 128,
    displacedPeople: 284,
    displacedFamilies: 61,
    evacuationCenters: 4,
    partiallyDamagedHouses: 95,
    totallyDamagedHouses: 37,
    neededSupplies: [
      { label: 'Family food packs', quantity: '384 packs' },
      { label: 'Potable water', quantity: '9,180 L/day' },
      { label: 'Shelter repair kits', quantity: '132 kits' },
    ],
    ereportReportType: 'red_tape',
    ereportSubject: 'Typhoon Yolanda assistance request - Brgy. 83 San Jose',
    ereportMessage: 'Reporting household storm surge inundation, roof loss, and urgent family food pack requirements in Brgy. 83 (San Jose), Tacloban City, Leyte.',
  },
  {
    campaignId: 'a1000000-0000-0000-0000-000000000004',
    historicalEventName: 'Typhoon Ursula Coastal Surge',
    regionCode: '080000000',
    provinceCode: '080370000',
    municipalityCode: '0803747000',
    cityName: 'Tacloban City',
    barangayCodes: ['0803747010'],
    barangayLabel: 'Brgy. 84 (Sagkahan), Tacloban City',
    historicalAffectedPeople: 480,
    historicalAffectedFamilies: 98,
    displacedPeople: 195,
    displacedFamilies: 42,
    evacuationCenters: 3,
    partiallyDamagedHouses: 72,
    totallyDamagedHouses: 21,
    neededSupplies: [
      { label: 'Family food packs', quantity: '290 packs' },
      { label: 'Hygiene kits', quantity: '110 kits' },
      { label: 'Emergency roofing sheets', quantity: '85 sheets' },
    ],
    ereportReportType: 'fire',
    ereportSubject: 'Typhoon Ursula emergency relief - Brgy. 84 Sagkahan',
    ereportMessage: 'Reporting coastal inundation, power interruption, and displaced households along the Sagkahan bayfront in Brgy. 84, Tacloban City.',
  },
  {
    campaignId: 'a1000000-0000-0000-0000-000000000005',
    historicalEventName: 'TD Agaton Coastal Flood Event',
    regionCode: '080000000',
    provinceCode: '080370000',
    municipalityCode: '0803747000',
    cityName: 'Tacloban City',
    barangayCodes: ['0803747020'],
    barangayLabel: 'Brgy. 88 (Anibong), Tacloban City',
    historicalAffectedPeople: 345,
    historicalAffectedFamilies: 76,
    displacedPeople: 140,
    displacedFamilies: 31,
    evacuationCenters: 2,
    partiallyDamagedHouses: 45,
    totallyDamagedHouses: 14,
    neededSupplies: [
      { label: 'Ready-to-eat food', quantity: '200 packs' },
      { label: 'Potable water', quantity: '4,500 L/day' },
      { label: 'Medical kits', quantity: '35 kits' },
    ],
    ereportReportType: 'accident',
    ereportSubject: 'TD Agaton flash flood report - Brgy. 88 Anibong',
    ereportMessage: 'Reporting slope erosion and persistent shoreline flooding requiring rescue and medical triage in Brgy. 88 (Anibong), Tacloban City.',
  },

  // ========================================================
  // CITY 2: Cagayan de Oro City, Misamis Oriental (Region X)
  // ========================================================
  {
    campaignId: 'a1000000-0000-0000-0000-000000000002',
    historicalEventName: 'Tropical Storm Sendong River Overflow',
    regionCode: '100000000',
    provinceCode: '100430000',
    municipalityCode: '1004305000',
    cityName: 'Cagayan de Oro City',
    barangayCodes: ['1004305020'],
    barangayLabel: 'Brgy. Macasandig, Cagayan de Oro City',
    historicalAffectedPeople: 520,
    historicalAffectedFamilies: 110,
    displacedPeople: 260,
    displacedFamilies: 58,
    evacuationCenters: 4,
    partiallyDamagedHouses: 80,
    totallyDamagedHouses: 35,
    neededSupplies: [
      { label: 'Ready-to-eat food', quantity: '260 packs' },
      { label: 'Hygiene kits', quantity: '110 kits' },
      { label: 'Water purification support', quantity: '45 boxes' },
    ],
    ereportReportType: 'red_tape',
    ereportSubject: 'Sendong river overflow report - Brgy. Macasandig',
    ereportMessage: 'Reporting severe riverbank overflow, household displacement, and urgent WASH needs after Tropical Storm Sendong in Brgy. Macasandig, Cagayan de Oro City.',
  },
  {
    campaignId: 'a1000000-0000-0000-0000-000000000006',
    historicalEventName: 'Cagayan River Flash Flood Overflow',
    regionCode: '100000000',
    provinceCode: '100430000',
    municipalityCode: '1004305000',
    cityName: 'Cagayan de Oro City',
    barangayCodes: ['1004305001'],
    barangayLabel: 'Brgy. Carmen, Cagayan de Oro City',
    historicalAffectedPeople: 438,
    historicalAffectedFamilies: 92,
    displacedPeople: 211,
    displacedFamilies: 47,
    evacuationCenters: 3,
    partiallyDamagedHouses: 58,
    totallyDamagedHouses: 24,
    neededSupplies: [
      { label: 'Family food packs', quantity: '250 packs' },
      { label: 'Potable water', quantity: '6,000 L/day' },
      { label: 'Inflatable rescue boats', quantity: '4 units' },
    ],
    ereportReportType: 'fire',
    ereportSubject: 'Cagayan River flood rescue - Brgy. Carmen',
    ereportMessage: 'Reporting knee-to-waist level flood waters across residential puroks and evacuation center support needs in Brgy. Carmen, Cagayan de Oro City.',
  },
  {
    campaignId: 'a1000000-0000-0000-0000-000000000007',
    historicalEventName: 'Tropical Storm Vinta Urban Inundation',
    regionCode: '100000000',
    provinceCode: '100430000',
    municipalityCode: '1004305000',
    cityName: 'Cagayan de Oro City',
    barangayCodes: ['1004305010'],
    barangayLabel: 'Brgy. Lapasan, Cagayan de Oro City',
    historicalAffectedPeople: 310,
    historicalAffectedFamilies: 68,
    displacedPeople: 125,
    displacedFamilies: 28,
    evacuationCenters: 2,
    partiallyDamagedHouses: 38,
    totallyDamagedHouses: 10,
    neededSupplies: [
      { label: 'Medical kits', quantity: '30 kits' },
      { label: 'Hygiene kits', quantity: '70 kits' },
      { label: 'Shelter repair kits', quantity: '40 kits' },
    ],
    ereportReportType: 'accident',
    ereportSubject: 'TS Vinta urban drainage overflow - Brgy. Lapasan',
    ereportMessage: 'Reporting highway and coastal flooding along eastern commercial and residential districts in Brgy. Lapasan, Cagayan de Oro City.',
  },

  // ========================================================
  // CITY 3: Tagbilaran City, Bohol (Region VII)
  // ========================================================
  {
    campaignId: 'a1000000-0000-0000-0000-000000000003',
    historicalEventName: '2013 Bohol 7.2 Magnitude Earthquake',
    regionCode: '070000000',
    provinceCode: '070120000',
    municipalityCode: '0701200001',
    cityName: 'Tagbilaran City',
    barangayCodes: ['070120000102'],
    barangayLabel: 'Brgy. Cogon, Tagbilaran City',
    historicalAffectedPeople: 320,
    historicalAffectedFamilies: 70,
    displacedPeople: 150,
    displacedFamilies: 32,
    evacuationCenters: 3,
    partiallyDamagedHouses: 65,
    totallyDamagedHouses: 18,
    neededSupplies: [
      { label: 'Medical kits', quantity: '50 kits' },
      { label: 'Tarpaulins', quantity: '70 sheets' },
      { label: 'Generator support', quantity: '4 units' },
    ],
    ereportReportType: 'accident',
    ereportSubject: 'Bohol earthquake structural collapse - Brgy. Cogon',
    ereportMessage: 'Reporting major structural cracks, masonry wall collapse, and emergency first-aid needs in Brgy. Cogon, Tagbilaran City.',
  },
  {
    campaignId: 'a1000000-0000-0000-0000-000000000008',
    historicalEventName: 'Typhoon Odette / Rai Wind Impact',
    regionCode: '070000000',
    provinceCode: '070120000',
    municipalityCode: '0701200001',
    cityName: 'Tagbilaran City',
    barangayCodes: ['070120000101'],
    barangayLabel: 'Brgy. Poblacion I, Tagbilaran City',
    historicalAffectedPeople: 275,
    historicalAffectedFamilies: 59,
    displacedPeople: 110,
    displacedFamilies: 24,
    evacuationCenters: 2,
    partiallyDamagedHouses: 52,
    totallyDamagedHouses: 12,
    neededSupplies: [
      { label: 'Family food packs', quantity: '180 packs' },
      { label: 'Shelter repair kits', quantity: '60 kits' },
      { label: 'Generator support', quantity: '3 units' },
    ],
    ereportReportType: 'red_tape',
    ereportSubject: 'Typhoon Odette grid outage & relief - Brgy. Poblacion I',
    ereportMessage: 'Reporting downed electrical lines, unroofed households, and immediate relief distribution requests in Brgy. Poblacion I, Tagbilaran City.',
  },
  {
    campaignId: 'a1000000-0000-0000-0000-000000000009',
    historicalEventName: 'Habagat Monsoon Coastal Flood Surge',
    regionCode: '070000000',
    provinceCode: '070120000',
    municipalityCode: '0701200001',
    cityName: 'Tagbilaran City',
    barangayCodes: ['070120000103'],
    barangayLabel: 'Brgy. Bool, Tagbilaran City',
    historicalAffectedPeople: 195,
    historicalAffectedFamilies: 42,
    displacedPeople: 80,
    displacedFamilies: 16,
    evacuationCenters: 1,
    partiallyDamagedHouses: 28,
    totallyDamagedHouses: 6,
    neededSupplies: [
      { label: 'Potable water', quantity: '3,000 L/day' },
      { label: 'Ready-to-eat food', quantity: '120 packs' },
      { label: 'Hygiene kits', quantity: '45 kits' },
    ],
    ereportReportType: 'fire',
    ereportSubject: 'Habagat coastal surge & drainage backlog - Brgy. Bool',
    ereportMessage: 'Reporting high tide shoreline overflow, drainage backflow, and sanitation kits needed for coastal families in Brgy. Bool, Tagbilaran City.',
  },
]
