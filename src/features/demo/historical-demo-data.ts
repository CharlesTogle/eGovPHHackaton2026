import type { Campaign, CampaignQuestion, CheckIn, CheckInAnswer, HandaData } from '@/shared'

export const DEMO_CAMPAIGNS: Campaign[] = [
  // Tacloban City (0803747000)
  {
    id: 'a1000000-0000-0000-0000-000000000001',
    name: 'Typhoon Yolanda Rapid Assessment',
    disaster_type: 'Typhoon',
    disaster_date: '2013-11-08',
    status: 'active',
    created_by: 'OFC_TACLOBAN_001',
    barangay_code: '0803747001',
    alert_id: null,
    ai_generated: false,
    created_at: '2026-07-31T00:00:00.000Z',
    updated_at: '2026-07-31T00:00:00.000Z',
  },
  {
    id: 'a1000000-0000-0000-0000-000000000004',
    name: 'Typhoon Ursula Coastal Assessment',
    disaster_type: 'Typhoon',
    disaster_date: '2019-12-25',
    status: 'active',
    created_by: 'OFC_TACLOBAN_002',
    barangay_code: '0803747010',
    alert_id: null,
    ai_generated: false,
    created_at: '2026-07-31T00:00:00.000Z',
    updated_at: '2026-07-31T00:00:00.000Z',
  },
  {
    id: 'a1000000-0000-0000-0000-000000000005',
    name: 'TD Agaton Flash Flood Assessment',
    disaster_type: 'Flood',
    disaster_date: '2022-04-11',
    status: 'closed',
    created_by: 'OFC_TACLOBAN_003',
    barangay_code: '0803747020',
    alert_id: null,
    ai_generated: false,
    created_at: '2026-07-31T00:00:00.000Z',
    updated_at: '2026-07-31T00:00:00.000Z',
  },

  // Cagayan de Oro City (1004305000)
  {
    id: 'a1000000-0000-0000-0000-000000000002',
    name: 'Sendong River Household Assessment',
    disaster_type: 'Flood',
    disaster_date: '2011-12-17',
    status: 'closed',
    created_by: 'OFC_CDO_001',
    barangay_code: '1004305020',
    alert_id: null,
    ai_generated: false,
    created_at: '2026-07-31T00:00:00.000Z',
    updated_at: '2026-07-31T00:00:00.000Z',
  },
  {
    id: 'a1000000-0000-0000-0000-000000000006',
    name: 'Cagayan River Flash Flood Assessment',
    disaster_type: 'Flood',
    disaster_date: '2017-01-16',
    status: 'active',
    created_by: 'OFC_CDO_002',
    barangay_code: '1004305001',
    alert_id: null,
    ai_generated: false,
    created_at: '2026-07-31T00:00:00.000Z',
    updated_at: '2026-07-31T00:00:00.000Z',
  },
  {
    id: 'a1000000-0000-0000-0000-000000000007',
    name: 'TS Vinta Urban Inundation Assessment',
    disaster_type: 'Flood',
    disaster_date: '2017-12-22',
    status: 'closed',
    created_by: 'OFC_CDO_003',
    barangay_code: '1004305010',
    alert_id: null,
    ai_generated: false,
    created_at: '2026-07-31T00:00:00.000Z',
    updated_at: '2026-07-31T00:00:00.000Z',
  },

  // Tagbilaran City (0701200001)
  {
    id: 'a1000000-0000-0000-0000-000000000003',
    name: 'Bohol Earthquake Structural Assessment',
    disaster_type: 'Earthquake',
    disaster_date: '2013-10-15',
    status: 'closed',
    created_by: 'OFC_BOHOL_001',
    barangay_code: '070120000102',
    alert_id: null,
    ai_generated: false,
    created_at: '2026-07-31T00:00:00.000Z',
    updated_at: '2026-07-31T00:00:00.000Z',
  },
  {
    id: 'a1000000-0000-0000-0000-000000000008',
    name: 'Typhoon Odette Wind Impact Assessment',
    disaster_type: 'Typhoon',
    disaster_date: '2021-12-16',
    status: 'active',
    created_by: 'OFC_BOHOL_002',
    barangay_code: '070120000101',
    alert_id: null,
    ai_generated: false,
    created_at: '2026-07-31T00:00:00.000Z',
    updated_at: '2026-07-31T00:00:00.000Z',
  },
  {
    id: 'a1000000-0000-0000-0000-000000000009',
    name: 'Habagat Monsoon Coastal Flood Assessment',
    disaster_type: 'Flood',
    disaster_date: '2023-09-19',
    status: 'closed',
    created_by: 'OFC_BOHOL_003',
    barangay_code: '070120000103',
    alert_id: null,
    ai_generated: false,
    created_at: '2026-07-31T00:00:00.000Z',
    updated_at: '2026-07-31T00:00:00.000Z',
  },
]

