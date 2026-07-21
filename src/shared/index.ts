import { useState, useCallback, useEffect } from 'react'
import * as supabaseDb from './supabase'
import { runSSO, type DemoIdentity } from '@/features/auth/egov-sso'
import type { EgovProfile } from '@/features/auth/types'

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

export type CheckIn = {
  id: string
  campaign_id: string
  name: string
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

// --- Official session (eGovPH SSO) ---

export type OfficialRole = 'official'

export type Official = {
  uniqid: string
  name: string
  barangay_code: string
  barangay: string
  role: OfficialRole
  email?: string
  first_name?: string
  last_name?: string
  photo?: string | null
}

// Adapter: convert EgovProfile to Official
function egovProfileToOfficial(profile: EgovProfile): Official {
  return {
    uniqid: profile.uniqid,
    name: `${profile.first_name} ${profile.last_name}`,
    barangay_code: profile.barangay_code,
    barangay: profile.barangay,
    role: 'official',
    email: profile.email,
    first_name: profile.first_name,
    last_name: profile.last_name,
    photo: profile.photo,
  }
}

// --- RBAC ---

export type Permission =
  | 'create_campaign'
  | 'edit_questions'
  | 'publish_campaign'
  | 'close_campaign'
  | 'archive_campaign'
  | 'manual_entry'
  | 'update_case'
  | 'export_csv'

const ROLE_PERMISSIONS: Record<OfficialRole, Permission[]> = {
  official: [
    'create_campaign',
    'edit_questions',
    'publish_campaign',
    'close_campaign',
    'archive_campaign',
    'manual_entry',
    'update_case',
    'export_csv',
  ],
}

export function can(role: OfficialRole, permission: Permission): boolean {
  return ROLE_PERMISSIONS[role]?.includes(permission) ?? false
}

// --- Dashboard aggregation ---

export type DashboardRow = {
  checkIn: CheckIn
  answers: CheckInAnswer[]
}

export type Dashboard = {
  affectedCount: number
  unresolvedCount: number
  needBreakdown: Record<string, number>
  rows: DashboardRow[]
}

// --- Data store shape ---

export type HandaData = {
  campaigns: Campaign[]
  questions: CampaignQuestion[]
  checkIns: CheckIn[]
  answers: CheckInAnswer[]
}

// --- Initial empty state ---

const emptyData: HandaData = {
  campaigns: [],
  questions: [],
  checkIns: [],
  answers: [],
}

// --- Hook: single source of truth ---

function uid(): string {
  return crypto.randomUUID()
}

const SESSION_KEY = 'handa_session'

function loadSession(): Official | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY)
    return raw ? JSON.parse(raw) as Official : null
  } catch {
    return null
  }
}

function saveSession(official: Official | null) {
  if (official) {
    localStorage.setItem(SESSION_KEY, JSON.stringify(official))
  } else {
    localStorage.removeItem(SESSION_KEY)
  }
}

