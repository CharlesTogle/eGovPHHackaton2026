import { useState } from "react"
import type { AlertIngestionResult } from "./types"

type SmsSimulatorDrawerProps = {
  barangayCode: string | null
  onAlertProcessed: (result: AlertIngestionResult) => void | Promise<void>
}

function buildDemoResult(barangayCode: string | null): AlertIngestionResult {
  const createdAt = new Date().toISOString()
  const disasterDate = createdAt.slice(0, 10)

  return {
    alert: {
      id: crypto.randomUUID(),
      barangay_code: barangayCode ?? "0105503021",
      headline: "Tropical Cyclone Wind Signal No. 2",
      message: "Strong winds and heavy rainfall expected within the next 12 hours.",
      severity: "high",
      source: "PAGASA",
      campaign_id: null,
      created_at: createdAt,
    },
    threshold: { auto_draft: true },
    draft: {
      campaign_name: "Auto-Draft Typhoon Assessment",
      disaster_type: "Typhoon",
      disaster_date: disasterDate,
      questions: [
        {
          question_text: "Is your home heavily damaged or unsafe to occupy?",
          need_category: "Shelter",
        },
        {
          question_text: "Does your household need food or clean drinking water?",
          need_category: "Food or water",
        },
        {
          question_text: "Does anyone in your household need medical attention?",
          need_category: "Medical",
        },
      ],
    },
  }
}

export function SmsSimulatorDrawer({ barangayCode, onAlertProcessed }: SmsSimulatorDrawerProps) {
  const [submitting, setSubmitting] = useState(false)

  async function handleSimulate() {
    setSubmitting(true)
    try {
      await onAlertProcessed(buildDemoResult(barangayCode))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="section-card mb-4 p-4 flex items-center justify-between gap-3">
      <div>
        <p className="resident-mobile-eyebrow">Alert Simulator</p>
        <strong>Simulate a PAGASA alert</strong>
      </div>
      <button type="button" className="pill-btn ghost" onClick={handleSimulate} disabled={submitting}>
        {submitting ? "Simulating..." : "Trigger Alert"}
      </button>
    </div>
  )
}

export type { Alert, AlertIngestionResult } from "./types"
