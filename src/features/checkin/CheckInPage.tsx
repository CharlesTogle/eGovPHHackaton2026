import { useState } from "react"
import { useSession } from "@/features/auth"
import { useActiveCampaign } from "./useActiveCampaign"
import { matchResidentToHousehold } from "./matcher-query"
import { upsertCheckIn } from "./service"
import type { MatchResult } from "@/lib/matcher"
import type { Household } from "@/lib/types"

type FlowStep = "prompt" | "matching" | "select" | "questions" | "submitting" | "confirmed"

export function CheckInPage() {
  const { session, logout } = useSession()
  if (!session) return null

  const { campaign, questions, loading } = useActiveCampaign(session.profile.barangay_code)
  const [step, setStep] = useState<FlowStep>("prompt")
  const [matchResult, setMatchResult] = useState<MatchResult | null>(null)
  const [selectedHouseholdId, setSelectedHouseholdId] = useState<string | null>(null)
  const [answers, setAnswers] = useState<Record<string, string>>({})

  const cardStyle = {
    background: "var(--card)",
    borderRadius: "var(--egov-radius)",
    boxShadow: "0 18px 50px rgba(25, 57, 116, 0.08)",
    border: "1px solid rgba(255,255,255,0.78)",
  }

  async function handleYes() {
    setStep("matching")
    try {
      const result = await matchResidentToHousehold(
        session.profile.first_name,
        session.profile.last_name,
        session.profile.barangay_code
      )
      setMatchResult(result)
      if (result.kind === "match") {
        setSelectedHouseholdId(result.householdId)
        setStep("questions")
      } else {
        setStep("select")
      }
    } catch {
      setStep("prompt")
    }
  }

  async function handleSubmit() {
    if (!campaign || !selectedHouseholdId) return
    setStep("submitting")
    try {
      await upsertCheckIn({
        campaignId: campaign.id,
        householdId: selectedHouseholdId,
        submittedBy: session.profile.uniqid,
        answers: questions.map((q) => ({ questionId: q.id, answer: answers[q.id] ?? "no" })),
      })
      setStep("confirmed")
    } catch {
      setStep("questions")
    }
  }

  if (loading) {
    return (
      <div className="min-h-dvh flex items-center justify-center" style={{ background: "var(--egov-soft)" }}>
        <p className="text-xs" style={{ color: "var(--egov-muted)" }}>Loading...</p>
      </div>
    )
  }

  if (!campaign) {
    return (
      <div className="min-h-dvh flex flex-col items-center justify-center px-4" style={{ background: "var(--egov-soft)" }}>
        <div className="w-full max-w-sm p-8 text-center" style={cardStyle}>
          <img src="/egovph-logo.png" alt="eGovPH" className="w-32 mx-auto" />
          <p className="text-xs mt-4" style={{ color: "var(--egov-muted)" }}>
            No active campaign in your barangay.
          </p>
          <button type="button" onClick={logout} className="mt-4 text-xs" style={{ color: "var(--egov-muted)" }}>
            Sign out
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-dvh flex flex-col items-center justify-center px-4" style={{ background: "var(--egov-soft)" }}>
      <div className="w-full max-w-sm flex flex-col gap-4 p-8" style={cardStyle}>
        <img src="/egovph-logo.png" alt="eGovPH" className="w-32 mx-auto" />

        <div className="text-center">
          <h1 className="text-sm font-bold" style={{ color: "var(--egov-ink)" }}>
            Hi, {session.profile.first_name}
          </h1>
          <p className="text-xs mt-1" style={{ color: "var(--egov-muted)" }}>
            Barangay {session.profile.barangay}
          </p>
        </div>

        {step === "prompt" && (
          <div className="flex flex-col gap-3">
            <p className="text-xs text-center" style={{ color: "var(--egov-ink)" }}>
              Are you affected by <strong>{campaign.name}</strong>?
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleYes}
                className="flex-1 py-2.5 text-xs font-medium text-white"
                style={{ background: "var(--egov-blue)", borderRadius: "calc(var(--egov-radius) * 0.4)" }}
              >
                Yes
              </button>
              <button
                type="button"
                onClick={logout}
                className="flex-1 py-2.5 text-xs font-medium"
                style={{ border: "1px solid var(--egov-line)", borderRadius: "calc(var(--egov-radius) * 0.4)", color: "var(--egov-muted)" }}
              >
                No
              </button>
            </div>
          </div>
        )}

        {step === "matching" && (
          <p className="text-xs text-center" style={{ color: "var(--egov-muted)" }}>
            Matching your household...
          </p>
        )}

        {step === "select" && matchResult?.kind === "candidates" && (
          <div className="flex flex-col gap-2">
            <p className="text-xs" style={{ color: "var(--egov-muted)" }}>
              Select your household:
            </p>
            {matchResult.candidates.map((hh: Household) => (
              <label key={hh.id} className="flex items-center gap-2 p-2 cursor-pointer" style={{ border: "1px solid var(--egov-line)", borderRadius: "calc(var(--egov-radius) * 0.3)" }}>
                <input
                  type="radio"
                  name="household"
                  value={hh.id}
                  checked={selectedHouseholdId === hh.id}
                  onChange={() => setSelectedHouseholdId(hh.id)}
                />
                <div>
                  <p className="text-xs font-medium" style={{ color: "var(--egov-ink)" }}>{hh.household_head_name}</p>
                  <p className="text-xs" style={{ color: "var(--egov-muted)" }}>{hh.address}</p>
                </div>
              </label>
            ))}
            <button
              type="button"
              onClick={() => setStep("questions")}
              disabled={!selectedHouseholdId}
              className="mt-2 py-2.5 text-xs font-medium text-white disabled:opacity-50"
              style={{ background: "var(--egov-blue)", borderRadius: "calc(var(--egov-radius) * 0.4)" }}
            >
              Continue
            </button>
          </div>
        )}

        {step === "questions" && (
          <div className="flex flex-col gap-3">
            {questions.map((q) => (
              <div key={q.id} className="flex flex-col gap-1">
                <p className="text-xs font-medium" style={{ color: "var(--egov-ink)" }}>{q.question_text}</p>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setAnswers({ ...answers, [q.id]: "yes" })}
                    className="flex-1 py-2 text-xs font-medium"
                    style={{
                      background: answers[q.id] === "yes" ? "var(--egov-blue)" : "transparent",
                      color: answers[q.id] === "yes" ? "#fff" : "var(--egov-muted)",
                      border: "1px solid var(--egov-line)",
                      borderRadius: "calc(var(--egov-radius) * 0.3)",
                    }}
                  >
                    Yes
                  </button>
                  <button
                    type="button"
                    onClick={() => setAnswers({ ...answers, [q.id]: "no" })}
                    className="flex-1 py-2 text-xs font-medium"
                    style={{
                      background: answers[q.id] === "no" ? "var(--egov-muted)" : "transparent",
                      color: answers[q.id] === "no" ? "#fff" : "var(--egov-muted)",
                      border: "1px solid var(--egov-line)",
                      borderRadius: "calc(var(--egov-radius) * 0.3)",
                    }}
                  >
                    No
                  </button>
                </div>
              </div>
            ))}
            <button
              type="button"
              onClick={handleSubmit}
              className="mt-2 py-2.5 text-xs font-medium text-white"
              style={{ background: "var(--egov-blue)", borderRadius: "calc(var(--egov-radius) * 0.4)" }}
            >
              Submit
            </button>
          </div>
        )}

        {step === "submitting" && (
          <p className="text-xs text-center" style={{ color: "var(--egov-muted)" }}>
            Submitting...
          </p>
        )}

        {step === "confirmed" && (
          <div className="text-center">
            <p className="text-sm font-bold" style={{ color: "var(--egov-blue)" }}>
              Thank you!
            </p>
            <p className="text-xs mt-1" style={{ color: "var(--egov-muted)" }}>
              Your report has been submitted. The barangay has been notified.
            </p>
            <button
              type="button"
              onClick={logout}
              className="mt-4 py-2.5 text-xs font-medium"
              style={{ border: "1px solid var(--egov-line)", borderRadius: "calc(var(--egov-radius) * 0.4)", color: "var(--egov-muted)" }}
            >
              Sign out
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
