### Task 2: Make translation and chat UI show honest live/fallback/error states

**Files:**
- Modify: `src/components/TranslateWidget.tsx`
- Modify: `src/components/CitizenHelpChat.tsx`

**Interfaces:**
- Consumes:
  - `translateText(text, targetLang, sourceLang): Promise<TranslationResponse>`
  - `askAiAssistant(prompt, category): Promise<AiAssistantResponse>`
- Produces:
  - resident-facing badges and messages that distinguish live AI from fallback states

- [ ] **Step 1: Update the translate widget to handle unavailable translations**

```ts
const [statusLabel, setStatusLabel] = useState<string | null>(null)

const res = await translateText(textToTranslate, selectedLang, "en")
setTranslatedText(res.translated_prompt || null)
setIsLiveApi(res.is_live_api ?? false)
setStatusLabel(
  res.source === "egov_live"
    ? "Live eGov AI"
    : res.source === "unavailable"
      ? "Unavailable"
      : "Fallback"
)
setError(res.source === "unavailable" ? res.error_message ?? "Live eGov AI translation unavailable." : null)
```

- [ ] **Step 2: Replace fake success rendering with explicit unavailable messaging**

```tsx
{translatedText ? (
  <div className="bg-white p-3 rounded-lg border border-blue-200 text-xs text-slate-900 mt-1">
    <span className="text-[10px] uppercase font-bold text-[var(--blue-primary)] block mb-1">
      {LANGUAGES.find((l) => l.code === selectedLang)?.name} Translation:
    </span>
    <p className="italic font-medium leading-relaxed">{translatedText}</p>
  </div>
) : error ? (
  <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-amber-900 mt-1">
    Live eGov AI translation unavailable. {error}
  </div>
) : null}
```

- [ ] **Step 3: Update chat status badges to reflect `source` instead of only `is_live_api`**

```ts
const [lastSource, setLastSource] = useState<string | null>(null)

const res = await askAiAssistant(userMsg.text, "PH")
setLastSource(res.source ?? null)
```

```tsx
<span className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${
  lastSource === "egov_live"
    ? "bg-emerald-50 text-emerald-700 border-emerald-200"
    : lastSource === "gemini_fallback" || lastSource === "local_fallback"
      ? "bg-amber-50 text-amber-700 border-amber-200"
      : "bg-slate-100 text-slate-700 border-slate-200"
}`}>
  {lastSource === "egov_live"
    ? "Live eGov AI"
    : lastSource === "gemini_fallback" || lastSource === "local_fallback"
      ? "Fallback Guidance"
      : "Unavailable"}
</span>
```

- [ ] **Step 4: Add prompt chips for HANDA-specific questions**

```tsx
{[
  "What emergency aid can I request?",
  "What should I prepare before evacuation?",
  "Who can I call now?",
].map((prompt) => (
  <button key={prompt} type="button" onClick={() => setInput(prompt)} className="...">
    {prompt}
  </button>
))}
```

- [ ] **Step 5: Verify the UI still type-checks**

Run: `npm run build`

Expected: TypeScript completes or reports only unrelated existing repo issues outside this task.