export const DEMO_QUESTIONS: CampaignQuestion[] = [
  // Yolanda (Tacloban Brgy 83)
  { id: 'b1000000-0000-0000-0000-000000000001', campaign_id: 'a1000000-0000-0000-0000-000000000001', question_text: 'Is your home heavily damaged or unsafe to occupy?', need_category: 'Shelter', display_order: 0 },
  { id: 'b1000000-0000-0000-0000-000000000002', campaign_id: 'a1000000-0000-0000-0000-000000000001', question_text: 'Does your household need food or clean drinking water?', need_category: 'Food or water', display_order: 1 },
  { id: 'b1000000-0000-0000-0000-000000000003', campaign_id: 'a1000000-0000-0000-0000-000000000001', question_text: 'Does anyone in your household need medical attention?', need_category: 'Medical', display_order: 2 },

  // Ursula (Tacloban Brgy 84)
  { id: 'b1000000-0000-0000-0000-000000000010', campaign_id: 'a1000000-0000-0000-0000-000000000004', question_text: 'Did severe gale winds tear off your roof or damage walls?', need_category: 'Shelter', display_order: 0 },
  { id: 'b1000000-0000-0000-0000-000000000011', campaign_id: 'a1000000-0000-0000-0000-000000000004', question_text: 'Does your family require hygiene kits and family food packs?', need_category: 'Food or water', display_order: 1 },
  { id: 'b1000000-0000-0000-0000-000000000012', campaign_id: 'a1000000-0000-0000-0000-000000000004', question_text: 'Do you require power generator access or rechargeable lamps?', need_category: 'Utilities', display_order: 2 },

  // Agaton (Tacloban Brgy 88)
  { id: 'b1000000-0000-0000-0000-000000000013', campaign_id: 'a1000000-0000-0000-0000-000000000005', question_text: 'Did hillside runoff or coastal flooding submerge your home floor?', need_category: 'Shelter', display_order: 0 },
  { id: 'b1000000-0000-0000-0000-000000000014', campaign_id: 'a1000000-0000-0000-0000-000000000005', question_text: 'Do you need ready-to-eat meals or bottled potable water?', need_category: 'Food or water', display_order: 1 },
  { id: 'b1000000-0000-0000-0000-000000000015', campaign_id: 'a1000000-0000-0000-0000-000000000005', question_text: 'Are there elderly or infants needing urgent medical checkup?', need_category: 'Medical', display_order: 2 },

  // Sendong (CDO Macasandig)
  { id: 'b1000000-0000-0000-0000-000000000004', campaign_id: 'a1000000-0000-0000-0000-000000000002', question_text: 'Did floodwater enter your home or force evacuation?', need_category: 'Shelter', display_order: 0 },
  { id: 'b1000000-0000-0000-0000-000000000005', campaign_id: 'a1000000-0000-0000-0000-000000000002', question_text: 'Does your household need hygiene kits or safe drinking water?', need_category: 'WASH', display_order: 1 },
  { id: 'b1000000-0000-0000-0000-000000000006', campaign_id: 'a1000000-0000-0000-0000-000000000002', question_text: 'Do you need evacuation transport or rescue assistance?', need_category: 'Evacuation', display_order: 2 },

  // Cagayan River Flash Flood (CDO Carmen)
  { id: 'b1000000-0000-0000-0000-000000000016', campaign_id: 'a1000000-0000-0000-0000-000000000006', question_text: 'Is your residential compound cut off by high water levels?', need_category: 'Evacuation', display_order: 0 },
  { id: 'b1000000-0000-0000-0000-000000000017', campaign_id: 'a1000000-0000-0000-0000-000000000006', question_text: 'Does your family have access to potable drinking water?', need_category: 'Food or water', display_order: 1 },
  { id: 'b1000000-0000-0000-0000-000000000018', campaign_id: 'a1000000-0000-0000-0000-000000000006', question_text: 'Do you need emergency family food relief packs?', need_category: 'Food or water', display_order: 2 },

  // TS Vinta (CDO Lapasan)
  { id: 'b1000000-0000-0000-0000-000000000019', campaign_id: 'a1000000-0000-0000-0000-000000000007', question_text: 'Was your home flooded by drainage canal overflow?', need_category: 'Shelter', display_order: 0 },
  { id: 'b1000000-0000-0000-0000-000000000020', campaign_id: 'a1000000-0000-0000-0000-000000000007', question_text: 'Do you need hygiene supplies or clean water purification tablets?', need_category: 'WASH', display_order: 1 },
  { id: 'b1000000-0000-0000-0000-000000000021', campaign_id: 'a1000000-0000-0000-0000-000000000007', question_text: 'Do you need first aid or medical support for injuries?', need_category: 'Medical', display_order: 2 },

  // Bohol Earthquake (Tagbilaran Cogon)
  { id: 'b1000000-0000-0000-0000-000000000007', campaign_id: 'a1000000-0000-0000-0000-000000000003', question_text: 'Did the earthquake cause structural cracks or collapse in your home?', need_category: 'Shelter', display_order: 0 },
  { id: 'b1000000-0000-0000-0000-000000000008', campaign_id: 'a1000000-0000-0000-0000-000000000003', question_text: 'Does anyone in your household need urgent medical or first aid support?', need_category: 'Medical', display_order: 1 },
  { id: 'b1000000-0000-0000-0000-000000000009', campaign_id: 'a1000000-0000-0000-0000-000000000003', question_text: 'Do you need electricity, lighting, or generator support?', need_category: 'Utilities', display_order: 2 },

  // Odette (Tagbilaran Poblacion I)
  { id: 'b1000000-0000-0000-0000-000000000022', campaign_id: 'a1000000-0000-0000-0000-000000000008', question_text: 'Did severe typhoon winds destroy your roof or break exterior walls?', need_category: 'Shelter', display_order: 0 },
  { id: 'b1000000-0000-0000-0000-000000000023', campaign_id: 'a1000000-0000-0000-0000-000000000008', question_text: 'Do you need emergency food packs and clean drinking water?', need_category: 'Food or water', display_order: 1 },
  { id: 'b1000000-0000-0000-0000-000000000024', campaign_id: 'a1000000-0000-0000-0000-000000000008', question_text: 'Do you need temporary tarpaulins and shelter repair kits?', need_category: 'Shelter', display_order: 2 },

  // Habagat (Tagbilaran Bool)
  { id: 'b1000000-0000-0000-0000-000000000025', campaign_id: 'a1000000-0000-0000-0000-000000000009', question_text: 'Did coastal sea surge or heavy monsoon rains flood your home?', need_category: 'Shelter', display_order: 0 },
  { id: 'b1000000-0000-0000-0000-000000000026', campaign_id: 'a1000000-0000-0000-0000-000000000009', question_text: 'Does your family need drinking water or ready-to-eat relief?', need_category: 'Food or water', display_order: 1 },
  { id: 'b1000000-0000-0000-0000-000000000027', campaign_id: 'a1000000-0000-0000-0000-000000000009', question_text: 'Do you need sanitation and hygiene kits for displaced family members?', need_category: 'WASH', display_order: 2 },
]

