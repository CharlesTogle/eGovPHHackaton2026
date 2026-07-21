import { useCallback, useEffect, useState } from "react"
import type { Campaign } from "@/lib/types"
import { listCampaigns } from "./service"

export function useCampaigns(barangayCode: string) {
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [loading, setLoading] = useState(true)

  const refetch = useCallback(async () => {
    setLoading(true)
    try {
      const data = await listCampaigns(barangayCode)
      setCampaigns(data)
    } finally {
      setLoading(false)
    }
  }, [barangayCode])

  useEffect(() => {
    let cancelled = false
    async function load() {
      setLoading(true)
      try {
        const data = await listCampaigns(barangayCode)
        if (!cancelled) setCampaigns(data)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [barangayCode])

  return { campaigns, loading, refetch }
}