export function useHandaStore() {
  const [data, setData] = useState<HandaData>(emptyData)
  const [official, setOfficial] = useState<Official | null>(loadSession)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabaseDb.loadAll().then(remote => {
      if (remote) setData(remote)
      setLoading(false)
    })
  }, [])

  const loginOfficial = useCallback(async (demoIdentity?: DemoIdentity) => {
    try {
      const profile = await runSSO(demoIdentity)
      const official = egovProfileToOfficial(profile)
      setOfficial(official)
      saveSession(official)
      return official
    } catch (error) {
      console.error('SSO login failed:', error)
      throw error
    }
  }, [])

  const logoutOfficial = useCallback(() => {
    setOfficial(null)
    saveSession(null)
  }, [])

  const createCampaign = useCallback(async (input: { name: string; disaster_type: string; disaster_date: string }) => {
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
    await supabaseDb.insertCampaign(c)
    return c
  }, [official])

  const updateCampaign = useCallback((id: string, input: { name: string; disaster_type: string; disaster_date: string }) => {
    setData(d => ({
      ...d,
      campaigns: d.campaigns.map(c =>
        c.id === id ? { ...c, ...input, updated_at: new Date().toISOString() } : c
      ),
    }))
    supabaseDb.updateCampaignDb(id, input)
  }, [])

  const saveCampaign = useCallback(async (id: string, input: { name: string; disaster_type: string; disaster_date: string }) => {
    setData(d => ({
      ...d,
      campaigns: d.campaigns.map(c =>
        c.id === id ? { ...c, ...input, updated_at: new Date().toISOString() } : c
      ),
    }))
    await supabaseDb.updateCampaignDb(id, input)
  }, [])

  const addQuestion = useCallback((campaignId: string, question_text: string, need_category: string) => {
    const order = data.questions.filter(q => q.campaign_id === campaignId).length
    const q: CampaignQuestion = { id: uid(), campaign_id: campaignId, question_text, need_category, display_order: order }
    setData(d => ({ ...d, questions: [...d.questions, q] }))
    supabaseDb.insertQuestion(q)
  }, [data])

  const removeQuestion = useCallback((questionId: string) => {
    setData(d => ({ ...d, questions: d.questions.filter(q => q.id !== questionId) }))
    supabaseDb.deleteQuestion(questionId)
  }, [])

  const updateCampaignStatus = useCallback(async (campaignId: string, status: CampaignStatus) => {
    setData(d => ({
      ...d,
      campaigns: d.campaigns.map(c => {
        if (c.id === campaignId) return { ...c, status, updated_at: new Date().toISOString() }
        if (status === 'active' && c.status === 'active') return { ...c, status: 'closed' as CampaignStatus, updated_at: new Date().toISOString() }
        return c
      }),
    }))
    await supabaseDb.updateCampaignStatusDb(campaignId, status)
    if (status === 'active') await supabaseDb.deactivateOtherCampaigns(campaignId)
  }, [])

  const getDashboard = useCallback((campaignId: string): Dashboard => {
    const campaign = data.campaigns.find(c => c.id === campaignId)
    if (!campaign) return { affectedCount: 0, unresolvedCount: 0, needBreakdown: {}, rows: [] }

    const checkIns = data.checkIns.filter(ci => ci.campaign_id === campaignId)
    const rows: DashboardRow[] = checkIns.map(ci => ({
      checkIn: ci,
      answers: data.answers.filter(a => a.check_in_id === ci.id),
    }))

    const unresolved = rows.filter(r => r.checkIn.status === 'unresolved')
    const needBreakdown: Record<string, number> = {}
    for (const r of rows) {
      for (const a of r.answers) {
        if (a.answer === 'yes') {
          const q = data.questions.find(q => q.id === a.question_id)
          if (q) needBreakdown[q.need_category] = (needBreakdown[q.need_category] ?? 0) + 1
        }
      }
    }

    return {
      affectedCount: rows.length,
      unresolvedCount: unresolved.length,
      needBreakdown,
      rows,
    }
  }, [data])

  const updateCaseStatus = useCallback(async (checkInId: string, status: CheckInStatus) => {
    setData(d => ({
      ...d,
      checkIns: d.checkIns.map(ci => ci.id === checkInId ? { ...ci, status, updated_at: new Date().toISOString() } : ci),
    }))
    await supabaseDb.updateCaseStatusDb(checkInId, status)
  }, [])

  const submitCheckIn = useCallback(async (input: { campaign_id: string; name: string; submitted_by: string; answers: { question_id: string; answer: string }[] }) => {
    const ci: CheckIn = {
      id: uid(),
      campaign_id: input.campaign_id,
      name: input.name,
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
    await supabaseDb.insertCheckInDb(ci)
    await supabaseDb.insertAnswersDb(ans)
    return ci
  }, [])

  const exportCsv = useCallback((campaignId: string): string => {
    const checkIns = data.checkIns.filter(ci => ci.campaign_id === campaignId)
    if (checkIns.length === 0) return ''

    function esc(s: string): string {
      return s.includes('"') || s.includes(',') || s.includes('\n')
        ? `"${s.replace(/"/g, '""')}"`
        : s
    }

    const rows = checkIns.map(ci => {
      const answers = data.answers.filter(a => a.check_in_id === ci.id)
      const needs = answers
        .filter(a => a.answer === 'yes')
        .map(a => data.questions.find(q => q.id === a.question_id)?.need_category ?? '')
        .filter(Boolean)
        .join('; ')
      return [esc(ci.name), esc(needs), ci.status, esc(ci.submitted_by), ci.created_at].join(',')
    })

    return `Name,Needs,Status,Submitted By,Created At\n${rows.join('\n')}`
  }, [data])

  const copyQuestions = useCallback((sourceCampaignId: string, targetCampaignId: string) => {
    const source = data.questions.filter(q => q.campaign_id === sourceCampaignId)
    if (source.length === 0) return
    const existingOrder = data.questions.filter(q => q.campaign_id === targetCampaignId).length
    const copies = source.map((q, i) => ({
      id: uid(),
      campaign_id: targetCampaignId,
      question_text: q.question_text,
      need_category: q.need_category,
      display_order: existingOrder + i,
    }))
    setData(d => ({ ...d, questions: [...d.questions, ...copies] }))
    supabaseDb.insertQuestions(copies)
  }, [data])

  return {
    official,
    loginOfficial,
    logoutOfficial,
    loading,
    data,
    createCampaign,
    updateCampaign,
    saveCampaign,
    addQuestion,
    removeQuestion,
    updateCampaignStatus,
    updateCaseStatus,
    submitCheckIn,
    getDashboard,
    exportCsv,
    copyQuestions,
  }
}