const DEMO_DATE = '2026-07-31T00:00:00.000Z'

type DemoCaseTemplate = {
  id: number
  campaignId: string
  name: string
  status: CheckIn['status']
  answers: string[]
}

const NAME_PARTS = {
  first: ['Rosa', 'Pedro', 'Lina', 'Carlos', 'Mylene', 'Edgar', 'Ana', 'Joel', 'Mila', 'Josefina', 'Ramil', 'Leah', 'Dondon', 'Catherine', 'Nora', 'Tomas', 'Marlon', 'Luisa', 'Rogelio', 'Cecilia', 'Arman', 'Elena', 'Victor', 'Marites', 'Jonas', 'Lorna'],
  last: ['Villanueva', 'Zamora', 'Abad', 'Dela Pena', 'Rufino', 'Alonzo', 'Belardo', 'Ubaldo', 'Sarenas', 'Parojinog', 'Bacus', 'Oclarit', 'Sagarino', 'Espina', 'Digamo', 'Relampagos', 'Tirol', 'Boniel', 'Chatto', 'Lloren', 'Aumentado', 'Tingcang', 'Cabili', 'Labajo', 'Borja', 'Mendoza'],
}

function makeName(index: number, brgyTag: string): string {
  const first = NAME_PARTS.first[index % NAME_PARTS.first.length]
  const last = NAME_PARTS.last[(index * 3) % NAME_PARTS.last.length]
  return `${first} ${last} (${brgyTag})`
}

