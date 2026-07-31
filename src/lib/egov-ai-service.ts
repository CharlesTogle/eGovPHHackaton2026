import { supabase } from "./supabase"

/**
 * eGov AI API Service Layer
 *
 * Provides typed methods for eGov Hackathon AI services:
 * - Access Token Generation
 * - Translator Endpoint
 * - AI Assistant Endpoint
 * - Token Credits Endpoint
 *
 * Uses the Supabase `egov` Edge Function for all live eGov and Gemini access.
 */

function requireSupabase() {
  if (!supabase) throw new Error("Supabase client not configured")
  return supabase
}

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
 * Translate text between supported languages
 */
export async function translateText(
  prompt: string,
  targetLang: LanguageCode | string = "fil",
  sourceLang: LanguageCode | string = "en"
): Promise<TranslationResponse> {
  const { data, error } = await requireSupabase().functions.invoke("egov", {
    body: { action: "translate", payload: { prompt, targetLang, sourceLang } },
  })
  if (error) throw error
  return data as TranslationResponse
}

/**
 * Ask eGov AI Assistant a natural language question
 */
export async function askAiAssistant(
  prompt: string,
  category: string = "PH"
): Promise<AiAssistantResponse> {
  const { data, error } = await requireSupabase().functions.invoke("egov", {
    body: { action: "assistant", payload: { prompt, category } },
  })
  if (error) throw error
  return data as AiAssistantResponse
}

/**
 * Get remaining token credit balance
 */
export async function getCreditBalance(): Promise<CreditBalanceResponse> {
  const { data, error } = await requireSupabase().functions.invoke("egov", {
    body: { action: "credits" },
  })
  if (error) throw error
  return data as CreditBalanceResponse
}
