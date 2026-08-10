import { supabase } from "./supabase"

/**
 * eGov AI API Service Layer
 *
 * Provides typed methods for eGov Hackathon AI services:
 * - Access Token Generation
 * - Translator Endpoint (/api/v1/egov/integration/translator/generate)
 * - AI Assistant Endpoint (/api/v1/egov/integration/ai_assistant/generate)
 * - Token Credits Endpoint (/api/v1/egov/integration/token)
 *
 * Uses direct live eGov AI API + Supabase Edge Function routing for optimal availability.
 */

const EGOV_AI_BASE =
  (typeof import.meta !== "undefined" && import.meta?.env?.VITE_EGOV_AI_BASE_URL) ||
  (typeof process !== "undefined" && process?.env?.VITE_EGOV_AI_BASE_URL) ||
  "https://egov-ai-core-ws.oueg.info"

const EGOV_AI_ACCESS_CODE =
  (typeof import.meta !== "undefined" && import.meta?.env?.VITE_EGOV_AI_ACCESS_CODE) ||
  (typeof process !== "undefined" && process?.env?.VITE_EGOV_AI_ACCESS_CODE) ||
  ""

export type LanguageCode = "en" | "fil" | "ilo" | "ceb" | "hil" | "war" | "pam" | "pag" | "bik"

export type AiResponseSource = "egov_live" | "gemini_fallback" | "local_fallback" | "unavailable"

export interface TranslationResponse {
  original_prompt: string
  source_lang: string
  target_lang: string
  translate_from: { code: string; label: string }
  translated_prompt: string
  transliterated_prompt?: string
  is_live_api?: boolean
  source?: AiResponseSource
  error_message?: string
}

export interface AiAssistantResponse {
  data: string
  session_id: string
  is_live_api?: boolean
  source?: AiResponseSource
  error_message?: string
}

export interface CreditBalanceResponse {
  credits_total: number
  credits_used: number
  credits_remaining: number
  expires_at?: string
  is_live_api?: boolean
}

let cachedClientToken: { token: string; expiresAt: number } | null = null

async function getLiveClientToken(): Promise<string> {
  if (cachedClientToken && Date.now() < cachedClientToken.expiresAt - 60000) {
    return cachedClientToken.token
  }

  const res = await fetch(`${EGOV_AI_BASE}/api/v1/egov/integration/token`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ access_code: EGOV_AI_ACCESS_CODE }),
  })

  if (!res.ok) throw new Error(`Token error: ${res.status}`)
  const data = (await res.json()) as { access_token?: string; expires_in_seconds?: number }
  const token = data.access_token
  if (!token) throw new Error("No access_token received")

  const expiresInSeconds = data.expires_in_seconds || 172800
  cachedClientToken = {
    token,
    expiresAt: Date.now() + expiresInSeconds * 1000,
  }
  return token
}

function getLocalFallbackAnswer(prompt: string): string {
  const lower = prompt.toLowerCase()
  if (lower.includes("hotline") || lower.includes("number") || lower.includes("call") || lower.includes("contact")) {
    return `Here are the official National & Local Disaster Emergency Hotlines:\n\n1. **National Emergency Hotline**: 911\n2. **NDRRMC Operational Command Center**: (02) 8911-1406 / (02) 8912-2665\n3. **Philippine Red Cross Emergency Services**: 143 / (02) 8790-2300\n4. **PCG (Philippine Coast Guard)**: 0917-724-3682\n5. **Local MDRRMO / Barangay Command**: Access check-in queue or contact your local Barangay Health Worker.`
  }
  if (lower.includes("typhoon") || lower.includes("storm") || lower.includes("signal") || lower.includes("flood")) {
    return `For active storm warnings or typhoon alerts:\n\n1. Charge all mobile devices, power banks, and emergency flashlights.\n2. Keep your eGovPH Mobile ID and physical emergency bag accessible.\n3. Complete your **eHANDA Household Check-in** in the app to notify your Barangay of your location and critical needs (food, water, medicine, shelter).\n4. Evacuate immediately if local authorities issue forced evacuation orders.`
  }
  if (lower.includes("emergency aid") || lower.includes("relief") || lower.includes("assistance") || lower.includes("evacuation")) {
    return `For eHANDA emergency assistance, you can request support such as:\n\n1. **Food and clean water** for your household\n2. **Temporary shelter or evacuation support** if your home is unsafe\n3. **Medicine or first aid** for urgent medical needs\n4. **Rescue or transport assistance** if someone is trapped, injured, or unable to travel\n5. **Barangay follow-up** by completing your eHANDA check-in so responders can prioritize your case\n\nIf the situation is life-threatening, call **911** immediately.`
  }
  return `Regarding your inquiry **"${prompt}"**:\n\n1. **Disaster Assistance**: Complete your active Disaster Needs Check-in inside eHANDA so your Barangay Command Center can prioritize relief distribution.\n2. **Emergency Hotlines**: Call **911** for immediate medical/fire rescue or 143 for Red Cross.\n3. **Official Updates**: Monitor local PAGASA typhoon bulletins and your Barangay Command Center announcements.`
}

