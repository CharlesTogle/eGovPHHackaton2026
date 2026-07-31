import { supabase } from '@/lib/supabase'
import type {
  Campaign,
  CampaignQuestion,
  CheckIn,
  CheckInAnswer,
  HandaData,
  CampaignStatus,
  CheckInStatus,
} from './index'
import type { Alert } from '@/features/alerts/types'

import { DEMO_CAMPAIGNS, DEMO_QUESTIONS, DEMO_CHECK_INS, DEMO_ANSWERS } from '@/features/demo/historical-demo-data'

const db = () => supabase

function table(name: string) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return db()!.from(name) as any
}

export async function seedDemoDataIfEmpty() {
  if (!db()) return
  try {
    const { data: existing } = await table('campaigns').select('id').limit(1)
    if (existing && existing.length > 0) return

    console.log('Seeding Supabase DB with historical demo dataset...')
    await table('campaigns').insert(DEMO_CAMPAIGNS)
    await table('campaign_questions').insert(DEMO_QUESTIONS)

    for (let i = 0; i < DEMO_CHECK_INS.length; i += 50) {
      const chunk = DEMO_CHECK_INS.slice(i, i + 50)
      await table('check_ins').insert(chunk)
    }

    for (let i = 0; i < DEMO_ANSWERS.length; i += 100) {
      const chunk = DEMO_ANSWERS.slice(i, i + 100)
      await table('check_in_answers').insert(chunk)
    }
    console.log('Supabase DB seeding completed successfully!')
  } catch (err) {
    console.error('Failed to seed demo data to Supabase:', err)
  }
}

export async function loadAll(): Promise<HandaData | null> {
  if (!db()) return null
  const [campaigns, questions, checkIns, answers, alerts] = await Promise.all([
    table('campaigns').select('*'),
    table('campaign_questions').select('*'),
    table('check_ins').select('*'),
    table('check_in_answers').select('*'),
    table('alerts').select('*').order('created_at', { ascending: false }),
  ])
  if (campaigns.error) console.error('loadAll campaigns:', campaigns.error)
  const loadedCampaigns = (campaigns.data ?? []) as unknown as Campaign[]

  if (loadedCampaigns.length === 0) {
    seedDemoDataIfEmpty().catch(console.error)
  }

  return {
    campaigns: loadedCampaigns,
    questions: (questions.data ?? []) as unknown as CampaignQuestion[],
    checkIns: (checkIns.data ?? []) as unknown as CheckIn[],
    answers: (answers.data ?? []) as unknown as CheckInAnswer[],
    alerts: (alerts.data ?? []) as unknown as Alert[],
  }
}

export async function insertCampaign(c: Campaign) {
  if (!db()) return null
  const { data, error } = await table('campaigns').insert(c).select().single()
  if (error) console.error('insertCampaign:', error)
  return error ? null : (data as unknown as Campaign)
}

export async function updateCampaignDb(id: string, fields: { name: string; disaster_type: string; disaster_date: string }) {
  if (!db()) return
  const { error } = await table('campaigns').update({ ...fields, updated_at: new Date().toISOString() }).eq('id', id)
  if (error) console.error('updateCampaignDb:', error)
}

export async function insertQuestion(q: CampaignQuestion) {
  if (!db()) return null
  const { data, error } = await table('campaign_questions').insert(q).select().single()
  if (error) console.error('insertQuestion:', error)
  return error ? null : (data as unknown as CampaignQuestion)
}

export async function deleteQuestion(id: string) {
  if (!db()) return
  const { error } = await table('campaign_questions').delete().eq('id', id)
  if (error) console.error('deleteQuestion:', error)
}

export async function updateQuestionDb(id: string, fields: { question_text: string; need_category: string }) {
  if (!db()) return
  const { error } = await table('campaign_questions').update(fields).eq('id', id)
  if (error) console.error('updateQuestionDb:', error)
}

export async function insertQuestions(qs: CampaignQuestion[]) {
  if (!db()) return
  const { error } = await table('campaign_questions').insert(qs)
  if (error) console.error('insertQuestions:', error)
}

export async function updateCampaignStatusDb(id: string, status: CampaignStatus) {
  if (!db()) return
  const { error } = await table('campaigns').update({ status, updated_at: new Date().toISOString() }).eq('id', id)
  if (error) console.error('updateCampaignStatusDb:', error)
}

export async function deactivateOtherCampaigns(excludeId: string) {
  if (!db()) return
  const { error } = await table('campaigns')
    .update({ status: 'closed', updated_at: new Date().toISOString() })
    .eq('status', 'active')
    .neq('id', excludeId)
  if (error) console.error('deactivateOtherCampaigns:', error)
}

export async function updateCaseStatusDb(id: string, status: CheckInStatus) {
  if (!db()) return
  const { error } = await table('check_ins')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', id)
  if (error) console.error('updateCaseStatusDb:', error)
}

export async function insertCheckInDb(ci: CheckIn) {
  if (!db()) return null
  const { data, error } = await table('check_ins').insert(ci).select().single()
  if (error) console.error('insertCheckInDb:', error)
  return error ? null : (data as unknown as CheckIn)
}

export async function insertAnswersDb(answers: CheckInAnswer[]) {
  if (!db()) return
  const { error } = await table('check_in_answers').insert(answers)
  if (error) console.error('insertAnswersDb:', error)
}

export async function insertAlert(alert: Alert) {
  if (!db()) return null
  const { data, error } = await table('alerts').insert(alert).select().single()
  if (error) console.error('insertAlert:', error)
  return error ? null : (data as unknown as Alert)
}
