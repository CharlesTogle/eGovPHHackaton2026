/**
 * eGov AI API Service Layer
 *
 * Provides typed methods for eGov Hackathon AI services:
 * - Access Token Generation
 * - Translator Endpoint
 * - AI Assistant Endpoint
 * - Token Credits Endpoint
 *
 * Automatically routes requests via Vite dev proxy (`/api/egov-ai`) in development
 * to bypass browser CORS restrictions.
 */

const IS_DEV = import.meta.env.DEV
const RAW_BASE_URL = (import.meta.env.VITE_EGOV_AI_BASE_URL as string) || "https://hackathon-sso.e.gov.ph"
const BASE_URL = IS_DEV ? "/api/egov-ai" : `${RAW_BASE_URL}/api/v1/egov/integration`
const ACCESS_CODE = (import.meta.env.VITE_EGOV_AI_ACCESS_CODE as string) || (import.meta.env.VITE_EGOV_INTEGRATION_ACCESS_CODE as string) || ""
const GEMINI_KEY = (import.meta.env.VITE_GEMINI_API_KEY as string) || ""

let cachedToken: string | null = null
let tokenExpiryTime: number | null = null

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

/**
 * Get or refresh access token for eGov AI endpoints
 */
export async function getEgovAiToken(): Promise<string> {
  if (cachedToken && tokenExpiryTime && Date.now() < tokenExpiryTime - 60000) {
    return cachedToken
  }

  if (!ACCESS_CODE) {
    console.warn("[eGov AI] No access_code configured in environment.")
    throw new Error("eGov AI access code is missing.")
  }

  const endpoint = IS_DEV ? `${BASE_URL}/token` : `${BASE_URL}/token`

  try {
    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ access_code: ACCESS_CODE }),
    })

    if (!res.ok) {
      throw new Error(`Token endpoint returned HTTP ${res.status}`)
    }

    const data = await res.json()
    if (!data.access_token) {
      throw new Error("No access_token field in server response")
    }

    cachedToken = data.access_token
    const ttlMs = (data.expires_in_seconds || 28800) * 1000
    tokenExpiryTime = Date.now() + ttlMs
    console.log("[eGov AI] Successfully authenticated with live access token.")
    return cachedToken!
  } catch (err) {
    console.error("[eGov AI] Token request failed:", err)
    throw err
  }
}

/**
 * Translate text between supported languages
 */
export async function translateText(
  prompt: string,
  targetLang: LanguageCode | string = "fil",
  sourceLang: LanguageCode | string = "en"
): Promise<TranslationResponse> {
  const endpoint = `${BASE_URL}/translator/generate`

  try {
    const token = await getEgovAiToken()
    const res = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        prompt,
        source_lang: sourceLang,
        target_lang: targetLang,
      }),
    })

    if (!res.ok) {
      throw new Error(`Translator endpoint error: HTTP ${res.status}`)
    }

    const data = await res.json()
    return {
      ...data,
      is_live_api: true,
      source: "egov_live",
    }
  } catch (err) {
    console.warn("[eGov AI] Translation API call failed, providing contextual dialect response:", err)

    // Contextual translation mapping for common disaster phrases
    const dialectNameMap: Record<string, string> = {
      fil: "Filipino",
      ilo: "Ilocano",
      ceb: "Cebuano",
      hil: "Hiligaynon",
      war: "Waray",
      pam: "Kapampangan",
      pag: "Pangasinan",
      bik: "Bikolano",
      en: "English",
    }

    const geminiTranslation = await queryGeminiTranslation(prompt, String(targetLang), String(sourceLang))
    if (geminiTranslation) {
      return {
        original_prompt: prompt,
        source_lang: sourceLang,
        target_lang: targetLang,
        translate_from: { code: sourceLang, label: dialectNameMap[sourceLang] || sourceLang.toUpperCase() },
        translated_prompt: geminiTranslation,
        is_live_api: false,
        source: "gemini_fallback",
      }
    }

    return {
      original_prompt: prompt,
      source_lang: sourceLang,
      target_lang: targetLang,
      translate_from: { code: sourceLang, label: dialectNameMap[sourceLang] || sourceLang.toUpperCase() },
      translated_prompt: "",
      is_live_api: false,
      source: "unavailable",
      error_message: err instanceof Error ? err.message : "Translation unavailable",
    }
  }
}

async function queryGeminiTranslation(prompt: string, targetLang: string, sourceLang: string): Promise<string | null> {
  if (!GEMINI_KEY) return null
  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_KEY}`
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: `Translate this text from ${sourceLang} to ${targetLang}. Return only the translated text. Text: "${prompt}"`,
              },
            ],
          },
        ],
      }),
    })
    if (!res.ok) return null
    const json = await res.json()
    return json?.candidates?.[0]?.content?.parts?.[0]?.text || null
  } catch {
    return null
  }
}

/**
 * Secondary fallback to Gemini API if configured
 */
async function queryGeminiAssistant(prompt: string): Promise<string | null> {
  if (!GEMINI_KEY) return null
  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_KEY}`
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: `You are the eGovPH Citizen Assistant for HANDA Disaster Management Portal. Answer the citizen's query concisely and helpfully regarding disaster preparation, emergency hotlines (911, NDRRMC, local MDRRMO), eGovPH services, or relief procedures.\n\nCitizen Query: "${prompt}"`,
              },
            ],
          },
        ],
      }),
    })
    if (!res.ok) return null
    const json = await res.json()
    const responseText = json?.candidates?.[0]?.content?.parts?.[0]?.text
    return responseText || null
  } catch (err) {
    console.warn("[eGov AI] Gemini secondary fallback failed:", err)
    return null
  }
}

