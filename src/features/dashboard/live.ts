import { useEffect } from "react"
import { supabase } from "@/lib/supabase"

export function useCampaignLive(campaignId: string | null, onRefresh: () => void) {
  useEffect(() => {
    if (!campaignId) return

    const channel = supabase
      .channel(`campaign-${campaignId}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "check_ins", filter: `campaign_id=eq.${campaignId}` }, onRefresh)
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "check_ins", filter: `campaign_id=eq.${campaignId}` }, onRefresh)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "check_in_answers" }, onRefresh)
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [campaignId, onRefresh])
}
