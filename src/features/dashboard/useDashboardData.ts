import { useCallback, useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import type { Campaign, CampaignQuestion, CheckIn, CheckInAnswer, Household } from "@/lib/types"
import { aggregate, type DashboardData } from "@/lib/aggregator"

interface DashboardState {
  data: DashboardData | null
  loading: boolean
  refresh: () => Promise<void>
}

export function useDashboardData(campaignId: string | null, barangayCode: string): DashboardState {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    if (!campaignId) {
      setData(null)
      setLoading(false)
      return
    }

    const [checkInsRes, answersRes, questionsRes, householdsRes] = await Promise.all([
      supabase.from("check_ins").select("*").eq("campaign_id", campaignId),
      supabase.from("check_in_answers").select("*"),
      supabase.from("campaign_questions").select("*").eq("campaign_id", campaignId),
      supabase.from("households").select("*").eq("barangay_code", barangayCode),
    ])

    const checkIns = (checkInsRes.data ?? []) as CheckIn[]
    const answers = (answersRes.data ?? []) as CheckInAnswer[]
    const questions = (questionsRes.data ?? []) as CampaignQuestion[]
    const households = (householdsRes.data ?? []) as Household[]

    setData(aggregate(checkIns, answers, questions, households))
    setLoading(false)
  }, [campaignId, barangayCode])

  useEffect(() => {
    let cancelled = false
    async function load() {
      if (!campaignId) {
        if (!cancelled) {
          setData(null)
          setLoading(false)
        }
        return
      }
      const [checkInsRes, answersRes, questionsRes, householdsRes] = await Promise.all([
        supabase.from("check_ins").select("*").eq("campaign_id", campaignId),
        supabase.from("check_in_answers").select("*"),
        supabase.from("campaign_questions").select("*").eq("campaign_id", campaignId),
        supabase.from("households").select("*").eq("barangay_code", barangayCode),
      ])

      const checkIns = (checkInsRes.data ?? []) as CheckIn[]
      const answers = (answersRes.data ?? []) as CheckInAnswer[]
      const questions = (questionsRes.data ?? []) as CampaignQuestion[]
      const households = (householdsRes.data ?? []) as Household[]

      if (!cancelled) {
        setData(aggregate(checkIns, answers, questions, households))
        setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [campaignId, barangayCode])

  return { data, loading, refresh }
}

export async function listActiveCampaigns(barangayCode: string): Promise<Campaign[]> {
  const { data } = await supabase
    .from("campaigns")
    .select("*")
    .eq("barangay_code", barangayCode)
    .eq("status", "active")
    .order("created_at", { ascending: false })
  return (data ?? []) as Campaign[]
}

export async function getQuestionsForCampaign(campaignId: string): Promise<CampaignQuestion[]> {
  const { data } = await supabase
    .from("campaign_questions")
    .select("*")
    .eq("campaign_id", campaignId)
    .order("display_order")
  return (data ?? []) as CampaignQuestion[]
}
