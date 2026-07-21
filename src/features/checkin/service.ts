import { supabase } from "@/lib/supabase"
import type { CheckIn, CheckInAnswer } from "@/lib/types"

export interface UpsertCheckInInput {
  campaignId: string
  householdId: string
  submittedBy: string
  answers: { questionId: string; answer: string }[]
}

export async function upsertCheckIn(input: UpsertCheckInInput): Promise<CheckIn> {
  const { data: existing, error: findError } = await supabase
    .from("check_ins")
    .select("*")
    .eq("campaign_id", input.campaignId)
    .eq("household_id", input.householdId)
    .maybeSingle()

  if (findError) throw findError

  let checkIn: CheckIn

  if (existing) {
    const { data, error } = await supabase
      .from("check_ins")
      .update({ updated_at: new Date().toISOString() })
      .eq("id", existing.id)
      .select()
      .single()
    if (error) throw error
    checkIn = data as CheckIn
  } else {
    const { data, error } = await supabase
      .from("check_ins")
      .insert({
        campaign_id: input.campaignId,
        household_id: input.householdId,
        submitted_by: input.submittedBy,
      })
      .select()
      .single()
    if (error) throw error
    checkIn = data as CheckIn
  }

  for (const a of input.answers) {
    const { data: existingAnswer } = await supabase
      .from("check_in_answers")
      .select("*")
      .eq("check_in_id", checkIn.id)
      .eq("question_id", a.questionId)
      .maybeSingle()

    if (existingAnswer) {
      const merged = mergeAnswer(existingAnswer.answer, a.answer)
      await supabase
        .from("check_in_answers")
        .update({ answer: merged })
        .eq("id", existingAnswer.id)
    } else {
      await supabase
        .from("check_in_answers")
        .insert({ check_in_id: checkIn.id, question_id: a.questionId, answer: a.answer })
    }
  }

  return checkIn
}

function mergeAnswer(existing: string, incoming: string): string {
  if (existing.toLowerCase() === "yes" || incoming.toLowerCase() === "yes") return "yes"
  return incoming
}
