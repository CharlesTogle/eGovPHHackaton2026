export type HistoricalIncidentMeta = {
  campaignId: string
  historicalEventName: string
  regionCode: string
  provinceCode: string
  municipalityCode: string
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
  {
    campaignId: 'a1000000-0000-0000-0000-000000000001',
    historicalEventName: 'Typhoon Yolanda / Haiyan',
    regionCode: '080000000',
    provinceCode: '080370000',
    municipalityCode: '0803747000',
    barangayCodes: ['0803747001', '0803747010'],
    barangayLabel: 'Tacloban City, Leyte',
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
    ereportSubject: 'Typhoon Yolanda assistance request - Tacloban City',
    ereportMessage: 'Reporting household impacts and priority relief needs after Typhoon Yolanda in Tacloban City, Leyte.',
  },
  {
    campaignId: 'a1000000-0000-0000-0000-000000000002',
    historicalEventName: 'Tropical Storm Sendong / Washi',
    regionCode: '100000000',
    provinceCode: '100430000',
    municipalityCode: '1004305000',
    barangayCodes: ['1004305001', '1004305010'],
    barangayLabel: 'Cagayan de Oro City, Misamis Oriental',
    historicalAffectedPeople: 438,
    historicalAffectedFamilies: 92,
    displacedPeople: 211,
    displacedFamilies: 47,
    evacuationCenters: 3,
    partiallyDamagedHouses: 58,
    totallyDamagedHouses: 24,
    neededSupplies: [
      { label: 'Ready-to-eat food', quantity: '211 packs' },
      { label: 'Hygiene kits', quantity: '92 kits' },
      { label: 'Water purification support', quantity: '30 boxes' },
    ],
    ereportReportType: 'red_tape',
    ereportSubject: 'Sendong flood impact report - Cagayan de Oro City',
    ereportMessage: 'Reporting flood displacement, WASH needs, and barangay-level relief demand after Tropical Storm Sendong.',
  },
  {
    campaignId: 'a1000000-0000-0000-0000-000000000003',
    historicalEventName: '2013 Bohol Earthquake',
    regionCode: '070000000',
    provinceCode: '070120000',
    municipalityCode: '0701200001',
    barangayCodes: ['070120000101', '070120000102'],
    barangayLabel: 'Tagbilaran City, Bohol',
    historicalAffectedPeople: 257,
    historicalAffectedFamilies: 54,
    displacedPeople: 96,
    displacedFamilies: 18,
    evacuationCenters: 2,
    partiallyDamagedHouses: 43,
    totallyDamagedHouses: 11,
    neededSupplies: [
      { label: 'Medical kits', quantity: '40 kits' },
      { label: 'Tarpaulins', quantity: '54 sheets' },
      { label: 'Generator support', quantity: '3 units' },
    ],
    ereportReportType: 'accident',
    ereportSubject: 'Bohol earthquake impact report - Tagbilaran City',
    ereportMessage: 'Reporting structural damage, utilities disruption, and medical needs after the 2013 Bohol earthquake.',
  },
]
