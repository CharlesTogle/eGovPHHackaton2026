### Task 1: Normalize eGov AI service result metadata

**Files:**
- Modify: `src/lib/egov-ai-service.ts`

**Interfaces:**
- Consumes: existing `fetch` calls to token, translator, assistant, and credits endpoints
- Produces:
  - `type AiResponseSource = "egov_live" | "gemini_fallback" | "local_fallback" | "unavailable"`
  - `interface TranslationResponse { ...; is_live_api?: boolean; source?: AiResponseSource; error_message?: string }`
  - `interface AiAssistantResponse { data: string; session_id: string; is_live_api?: boolean; source?: AiResponseSource; error_message?: string }`

- [ ] **Step 1: Update the service interfaces to carry source metadata**

```ts
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
```

- [ ] **Step 2: Make live translator responses explicit and fallback responses honest**

```ts
return {
  ...data,
  is_live_api: true,
  source: "egov_live",
}
```

```ts
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
```

- [ ] **Step 3: Make assistant fallback sources explicit**

```ts
if (geminiReply) {
  return {
    data: geminiReply,
    session_id: crypto.randomUUID(),
    is_live_api: false,
    source: "gemini_fallback",
  }
}

return {
  data: contextualAnswer,
  session_id: crypto.randomUUID(),
  is_live_api: false,
  source: "local_fallback",
}
```

- [ ] **Step 4: Strengthen the local emergency-aid fallback copy**

```ts
if (
  lower.includes("emergency aid") ||
  lower.includes("relief") ||
  lower.includes("assistance") ||
  lower.includes("evacuation")
) {
  contextualAnswer = `For HANDA emergency assistance, you can request support such as:\n\n1. **Food and clean water** for your household\n2. **Temporary shelter or evacuation support** if your home is unsafe\n3. **Medicine or first aid** for urgent medical needs\n4. **Rescue or transport assistance** if someone is trapped, injured, or unable to travel\n5. **Barangay follow-up** by completing your HANDA check-in so responders can prioritize your case\n\nIf the situation is life-threatening, call **911** immediately.`
}
```

- [ ] **Step 5: Verify no existing callers break from the added optional fields**

Run: `npm run build`

Expected: TypeScript completes or reports only unrelated existing repo issues outside this task.
