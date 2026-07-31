Task 2 review package

Status: new untracked file additions for `src/components/TranslateWidget.tsx` and `src/components/CitizenHelpChat.tsx`

Added file snapshot: `src/components/TranslateWidget.tsx`

```tsx
import { useState } from "react"
import { translateText, type LanguageCode } from "@/lib/egov-ai-service"

interface TranslateWidgetProps {
  textToTranslate: string
  title?: string
}

const LANGUAGES: { code: LanguageCode; name: string }[] = [
  { code: "fil", name: "Filipino (Tagalog)" },
  { code: "ilo", name: "Ilocano" },
  { code: "ceb", name: "Cebuano / Bisaya" },
  { code: "hil", name: "Hiligaynon / Ilonggo" },
  { code: "war", name: "Waray" },
  { code: "pam", name: "Kapampangan" },
  { code: "pag", name: "Pangasinan" },
  { code: "bik", name: "Bikolano" },
  { code: "en", name: "English" },
]

export function TranslateWidget({ textToTranslate }: TranslateWidgetProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedLang, setSelectedLang] = useState<LanguageCode>("fil")
  const [translatedText, setTranslatedText] = useState<string | null>(null)
  const [statusLabel, setStatusLabel] = useState<string | null>(null)
  const [isTranslating, setIsTranslating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleTranslate() {
    setIsTranslating(true)
    setError(null)
    setTranslatedText(null)
    setStatusLabel(null)
    try {
      const res = await translateText(textToTranslate, selectedLang, "en")
      setTranslatedText(res.source === "unavailable" ? null : (res.translated_prompt || null))
      setStatusLabel(
        res.source === "egov_live"
          ? "Live eGov AI"
          : res.source === "unavailable"
            ? "Unavailable"
            : "Fallback"
      )
      setError(res.source === "unavailable" ? (res.error_message ?? "Live eGov AI translation unavailable.") : null)
    } catch (err) {
      setTranslatedText(null)
      setStatusLabel("Unavailable")
      setError(err instanceof Error ? err.message : "Translation failed")
    } finally {
      setIsTranslating(false)
    }
  }

  return (
    <div className="mt-3 pt-3 border-t border-slate-200/80">
      {!isOpen ? (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--blue-primary)] hover:text-[var(--blue-hover)] bg-blue-50 hover:bg-blue-100 border border-blue-200 px-3 py-1.5 rounded-lg transition-all"
        >
          <span>Translate notice to local dialect (eGov AI)</span>
        </button>
      ) : (
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 flex flex-col gap-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <span>eGov AI Dialect Translator</span>
              {statusLabel && (
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                  statusLabel === "Live eGov AI"
                    ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                    : statusLabel === "Unavailable"
                      ? "bg-slate-100 text-slate-700 border-slate-200"
                      : "bg-amber-50 text-amber-700 border-amber-200"
                }`}>
                  {statusLabel}
                </span>
              )}
            </span>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="text-xs text-slate-500 hover:text-slate-800"
            >
              Close
            </button>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={selectedLang}
              onChange={(e) => setSelectedLang(e.target.value as LanguageCode)}
              className="text-xs border border-slate-300 rounded-lg px-2.5 py-1.5 bg-white font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-[var(--blue-primary)]"
            >
              {LANGUAGES.map((lang) => (
                <option key={lang.code} value={lang.code}>
                  {lang.name}
                </option>
              ))}
            </select>

            <button
              type="button"
              onClick={handleTranslate}
              disabled={isTranslating}
              className="text-xs bg-[var(--blue-primary)] hover:bg-[var(--blue-hover)] active:bg-[var(--blue-deep)] text-white font-semibold px-3 py-1.5 rounded-lg transition-all disabled:opacity-50"
            >
              {isTranslating ? "Translating..." : "Translate"}
            </button>
          </div>

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

          {error && translatedText && <p className="text-xs text-red-600 font-medium">{error}</p>}
        </div>
      )}
    </div>
  )
}
```

Added file snapshot: `src/components/CitizenHelpChat.tsx`

```tsx
import { useState } from "react"
import { askAiAssistant } from "@/lib/egov-ai-service"

interface Message {
  id: string
  sender: "user" | "ai"
  text: string
  timestamp: string
  isLiveApi?: boolean
  source?: string
}

