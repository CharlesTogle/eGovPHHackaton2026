import { supabase } from "@/lib/supabase"

const KNOWN_DEVS = new Set(["DEV_CITYAPP_001", "DEV_KAWIT_001"])
const KNOWN_LGUS = new Set(["LGU_ALAMINOS_001"])
const KNOWN_OFFICIALS = new Set(["BRGY_ALEXIS001"])

export async function resolveRole(uniqid: string): Promise<"official" | "resident" | "developer" | "lgu"> {
  if (KNOWN_DEVS.has(uniqid)) return "developer"
  if (KNOWN_LGUS.has(uniqid)) return "lgu"
  if (KNOWN_OFFICIALS.has(uniqid)) return "official"

  if (!supabase) {
    console.warn("Supabase client not initialized, defaulting to resident")
    return "resident"
  }

  const { data: devData, error: devErr } = await supabase
    .from("developers")
    .select("barangay_code")
    .eq("uniqid", uniqid)
    .maybeSingle()

  if (devData) return "developer"

  if (devErr) {
    const msg = (devErr as { message?: string }).message ?? ""
    console.warn("Developers table lookup failed:", msg)
    return "resident"
  }

  const { data, error } = await supabase
    .from("officials")
    .select("role")
    .eq("uniqid", uniqid)
    .maybeSingle()

  if (error) {
    console.warn("Role lookup failed, defaulting to resident:", error.message)
    return "resident"
  }
  
  return data?.role === "official" ? "official" : "resident"
}
