import type { Campaign, CampaignQuestion, CheckIn, CheckInAnswer, HandaData } from '@/shared'

export const DEMO_CAMPAIGNS: Campaign[] = [
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
    id: 'a1000000-0000-0000-0000-000000000002',
    name: 'Sendong Flood Household Assessment',
    disaster_type: 'Flood',
    disaster_date: '2011-12-17',
    status: 'closed',
    created_by: 'OFC_CDO_001',
    barangay_code: '1004305001',
    alert_id: null,
    ai_generated: false,
    created_at: '2026-07-31T00:00:00.000Z',
    updated_at: '2026-07-31T00:00:00.000Z',
  },
  {
    id: 'a1000000-0000-0000-0000-000000000003',
    name: 'Bohol Earthquake Structural Assessment',
    disaster_type: 'Earthquake',
    disaster_date: '2013-10-15',
    status: 'closed',
    created_by: 'OFC_BOHOL_001',
    barangay_code: '070120000101',
    alert_id: null,
    ai_generated: false,
    created_at: '2026-07-31T00:00:00.000Z',
    updated_at: '2026-07-31T00:00:00.000Z',
  },
]

export const DEMO_QUESTIONS: CampaignQuestion[] = [
  { id: 'b1000000-0000-0000-0000-000000000001', campaign_id: 'a1000000-0000-0000-0000-000000000001', question_text: 'Is your home heavily damaged or unsafe to occupy?', need_category: 'Shelter', display_order: 0 },
  { id: 'b1000000-0000-0000-0000-000000000002', campaign_id: 'a1000000-0000-0000-0000-000000000001', question_text: 'Does your household need food or clean drinking water?', need_category: 'Food or water', display_order: 1 },
  { id: 'b1000000-0000-0000-0000-000000000003', campaign_id: 'a1000000-0000-0000-0000-000000000001', question_text: 'Does anyone in your household need medical attention?', need_category: 'Medical', display_order: 2 },
  { id: 'b1000000-0000-0000-0000-000000000004', campaign_id: 'a1000000-0000-0000-0000-000000000002', question_text: 'Did floodwater enter your home or force evacuation?', need_category: 'Shelter', display_order: 0 },
  { id: 'b1000000-0000-0000-0000-000000000005', campaign_id: 'a1000000-0000-0000-0000-000000000002', question_text: 'Does your household need hygiene kits or safe drinking water?', need_category: 'WASH', display_order: 1 },
  { id: 'b1000000-0000-0000-0000-000000000006', campaign_id: 'a1000000-0000-0000-0000-000000000002', question_text: 'Do you need evacuation transport or rescue assistance?', need_category: 'Evacuation', display_order: 2 },
  { id: 'b1000000-0000-0000-0000-000000000007', campaign_id: 'a1000000-0000-0000-0000-000000000003', question_text: 'Did the earthquake cause structural cracks or collapse in your home?', need_category: 'Shelter', display_order: 0 },
  { id: 'b1000000-0000-0000-0000-000000000008', campaign_id: 'a1000000-0000-0000-0000-000000000003', question_text: 'Does anyone in your household need urgent medical or first aid support?', need_category: 'Medical', display_order: 1 },
  { id: 'b1000000-0000-0000-0000-000000000009', campaign_id: 'a1000000-0000-0000-0000-000000000003', question_text: 'Do you need electricity, lighting, or generator support?', need_category: 'Utilities', display_order: 2 },
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

function makeName(index: number, cityTag: string): string {
  const first = NAME_PARTS.first[index % NAME_PARTS.first.length]
  const last = NAME_PARTS.last[(index * 3) % NAME_PARTS.last.length]
  return `${first} ${last} ${cityTag}`
}

function buildCampaignCases(config: {
  campaignId: string
  startId: number
  count: number
  cityTag: string
  answerPatterns: string[][]
}): DemoCaseTemplate[] {
  const statuses: CheckIn['status'][] = ['unresolved', 'visited', 'resolved', 'unresolved', 'resolved', 'visited']
  return Array.from({ length: config.count }, (_, offset) => ({
    id: config.startId + offset,
    campaignId: config.campaignId,
    name: makeName(offset, config.cityTag),
    status: statuses[offset % statuses.length],
    answers: config.answerPatterns[offset % config.answerPatterns.length],
  }))
}

const DEMO_CASES: DemoCaseTemplate[] = [
  ...buildCampaignCases({
    campaignId: 'a1000000-0000-0000-0000-000000000001',
    startId: 1,
    count: 132,
    cityTag: 'Tacloban',
    answerPatterns: [
      ['yes', 'yes', 'no'],
      ['yes', 'no', 'yes'],
      ['no', 'yes', 'no'],
      ['yes', 'yes', 'yes'],
      ['yes', 'no', 'no'],
      ['no', 'yes', 'yes'],
    ],
  }),
  ...buildCampaignCases({
    campaignId: 'a1000000-0000-0000-0000-000000000002',
    startId: 101,
    count: 108,
    cityTag: 'CDO',
    answerPatterns: [
      ['yes', 'yes', 'yes'],
      ['no', 'yes', 'no'],
      ['yes', 'no', 'yes'],
      ['yes', 'yes', 'no'],
      ['no', 'yes', 'yes'],
      ['yes', 'no', 'no'],
    ],
  }),
  ...buildCampaignCases({
    campaignId: 'a1000000-0000-0000-0000-000000000003',
    startId: 201,
    count: 96,
    cityTag: 'Bohol',
    answerPatterns: [
      ['yes', 'no', 'yes'],
      ['no', 'yes', 'no'],
      ['yes', 'yes', 'yes'],
      ['yes', 'no', 'no'],
      ['no', 'yes', 'yes'],
      ['yes', 'yes', 'no'],
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
