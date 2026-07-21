import { supabase } from "@/lib/supabase"

export async function resolveRole(uniqid: string): Promise<"official" | "resident"> {
  if (!supabase) {
    console.warn("Supabase client not initialized, defaulting to resident")
    return "resident"
  }

  const { data, error } = await supabase
    .from("officials")
    .select("uniqid")
    .eq("uniqid", uniqid)
    .maybeSingle()

  if (error) {
    console.warn("Role lookup failed, defaulting to resident:", error.message)
    return "resident"
  }
  return data ? "official" : "resident"
}
