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
    refetch()
  }, [refetch])

  return { campaigns, loading, refetch }
}