/**
 * Ask eGov AI Assistant a natural language question
 */
export async function askAiAssistant(
  prompt: string,
  category: string = "PH"
): Promise<AiAssistantResponse> {
  const endpoint = `${BASE_URL}/ai_assistant/generate`

  try {
    const token = await getEgovAiToken()
    const res = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ prompt, category }),
    })

    if (!res.ok) {
      throw new Error(`AI Assistant endpoint error: HTTP ${res.status}`)
    }

    const json = await res.json()
    return {
      data: json.data,
      session_id: json.session_id || crypto.randomUUID(),
      is_live_api: true,
      source: "egov_live",
    }
  } catch (err) {
    console.warn("[eGov AI] Live AI Assistant call unreachable, trying secondary AI fallback...", err)

    // Try secondary Gemini fallback if available
    const geminiReply = await queryGeminiAssistant(prompt)
    if (geminiReply) {
      return {
        data: geminiReply,
        session_id: crypto.randomUUID(),
        is_live_api: false,
        source: "gemini_fallback",
      }
    }

    // Context-sensitive helpful fallback matching user query
    const lower = prompt.toLowerCase()
    let contextualAnswer = ""

    if (lower.includes("hotline") || lower.includes("number") || lower.includes("call") || lower.includes("contact")) {
      contextualAnswer = `Here are the official National & Local Disaster Emergency Hotlines:\n\n1. **National Emergency Hotline**: 911\n2. **NDRRMC Operational Command Center**: (02) 8911-1406 / (02) 8912-2665\n3. **Philippine Red Cross Emergency Services**: 143 / (02) 8790-2300\n4. **PCG (Philippine Coast Guard)**: 0917-724-3682\n5. **Local MDRRMO / Barangay Command**: Access check-in queue or contact your local Barangay Health Worker.`
    } else if (lower.includes("typhoon") || lower.includes("storm") || lower.includes("signal") || lower.includes("flood")) {
      contextualAnswer = `For active storm warnings or typhoon alerts:\n\n1. Charge all mobile devices, power banks, and emergency flashlights.\n2. Keep your eGovPH Mobile ID and physical emergency bag accessible.\n3. Complete your **HANDA Household Check-in** in the app to notify your Barangay of your location and critical needs (food, water, medicine, shelter).\n4. Evacuate immediately if local authorities issue forced evacuation orders.`
    } else if (lower.includes("tin") || lower.includes("id") || lower.includes("government") || lower.includes("service") || lower.includes("everify")) {
      contextualAnswer = `To access government services & Digital IDs via eGovPH Super App:\n\n1. Log into your verified eGovPH Account.\n2. Navigate to **Mobile ID Wallet** to view Digital National ID, BIR Digital TIN ID, and PhilHealth ID.\n3. Use HANDA Disaster Portal to auto-verify your residency using your linked eGovPH account.`
    } else if (
      lower.includes("emergency aid") ||
      lower.includes("relief") ||
      lower.includes("assistance") ||
      lower.includes("evacuation")
    ) {
      contextualAnswer = `For HANDA emergency assistance, you can request support such as:\n\n1. **Food and clean water** for your household\n2. **Temporary shelter or evacuation support** if your home is unsafe\n3. **Medicine or first aid** for urgent medical needs\n4. **Rescue or transport assistance** if someone is trapped, injured, or unable to travel\n5. **Barangay follow-up** by completing your HANDA check-in so responders can prioritize your case\n\nIf the situation is life-threatening, call **911** immediately.`
    } else {
      contextualAnswer = `Regarding your inquiry **"${prompt}"**:\n\n1. **Disaster Assistance**: Complete your active Disaster Needs Check-in inside HANDA so your Barangay Command Center can prioritize relief distribution.\n2. **Emergency Hotlines**: Call **911** for immediate medical/fire rescue or 143 for Red Cross.\n3. **Official Updates**: Monitor local PAGASA typhoon bulletins and your Barangay Command Center announcements.`
    }

    return {
      data: contextualAnswer,
      session_id: crypto.randomUUID(),
      is_live_api: false,
      source: "local_fallback",
    }
  }
}

/**
 * Get remaining token credit balance
 */
export async function getCreditBalance(): Promise<CreditBalanceResponse> {
  const endpoint = `${BASE_URL}/credits`

  try {
    const token = await getEgovAiToken()
    const res = await fetch(endpoint, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`,
      },
    })

    if (!res.ok) {
      throw new Error(`Credits endpoint error: HTTP ${res.status}`)
    }

    const json = await res.json()
    return {
      ...json,
      is_live_api: true,
    }
  } catch (err) {
    console.warn("[eGov AI] Credits check failed, returning mock balance:", err)
    return {
      credits_total: 200,
      credits_used: 15,
      credits_remaining: 185,
      is_live_api: false,
    }
  }
}
