import { supabase } from "@/lib/supabase"
import type { CheckInStatus } from "@/lib/types"

const TRANSITIONS: Record<CheckInStatus, CheckInStatus | null> = {
  unresolved: "visited",
  visited: "resolved",
  resolved: null,
}

export async function advanceStatus(checkInId: string, currentStatus: CheckInStatus): Promise<CheckInStatus> {
  const next = TRANSITIONS[currentStatus]
  if (!next) return currentStatus
  const { error } = await supabase.from("check_ins").update({ status: next }).eq("id", checkInId)
  if (error) throw error
  return next
}
