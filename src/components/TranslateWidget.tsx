import { useState } from "react"
import { translateText, type LanguageCode } from "@/lib/egov-ai-service"

interface TranslateWidgetProps {
  textToTranslate: string
  title?: string
}

const LANGUAGES: { code: LanguageCode; name: string }[] = [
  { code: "fil", name: "Filipino" },
]

export function TranslateWidget({ textToTranslate }: TranslateWidgetProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedLang] = useState<LanguageCode>("fil")
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
          <span>Translate alert to Filipino (eGov AI)</span>
        </button>
      ) : (
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 flex flex-col gap-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <span>eGov AI Alert Translator</span>
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
            <div className="text-xs border border-slate-300 rounded-lg px-2.5 py-1.5 bg-white font-medium text-slate-800">
              Filipino
            </div>
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
