import { useState, useCallback } from 'react'

// --- Types matching supabase/migrations/20250101000000_initial_schema.sql ---

export type CampaignStatus = 'draft' | 'active' | 'closed' | 'archived'
export type CheckInStatus = 'unresolved' | 'visited' | 'resolved'

export type Campaign = {
  id: string
  name: string
  disaster_type: string
  disaster_date: string
  status: CampaignStatus
  created_by: string
  barangay_code: string
  created_at: string
  updated_at: string
}

export type CampaignQuestion = {
  id: string
  campaign_id: string
  question_text: string
  need_category: string
  display_order: number
}

export type Household = {
  id: string
  barangay_code: string
  household_head_name: string
  address: string
  member_count: number
}

export type HouseholdMember = {
  id: string
  household_id: string
  first_name: string
  last_name: string
}

export type CheckIn = {
  id: string
  campaign_id: string
  household_id: string
  submitted_by: string
  status: CheckInStatus
  created_at: string
  updated_at: string
}

export type CheckInAnswer = {
  id: string
  check_in_id: string
  question_id: string
  answer: string
}

// --- Official session (mock eGovPH SSO) ---

export type Official = {
  uniqid: string
  name: string
  barangay_code: string
  role: string
}

// --- Dashboard aggregation ---

export type DashboardRow = {
  household: Household
  checkIn: CheckIn | null
  answers: CheckInAnswer[]
  submitted_by: string | null
}

export type Dashboard = {
  affectedCount: number
  unresolvedCount: number
  noCheckInCount: number
  needBreakdown: Record<string, number>
  rows: DashboardRow[]
}

// --- Data store shape ---

export type HandaData = {
  campaigns: Campaign[]
  questions: CampaignQuestion[]
  households: Household[]
  members: HouseholdMember[]
  checkIns: CheckIn[]
  answers: CheckInAnswer[]
}

// --- Seed data ---

const now = new Date().toISOString()

const seedHouseholds: Household[] = [
  { id: 'hh-1', barangay_code: 'BRG-001', household_head_name: 'Juan Dela Cruz', address: '123 Rizal St', member_count: 5 },
  { id: 'hh-2', barangay_code: 'BRG-001', household_head_name: 'Maria Santos', address: '456 Mabini Ave', member_count: 3 },
  { id: 'hh-3', barangay_code: 'BRG-001', household_head_name: 'Pedro Reyes', address: '789 Bonifacio Blvd', member_count: 4 },
  { id: 'hh-4', barangay_code: 'BRG-001', household_head_name: 'Ana Garcia', address: '321 Luna St', member_count: 2 },
  { id: 'hh-5', barangay_code: 'BRG-001', household_head_name: 'Jose Mendoza', address: '654 Aguinaldo Hwy', member_count: 6 },
]

const seedMembers: HouseholdMember[] = [
  { id: 'm-1', household_id: 'hh-1', first_name: 'Juan', last_name: 'Dela Cruz' },
  { id: 'm-2', household_id: 'hh-1', first_name: 'Rosa', last_name: 'Dela Cruz' },
  { id: 'm-3', household_id: 'hh-1', first_name: 'Carlos', last_name: 'Dela Cruz' },
  { id: 'm-4', household_id: 'hh-2', first_name: 'Maria', last_name: 'Santos' },
  { id: 'm-5', household_id: 'hh-2', first_name: 'Luis', last_name: 'Santos' },
  { id: 'm-6', household_id: 'hh-3', first_name: 'Pedro', last_name: 'Reyes' },
  { id: 'm-7', household_id: 'hh-3', first_name: 'Teresa', last_name: 'Reyes' },
  { id: 'm-8', household_id: 'hh-4', first_name: 'Ana', last_name: 'Garcia' },
  { id: 'm-9', household_id: 'hh-5', first_name: 'Jose', last_name: 'Mendoza' },
  { id: 'm-10', household_id: 'hh-5', first_name: 'Grace', last_name: 'Mendoza' },
]

const seedQuestions: CampaignQuestion[] = [
  { id: 'q-1', campaign_id: 'c-1', question_text: 'Is your home damaged?', need_category: 'Shelter', display_order: 0 },
  { id: 'q-2', campaign_id: 'c-1', question_text: 'Do you need food or water?', need_category: 'Food or water', display_order: 1 },
  { id: 'q-3', campaign_id: 'c-1', question_text: 'Do you need medical attention?', need_category: 'Medical', display_order: 2 },
]