export function CitizenHelpChat() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      sender: "ai",
      text: "Hello! I am your **eGovPH Citizen Assistant**. How can I help you with disaster response procedures, eGov services, or emergency hotlines today?",
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    },
  ])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [lastSource, setLastSource] = useState<string | null>(null)

  async function handleSend() {
    if (!input.trim() || isLoading) return
    const userMsg: Message = {
      id: crypto.randomUUID(),
      sender: "user",
      text: input.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    }

    setMessages((prev) => [...prev, userMsg])
    setInput("")
    setIsLoading(true)

    try {
      const res = await askAiAssistant(userMsg.text, "PH")
      if (res.session_id) setSessionId(res.session_id)
      setLastSource(res.source ?? null)

      const aiMsg: Message = {
        id: crypto.randomUUID(),
        sender: "ai",
        text: res.data,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        isLiveApi: res.is_live_api,
        source: res.source,
      }
      setMessages((prev) => [...prev, aiMsg])
    } catch (err) {
      setLastSource("unavailable")
      const errorMsg: Message = {
        id: crypto.randomUUID(),
        sender: "ai",
        text: "Sorry, I encountered an issue fetching response from eGov AI services. Please try again or contact your local barangay office.",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        isLiveApi: false,
        source: "unavailable",
      }
      setMessages((prev) => [...prev, errorMsg])
    } finally {
      setIsLoading(false)
    }
  }

  function renderFormattedText(text: string) {
    const lines = text.split("\n")
    return lines.map((line, lIdx) => {
      const parts = line.split(/(\*\*.*?\*\*)/g)
      return (
        <p key={lIdx} className={lIdx > 0 ? "mt-1.5" : ""}>
          {parts.map((part, pIdx) => {
            if (part.startsWith("**") && part.endsWith("**")) {
              return <strong key={pIdx} className="font-bold text-slate-900">{part.slice(2, -2)}</strong>
            }
            return part
          })}
        </p>
      )
    })
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-[var(--blue-primary)] hover:bg-[var(--blue-hover)] active:bg-[var(--blue-deep)] text-white shadow-xl hover:shadow-2xl px-4 py-3 rounded-full font-semibold text-sm transition-all transform hover:scale-105"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
        <span>eGov AI Assistant</span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex justify-end animate-fade-in">
          <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col justify-between overflow-hidden">
            <div className="bg-white border-b border-slate-200 p-4 flex items-center justify-between shadow-xs">
              <div className="flex items-center gap-2.5">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-sm text-slate-900 leading-tight">eGovPH AI Assistant</h3>
                    {lastSource !== null && (
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
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">Citizen Help & Procedures AI</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="pill-btn ghost text-xs py-1 px-3"
              >
                Close
              </button>
            </div>

            <div className="flex-1 p-4 overflow-y-auto flex flex-col gap-3 bg-slate-50">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex flex-col max-w-[85%] ${
                    msg.sender === "user" ? "self-end items-end" : "self-start items-start"
                  }`}
                >
                  <div
                    className={`p-3 rounded-2xl text-xs leading-relaxed ${
                      msg.sender === "user"
                        ? "bg-[var(--blue-primary)] text-white rounded-br-none shadow-xs"
                        : "bg-white text-slate-900 border border-slate-200 rounded-bl-none shadow-xs"
                    }`}
                  >
                    {renderFormattedText(msg.text)}
                  </div>
                  <div className="flex items-center gap-1 mt-1 px-1">
                    <span className="text-[10px] text-slate-400">{msg.timestamp}</span>
                    {msg.sender === "ai" && msg.source && (
                      <span className="text-[9px] text-slate-400 font-mono">
                        ({msg.source === "egov_live"
                          ? "Live eGov AI"
                          : msg.source === "gemini_fallback" || msg.source === "local_fallback"
                            ? "Fallback Guidance"
                            : "Unavailable"})
                      </span>
                    )}
                  </div>
                </div>
              ))}

              {isLoading && (
                <div className="self-start flex items-center gap-2 bg-white border border-slate-200 p-3 rounded-2xl text-xs text-slate-500 shadow-xs">
                  <div className="w-4 h-4 border-2 border-[var(--blue-primary)] border-t-transparent rounded-full animate-spin" />
                  <span>Generating response with eGov AI...</span>
                </div>
              )}
            </div>

            {sessionId && (
              <div className="px-4 py-1.5 bg-slate-100 border-t border-slate-200 text-[10px] text-slate-500 font-mono text-center truncate">
                Session ID: {sessionId}
              </div>
            )}

            <div className="p-3 bg-white border-t border-slate-200 flex items-center gap-2">
              <div className="flex-1 flex flex-col gap-2">
                <div className="flex flex-wrap gap-1.5">
                  {[
                    "What emergency aid can I request?",
                    "What should I prepare before evacuation?",
                    "Who can I call now?",
                  ].map((prompt) => (
                    <button
                      key={prompt}
                      type="button"
                      onClick={() => setInput(prompt)}
                      className="rounded-full border border-blue-200 bg-blue-50 px-2.5 py-1 text-[10px] font-medium text-[var(--blue-primary)] transition-colors hover:bg-blue-100"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSend()}
                    placeholder="Ask eGov AI assistant a question..."
                    className="flex-1 text-xs px-3.5 py-2.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--blue-primary)] bg-slate-50"
                  />
                  <button
                    type="button"
                    onClick={handleSend}
                    disabled={!input.trim() || isLoading}
                    className="bg-[var(--blue-primary)] hover:bg-[var(--blue-hover)] disabled:opacity-50 text-white px-3.5 py-2.5 rounded-xl font-semibold text-xs transition-all shadow-xs"
                  >
                    Send
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
```