function buildCampaignCases(config: {
  campaignId: string
  startId: number
  count: number
  brgyTag: string
  answerPatterns: string[][]
}): DemoCaseTemplate[] {
  const statuses: CheckIn['status'][] = ['unresolved', 'visited', 'resolved', 'unresolved', 'resolved', 'visited']
  return Array.from({ length: config.count }, (_, offset) => ({
    id: config.startId + offset,
    campaignId: config.campaignId,
    name: makeName(offset, config.brgyTag),
    status: statuses[offset % statuses.length],
    answers: config.answerPatterns[offset % config.answerPatterns.length],
  }))
}

const DEMO_CASES: DemoCaseTemplate[] = [
  // Tacloban City Barangay 83
  ...buildCampaignCases({
    campaignId: 'a1000000-0000-0000-0000-000000000001',
    startId: 1,
    count: 75,
    brgyTag: 'San Jose, Tacloban',
    answerPatterns: [
      ['yes', 'yes', 'no'],
      ['yes', 'no', 'yes'],
      ['no', 'yes', 'no'],
      ['yes', 'yes', 'yes'],
      ['yes', 'no', 'no'],
      ['no', 'yes', 'yes'],
    ],
  }),
  // Tacloban City Barangay 84
  ...buildCampaignCases({
    campaignId: 'a1000000-0000-0000-0000-000000000004',
    startId: 80,
    count: 55,
    brgyTag: 'Sagkahan, Tacloban',
    answerPatterns: [
      ['yes', 'yes', 'no'],
      ['yes', 'no', 'yes'],
      ['no', 'yes', 'no'],
      ['yes', 'yes', 'yes'],
      ['no', 'no', 'yes'],
    ],
  }),
  // Tacloban City Barangay 88
  ...buildCampaignCases({
    campaignId: 'a1000000-0000-0000-0000-000000000005',
    startId: 140,
    count: 45,
    brgyTag: 'Anibong, Tacloban',
    answerPatterns: [
      ['yes', 'yes', 'yes'],
      ['no', 'yes', 'no'],
      ['yes', 'no', 'yes'],
      ['yes', 'no', 'no'],
    ],
  }),

  // CDO Macasandig
  ...buildCampaignCases({
    campaignId: 'a1000000-0000-0000-0000-000000000002',
    startId: 190,
    count: 65,
    brgyTag: 'Macasandig, CDO',
    answerPatterns: [
      ['yes', 'yes', 'yes'],
      ['no', 'yes', 'no'],
      ['yes', 'no', 'yes'],
      ['yes', 'yes', 'no'],
      ['no', 'yes', 'yes'],
      ['yes', 'no', 'no'],
    ],
  }),
  // CDO Carmen
  ...buildCampaignCases({
    campaignId: 'a1000000-0000-0000-0000-000000000006',
    startId: 260,
    count: 50,
    brgyTag: 'Carmen, CDO',
    answerPatterns: [
      ['yes', 'yes', 'no'],
      ['yes', 'no', 'yes'],
      ['no', 'yes', 'yes'],
      ['yes', 'yes', 'yes'],
    ],
  }),
  // CDO Lapasan
  ...buildCampaignCases({
    campaignId: 'a1000000-0000-0000-0000-000000000007',
    startId: 315,
    count: 40,
    brgyTag: 'Lapasan, CDO',
    answerPatterns: [
      ['yes', 'no', 'yes'],
      ['no', 'yes', 'no'],
      ['yes', 'yes', 'no'],
      ['no', 'no', 'yes'],
    ],
  }),

  // Tagbilaran Cogon
  ...buildCampaignCases({
    campaignId: 'a1000000-0000-0000-0000-000000000003',
    startId: 360,
    count: 60,
    brgyTag: 'Cogon, Tagbilaran',
    answerPatterns: [
      ['yes', 'no', 'yes'],
      ['no', 'yes', 'no'],
      ['yes', 'yes', 'yes'],
      ['yes', 'no', 'no'],
      ['no', 'yes', 'yes'],
      ['yes', 'yes', 'no'],
    ],
  }),
  // Tagbilaran Poblacion I
  ...buildCampaignCases({
    campaignId: 'a1000000-0000-0000-0000-000000000008',
    startId: 425,
    count: 45,
    brgyTag: 'Poblacion I, Tagbilaran',
    answerPatterns: [
      ['yes', 'yes', 'no'],
      ['yes', 'no', 'yes'],
      ['no', 'yes', 'no'],
      ['yes', 'yes', 'yes'],
    ],
  }),
  // Tagbilaran Bool
  ...buildCampaignCases({
    campaignId: 'a1000000-0000-0000-0000-000000000009',
    startId: 475,
    count: 35,
    brgyTag: 'Bool, Tagbilaran',
    answerPatterns: [
      ['yes', 'no', 'yes'],
      ['no', 'yes', 'yes'],
      ['yes', 'yes', 'no'],
      ['no', 'no', 'yes'],
    ],
  }),
]