const seedCheckIns: CheckIn[] = [
  { id: 'ci-1', campaign_id: 'c-1', household_id: 'hh-1', submitted_by: 'Juan Dela Cruz', status: 'visited', created_at: now, updated_at: now },
  { id: 'ci-2', campaign_id: 'c-1', household_id: 'hh-2', submitted_by: 'Maria Santos', status: 'unresolved', created_at: now, updated_at: now },
]

const seedAnswers: CheckInAnswer[] = [
  { id: 'a-1', check_in_id: 'ci-1', question_id: 'q-1', answer: 'yes' },
  { id: 'a-2', check_in_id: 'ci-1', question_id: 'q-2', answer: 'no' },
  { id: 'a-3', check_in_id: 'ci-1', question_id: 'q-3', answer: 'no' },
  { id: 'a-4', check_in_id: 'ci-2', question_id: 'q-1', answer: 'yes' },
  { id: 'a-5', check_in_id: 'ci-2', question_id: 'q-2', answer: 'yes' },
  { id: 'a-6', check_in_id: 'ci-2', question_id: 'q-3', answer: 'yes' },
]

const seedCampaigns: Campaign[] = [
  { id: 'c-1', name: 'Typhoon Odette Response', disaster_type: 'Typhoon', disaster_date: '2025-01-15', status: 'active', created_by: 'Admin', barangay_code: 'BRG-001', created_at: now, updated_at: now },
]

const seedData: HandaData = {
  campaigns: seedCampaigns,
  questions: seedQuestions,
  households: seedHouseholds,
  members: seedMembers,
  checkIns: seedCheckIns,
  answers: seedAnswers,
}

// --- Hook: single source of truth ---

let nextId = 100
function uid(): string {
  return `id-${++nextId}`
}

