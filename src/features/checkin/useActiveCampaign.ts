import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import type { Campaign, CampaignQuestion } from "@/lib/types"

interface ActiveCampaignData {
  campaign: Campaign | null
  questions: CampaignQuestion[]
  loading: boolean
}

export function useActiveCampaign(barangayCode: string): ActiveCampaignData {
  const [campaign, setCampaign] = useState<Campaign | null>(null)
  const [questions, setQuestions] = useState<CampaignQuestion[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      setLoading(true)
      const { data: campaigns } = await supabase
        .from("campaigns")
        .select("*")
        .eq("barangay_code", barangayCode)
        .eq("status", "active")
        .order("created_at", { ascending: false })
        .limit(1)

      const active = campaigns?.[0] ?? null
      setCampaign(active as Campaign | null)

      if (active) {
        const { data: qs } = await supabase
          .from("campaign_questions")
          .select("*")
          .eq("campaign_id", active.id)
          .order("display_order")
        setQuestions((qs ?? []) as CampaignQuestion[])
      } else {
        setQuestions([])
      }

      setLoading(false)
    }
    load()
  }, [barangayCode])

  return { campaign, questions, loading }
}