export const DEMO_CHECK_INS: CheckIn[] = DEMO_CASES.map((entry) => ({
  id: `c1000000-0000-0000-0000-${entry.id.toString().padStart(12, '0')}`,
  campaign_id: entry.campaignId,
  name: entry.name,
  submitted_by: entry.name,
  status: entry.status,
  created_at: DEMO_DATE,
  updated_at: DEMO_DATE,
}))

export const DEMO_ANSWERS: CheckInAnswer[] = DEMO_CASES.flatMap((entry) => {
  const questionIds = DEMO_QUESTIONS
    .filter((question) => question.campaign_id === entry.campaignId)
    .sort((a, b) => a.display_order - b.display_order)
    .map((question) => question.id)

  return questionIds.map((questionId, index) => ({
    id: `d1000000-0000-0000-0000-${`${entry.id.toString().padStart(11, '0')}${index + 1}`}`,
    check_in_id: `c1000000-0000-0000-0000-${entry.id.toString().padStart(12, '0')}`,
    question_id: questionId,
    answer: entry.answers[index] ?? 'no',
  }))
})

function hasHistoricalCampaigns(data: Pick<HandaData, 'campaigns'>): boolean {
  return data.campaigns.some((campaign) => campaign.id.startsWith('a1000000-'))
}

export function mergeHistoricalDemoData(data: HandaData | null): HandaData {
  if (!data) {
    return {
      campaigns: DEMO_CAMPAIGNS,
      questions: DEMO_QUESTIONS,
      checkIns: DEMO_CHECK_INS,
      answers: DEMO_ANSWERS,
      alerts: [],
    }
  }

  if (hasHistoricalCampaigns(data)) {
    return data
  }

  const mergedCampaigns = [...data.campaigns]
  for (const campaign of DEMO_CAMPAIGNS) {
    if (!mergedCampaigns.some(existing => existing.id === campaign.id)) {
      mergedCampaigns.push(campaign)
    }
  }

  const mergedQuestions = [...data.questions]
  for (const question of DEMO_QUESTIONS) {
    if (!mergedQuestions.some(existing => existing.id === question.id)) {
      mergedQuestions.push(question)
    }
  }

  const mergedCheckIns = [...data.checkIns]
  for (const checkIn of DEMO_CHECK_INS) {
    if (!mergedCheckIns.some(existing => existing.id === checkIn.id)) {
      mergedCheckIns.push(checkIn)
    }
  }

  const mergedAnswers = [...data.answers]
  for (const answer of DEMO_ANSWERS) {
    if (!mergedAnswers.some(existing => existing.id === answer.id)) {
      mergedAnswers.push(answer)
    }
  }

  return {
    campaigns: mergedCampaigns,
    questions: mergedQuestions,
    checkIns: mergedCheckIns,
    answers: mergedAnswers,
    alerts: data.alerts,
  }
}