export function useHandaStore() {
  const [data, setData] = useState<HandaData>(seedData)
  const [official, setOfficial] = useState<Official | null>(null)

  const loginOfficial = useCallback(() => {
    setOfficial({
      uniqid: 'OFF-001',
      name: 'Barangay Capt. Reyes',
      barangay_code: 'BRG-001',
      role: 'official',
    })
  }, [])

  const logoutOfficial = useCallback(() => {
    setOfficial(null)
  }, [])

  const createCampaign = useCallback((input: { name: string; disaster_type: string; disaster_date: string }) => {
    if (!official) return null
    const c: Campaign = {
      id: uid(),
      ...input,
      status: 'draft',
      created_by: official.uniqid,
      barangay_code: official.barangay_code,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
    setData(d => ({ ...d, campaigns: [...d.campaigns, c] }))
    return c
  }, [official])

  const addQuestion = useCallback((campaignId: string, question_text: string, need_category: string) => {
    setData(d => {
      const order = d.questions.filter(q => q.campaign_id === campaignId).length
      const q: CampaignQuestion = { id: uid(), campaign_id: campaignId, question_text, need_category, display_order: order }
      return { ...d, questions: [...d.questions, q] }
    })
  }, [])

  const removeQuestion = useCallback((questionId: string) => {
    setData(d => ({ ...d, questions: d.questions.filter(q => q.id !== questionId) }))
  }, [])

  const updateCampaignStatus = useCallback((campaignId: string, status: CampaignStatus) => {
    setData(d => ({
      ...d,
      campaigns: d.campaigns.map(c => {
        if (c.id === campaignId) return { ...c, status, updated_at: new Date().toISOString() }
        // enforce single active campaign
        if (status === 'active' && c.status === 'active') return { ...c, status: 'closed' as CampaignStatus, updated_at: new Date().toISOString() }
        return c
      }),
    }))
  }, [])

  const getDashboard = useCallback((campaignId: string): Dashboard => {
    const campaign = data.campaigns.find(c => c.id === campaignId)
    if (!campaign) return { affectedCount: 0, unresolvedCount: 0, noCheckInCount: 0, needBreakdown: {}, rows: [] }

    // dedupe by household_id — keep latest check-in per household
    const byHousehold = new Map<string, CheckIn>()
    for (const ci of data.checkIns) {
      if (ci.campaign_id !== campaignId) continue
      const existing = byHousehold.get(ci.household_id)
      if (!existing || ci.created_at > existing.created_at) {
        byHousehold.set(ci.household_id, ci)
      }
    }

    const barangayHouseholds = data.households.filter(h => h.barangay_code === campaign.barangay_code)
    const rows: DashboardRow[] = barangayHouseholds.map(hh => {
      const ci = byHousehold.get(hh.id) ?? null
      const answers = ci ? data.answers.filter(a => a.check_in_id === ci.id) : []
      return { household: hh, checkIn: ci, answers, submitted_by: ci?.submitted_by ?? null }
    })

    const affected = rows.filter(r => r.checkIn !== null)
    const unresolved = affected.filter(r => r.checkIn!.status === 'unresolved')
    const noCheckIn = rows.filter(r => r.checkIn === null)

    // need breakdown: count yes answers by need category
    const needBreakdown: Record<string, number> = {}
    for (const r of affected) {
      for (const a of r.answers) {
        if (a.answer === 'yes') {
          const q = data.questions.find(q => q.id === a.question_id)
          if (q) needBreakdown[q.need_category] = (needBreakdown[q.need_category] ?? 0) + 1
        }
      }
    }

    return {
      affectedCount: affected.length,
      unresolvedCount: unresolved.length,
      noCheckInCount: noCheckIn.length,
      needBreakdown,
      rows,
    }
  }, [data])

  const updateCaseStatus = useCallback((checkInId: string, status: CheckInStatus) => {
    setData(d => ({
      ...d,
      checkIns: d.checkIns.map(ci => ci.id === checkInId ? { ...ci, status, updated_at: new Date().toISOString() } : ci),
    }))
  }, [])

  const submitCheckIn = useCallback((input: { campaign_id: string; household_id: string; submitted_by: string; answers: { question_id: string; answer: string }[] }) => {
    const ci: CheckIn = {
      id: uid(),
      campaign_id: input.campaign_id,
      household_id: input.household_id,
      submitted_by: input.submitted_by,
      status: 'unresolved',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
    const ans: CheckInAnswer[] = input.answers.map(a => ({
      id: uid(),
      check_in_id: ci.id,
      question_id: a.question_id,
      answer: a.answer,
    }))
    setData(d => ({ ...d, checkIns: [...d.checkIns, ci], answers: [...d.answers, ...ans] }))
    return ci
  }, [])

  const exportCsv = useCallback((campaignId: string): string => {
    const campaign = data.campaigns.find(c => c.id === campaignId)
    if (!campaign) return ''

    const byHousehold = new Map<string, CheckIn>()
    for (const ci of data.checkIns) {
      if (ci.campaign_id !== campaignId) continue
      const existing = byHousehold.get(ci.household_id)
      if (!existing || ci.created_at > existing.created_at) {
        byHousehold.set(ci.household_id, ci)
      }
    }

    function esc(s: string): string {
      return s.includes('"') || s.includes(',') || s.includes('\n')
        ? `"${s.replace(/"/g, '""')}"`
        : s
    }

    const rows = data.households
      .filter(h => h.barangay_code === campaign.barangay_code)
      .map(hh => {
        const ci = byHousehold.get(hh.id)
        if (!ci) return null
        const answers = data.answers.filter(a => a.check_in_id === ci.id)
        const needs = answers
          .filter(a => a.answer === 'yes')
          .map(a => data.questions.find(q => q.id === a.question_id)?.need_category ?? '')
          .filter(Boolean)
          .join('; ')
        return [esc(hh.household_head_name), esc(hh.address), esc(needs), ci.status, esc(ci.submitted_by), ci.created_at].join(',')
      })
      .filter(Boolean)

    return `Household,Address,Needs,Status,Submitted By,Created At\n${rows.join('\n')}`
  }, [data])

  return {
    official,
    loginOfficial,
    logoutOfficial,
    data,
    createCampaign,
    addQuestion,
    removeQuestion,
    updateCampaignStatus,
    updateCaseStatus,
    submitCheckIn,
    getDashboard,
    exportCsv,
  }
}
