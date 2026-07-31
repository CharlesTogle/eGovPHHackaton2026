import { supabase } from "@/lib/supabase"

const USE_MOCK = import.meta.env.VITE_EGOV_SSO_USE_MOCK !== "false"

function requireSupabase() {
  if (!supabase) throw new Error("Supabase client not configured")
  return supabase
}

export async function requestOTP(email: string): Promise<{ already_verified: boolean }> {
  if (USE_MOCK) {
    await new Promise((r) => setTimeout(r, 400))
    return { already_verified: false }
  }

  const { data, error } = await requireSupabase().functions.invoke("egov", {
    body: { action: "request-otp", payload: { email } },
  })
  if (error) throw error
  return data as { already_verified: boolean }
}

export async function confirmOTP(email: string, otp: string): Promise<boolean> {
  if (USE_MOCK) {
    await new Promise((r) => setTimeout(r, 400))
    return otp === "123456"
  }

  const { data, error } = await requireSupabase().functions.invoke("egov", {
    body: { action: "confirm-otp", payload: { email, otp } },
  })
  if (error) throw error
  return Boolean((data as { verified?: boolean } | null)?.verified)
}