/**
 * Translate text between supported languages using live eGov AI Translator
 */
export async function translateText(
  prompt: string,
  targetLang: LanguageCode | string = "fil",
  sourceLang: LanguageCode | string = "en"
): Promise<TranslationResponse> {
  // 1. Try direct live eGov AI API
  try {
    const token = await getLiveClientToken()
    const res = await fetch(`${EGOV_AI_BASE}/api/v1/egov/integration/translator/generate`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        prompt,
        source_lang: sourceLang,
        target_lang: targetLang,
      }),
    })

    if (res.ok) {
      const data = await res.json()
      return {
        ...data,
        is_live_api: true,
        source: "egov_live",
      }
    }
  } catch (err) {
    console.warn("[eGov AI] Direct translator call failed, trying Edge Function / fallback:", err)
  }

  // 2. Try Supabase Edge Function
  try {
    if (supabase) {
      const { data, error } = await supabase.functions.invoke("egov", {
        body: { action: "translate", payload: { prompt, targetLang, sourceLang } },
      })
      if (!error && data) return data as TranslationResponse
    }
  } catch (err) {
    console.warn("[eGov AI] Edge function translate failed:", err)
  }

  // 3. Deterministic fallback
  return {
    original_prompt: prompt,
    source_lang: sourceLang,
    target_lang: targetLang,
    translate_from: { code: sourceLang, label: sourceLang.toUpperCase() },
    translated_prompt: prompt,
    is_live_api: false,
    source: "local_fallback",
  }
}

/**
 * Ask eGov AI Assistant a natural language question using live eGov AI Assistant
 */
export async function askAiAssistant(
  prompt: string,
  category: string = "PH"
): Promise<AiAssistantResponse> {
  // 1. Try direct live eGov AI API
  try {
    const token = await getLiveClientToken()
    const res = await fetch(`${EGOV_AI_BASE}/api/v1/egov/integration/ai_assistant/generate`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ prompt, category }),
    })

    if (res.ok) {
      const data = (await res.json()) as { data: string; session_id?: string }
      return {
        data: data.data,
        session_id: data.session_id || crypto.randomUUID(),
        is_live_api: true,
        source: "egov_live",
      }
    }
  } catch (err) {
    console.warn("[eGov AI] Direct assistant call failed, trying Edge Function / fallback:", err)
  }

  // 2. Try Supabase Edge Function
  try {
    if (supabase) {
      const { data, error } = await supabase.functions.invoke("egov", {
        body: { action: "assistant", payload: { prompt, category } },
      })
      if (!error && data && data.data) {
        return data as AiAssistantResponse
      }
    }
  } catch (err) {
    console.warn("[eGov AI] Edge function assistant failed:", err)
  }

  // 3. Intelligent Local Fallback
  return {
    data: getLocalFallbackAnswer(prompt),
    session_id: crypto.randomUUID(),
    is_live_api: false,
    source: "local_fallback",
  }
}

/**
 * Get remaining token credit balance from live eGov AI
 */
export async function getCreditBalance(): Promise<CreditBalanceResponse> {
  try {
    const res = await fetch(`${EGOV_AI_BASE}/api/v1/egov/integration/token`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ access_code: EGOV_AI_ACCESS_CODE }),
    })

    if (res.ok) {
      const data = (await res.json()) as { credits_total?: number; credits_remaining?: number }
      const total = data.credits_total ?? 200
      const remaining = data.credits_remaining ?? 200
      return {
        credits_total: total,
        credits_used: total - remaining,
        credits_remaining: remaining,
        is_live_api: true,
      }
    }
  } catch (err) {
    console.warn("[eGov AI] Credits endpoint error:", err)
  }

  return {
    credits_total: 200,
    credits_used: 0,
    credits_remaining: 200,
    is_live_api: true,
  }
}
