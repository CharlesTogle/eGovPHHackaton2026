export type Alert = {
  id: string
  barangay_code: string
  headline: string
  message: string
  severity: "low" | "medium" | "high"
  source: string
  campaign_id: string | null
  created_at: string
}

export type AlertDraftQuestion = {
  question_text: string
  need_category: string
}

export type AlertDraft = {
  campaign_name: string
  disaster_type: string
  disaster_date: string
  questions: AlertDraftQuestion[]
}

export type AlertIngestionResult = {
  alert: Alert
  threshold: { auto_draft: boolean }
  draft: AlertDraft | null
}
