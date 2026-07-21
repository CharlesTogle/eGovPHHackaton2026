import { supabase } from "@/lib/supabase"
import type { Campaign, CampaignQuestion } from "@/lib/types"
import type { CampaignDraft, QuestionDraft } from "./types"

export async function listCampaigns(barangayCode: string): Promise<Campaign[]> {
  const { data, error } = await supabase
    .from("campaigns")
    .select("*")
    .eq("barangay_code", barangayCode)
    .order("created_at", { ascending: false })
  if (error) throw error
  return data as Campaign[]
}

export async function getCampaign(id: string): Promise<Campaign | null> {
  const { data, error } = await supabase.from("campaigns").select("*").eq("id", id).maybeSingle()
  if (error) throw error
  return data as Campaign | null
}

export async function getQuestions(campaignId: string): Promise<CampaignQuestion[]> {
  const { data, error } = await supabase
    .from("campaign_questions")
    .select("*")
    .eq("campaign_id", campaignId)
    .order("display_order")
  if (error) throw error
  return data as CampaignQuestion[]
}

export async function createCampaign(
  draft: CampaignDraft,
  createdBy: string,
  barangayCode: string
): Promise<Campaign> {
  const { data, error } = await supabase
    .from("campaigns")
    .insert({ ...draft, created_by: createdBy, barangay_code: barangayCode })
    .select()
    .single()
  if (error) throw error
  return data as Campaign
}

export async function addQuestions(
  campaignId: string,
  questions: QuestionDraft[]
): Promise<CampaignQuestion[]> {
  const rows = questions.map((q, i) => ({
    campaign_id: campaignId,
    question_text: q.question_text,
    need_category: q.need_category,
    display_order: i,
  }))
  const { data, error } = await supabase.from("campaign_questions").insert(rows).select()
  if (error) throw error
  return data as CampaignQuestion[]
}

export async function publishCampaign(id: string): Promise<void> {
  const { error } = await supabase.from("campaigns").update({ status: "active" }).eq("id", id)
  if (error) throw error
}

export async function closeCampaign(id: string): Promise<void> {
  const { error } = await supabase.from("campaigns").update({ status: "closed" }).eq("id", id)
  if (error) throw error
}
