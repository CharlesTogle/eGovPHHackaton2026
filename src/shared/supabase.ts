import { createClient } from '@supabase/supabase-js'
import type {
  Campaign,
  CampaignQuestion,
  CheckIn,
  CheckInAnswer,
  HandaData,
  CampaignStatus,
  CheckInStatus,
} from './index'

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined
const key = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

export const supabase: ReturnType<typeof createClient> | null =
  url && key ? createClient(url, key) : null

const db = () => supabase

function table(name: string) {
  return db()!.from(name) as any
}

export async function loadAll(): Promise<HandaData | null> {
  if (!db()) return null
  const [campaigns, questions, checkIns, answers] = await Promise.all([
    table('campaigns').select('*'),
    table('campaign_questions').select('*'),
    table('check_ins').select('*'),
    table('check_in_answers').select('*'),
  ])
  if (campaigns.error) console.error('loadAll campaigns:', campaigns.error)
  return {
    campaigns: (campaigns.data ?? []) as unknown as Campaign[],
    questions: (questions.data ?? []) as unknown as CampaignQuestion[],
    checkIns: (checkIns.data ?? []) as unknown as CheckIn[],
    answers: (answers.data ?? []) as unknown as CheckInAnswer[],
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

export async function insertQuestions(qs: CampaignQuestion[]) {
  if (!db()) return
  const { error } = await table('campaign_questions').insert(qs)
  if (error) console.error('insertQuestions:', error)
}

export async function replaceQuestions(campaignId: string, qs: CampaignQuestion[]) {
  if (!db()) return
  const { error: delErr } = await table('campaign_questions').delete().eq('campaign_id', campaignId)
  if (delErr) console.error('replaceQuestions delete:', delErr)
  if (qs.length > 0) {
    const { error } = await table('campaign_questions').insert(qs)
    if (error) console.error('replaceQuestions insert:', error)
  }
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
