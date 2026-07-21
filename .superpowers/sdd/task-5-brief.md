### Task 5: Campaigns feature (types, service, builder, hooks)

**Files:**
- Create: `src/features/campaigns/types.ts`
- Create: `src/features/campaigns/service.ts`
- Create: `src/features/campaigns/useCampaigns.ts`
- Create: `src/features/campaigns/CampaignBuilder.tsx`

**Interfaces:**
- Consumes: `Campaign`, `CampaignQuestion`, `NeedCategory` from `src/lib/types.ts`
- Consumes: `supabase` from `src/lib/supabase.ts`
- Produces: `useCampaigns(barangayCode) → { campaigns, loading, refetch }`
- Produces: `CampaignBuilder` component (3-step inline form)

- [ ] **Step 1: Create campaigns feature types**

Create `src/features/campaigns/types.ts`:
```ts
import type { Campaign, CampaignQuestion, NeedCategory } from "@/lib/types"

export interface CampaignDraft {
  name: string
  disaster_type: string
  disaster_date: string
}

export interface QuestionDraft {
  question_text: string
  need_category: NeedCategory
}

export type { Campaign, CampaignQuestion }
```

- [ ] **Step 2: Create campaigns service**

Create `src/features/campaigns/service.ts`:
```ts
import { supabase } from "@/lib/supabase"
import type { Campaign, CampaignQuestion } from "@/lib/types"
import type { CampaignDraft, QuestionDraft } from "./types"

export async function listCampaigns(barangayCode: string): Promise<Campaign[]> {
  const { data, error } = await supabase
    .from("campaigns")
    .select("*")
    .eq("barangay_code", barangayCode)
    .order("created_at", { ascending: false })
  if (error) throw error
  return data as Campaign[]
}

export async function getCampaign(id: string): Promise<Campaign | null> {
  const { data, error } = await supabase.from("campaigns").select("*").eq("id", id).maybeSingle()
  if (error) throw error
  return data as Campaign | null
}

export async function getQuestions(campaignId: string): Promise<CampaignQuestion[]> {
  const { data, error } = await supabase
    .from("campaign_questions")
    .select("*")
    .eq("campaign_id", campaignId)
    .order("display_order")
  if (error) throw error
  return data as CampaignQuestion[]
}

export async function createCampaign(
  draft: CampaignDraft,
  createdBy: string,
  barangayCode: string
): Promise<Campaign> {
  const { data, error } = await supabase
    .from("campaigns")
    .insert({ ...draft, created_by: createdBy, barangay_code: barangayCode })
    .select()
    .single()
  if (error) throw error
  return data as Campaign
}

export async function addQuestions(
  campaignId: string,
  questions: QuestionDraft[]
): Promise<CampaignQuestion[]> {
  const rows = questions.map((q, i) => ({
    campaign_id: campaignId,
    question_text: q.question_text,
    need_category: q.need_category,
    display_order: i,
  }))
  const { data, error } = await supabase.from("campaign_questions").insert(rows).select()
  if (error) throw error
  return data as CampaignQuestion[]
}

export async function publishCampaign(id: string): Promise<void> {
  const { error } = await supabase.from("campaigns").update({ status: "active" }).eq("id", id)
  if (error) throw error
}

export async function closeCampaign(id: string): Promise<void> {
  const { error } = await supabase.from("campaigns").update({ status: "closed" }).eq("id", id)
  if (error) throw error
}
```

- [ ] **Step 3: Create useCampaigns hook**

Create `src/features/campaigns/useCampaigns.ts`:
```ts
import { useCallback, useEffect, useState } from "react"
import type { Campaign } from "@/lib/types"
import { listCampaigns } from "./service"

export function useCampaigns(barangayCode: string) {
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [loading, setLoading] = useState(true)

  const refetch = useCallback(async () => {
    setLoading(true)
    try {
      const data = await listCampaigns(barangayCode)
      setCampaigns(data)
    } finally {
      setLoading(false)
    }
  }, [barangayCode])

  useEffect(() => {
    refetch()
  }, [refetch])

  return { campaigns, loading, refetch }
}
```

- [ ] **Step 4: Create CampaignBuilder component**

Create `src/features/campaigns/CampaignBuilder.tsx`:
```tsx
import { useState } from "react"
import { useSession } from "@/features/auth"
import type { NeedCategory } from "@/lib/types"
import { createCampaign, addQuestions, publishCampaign } from "./service"
import type { QuestionDraft } from "./types"

const NEED_CATEGORIES: { value: NeedCategory; label: string }[] = [
  { value: "shelter", label: "Shelter" },
  { value: "medical", label: "Medical" },
  { value: "food_water", label: "Food / Water" },
]

interface Props {
  onDone: () => void
}

export function CampaignBuilder({ onDone }: Props) {
  const { session } = useSession()
  if (!session) return null

  const [step, setStep] = useState(1)
  const [name, setName] = useState("")
  const [disasterType, setDisasterType] = useState("")
  const [disasterDate, setDisasterDate] = useState("")
  const [questions, setQuestions] = useState<QuestionDraft[]>([
    { question_text: "", need_category: "shelter" },
  ])
  const [submitting, setSubmitting] = useState(false)

  function addQuestion() {
    setQuestions([...questions, { question_text: "", need_category: "shelter" }])
  }

  function updateQuestion(index: number, field: keyof QuestionDraft, value: string) {
    const next = [...questions]
    next[index] = { ...next[index], [field]: value }
    setQuestions(next)
  }

  function removeQuestion(index: number) {
    setQuestions(questions.filter((_, i) => i !== index))
  }

  async function handlePublish() {
    if (!session) return
    setSubmitting(true)
    try {
      const campaign = await createCampaign(
        { name, disaster_type: disasterType, disaster_date: disasterDate },
        session.profile.uniqid,
        session.profile.barangay_code
      )
      const validQuestions = questions.filter((q) => q.question_text.trim())
      if (validQuestions.length > 0) {
        await addQuestions(campaign.id, validQuestions)
      }
      await publishCampaign(campaign.id)
      onDone()
    } finally {
      setSubmitting(false)
    }
  }

  const cardStyle = {
    background: "var(--card)",
    borderRadius: "var(--egov-radius)",
    border: "1px solid var(--egov-line)",
  }

  return (
    <div className="p-6" style={cardStyle}>
      <h2 className="text-sm font-bold mb-4" style={{ color: "var(--egov-ink)" }}>
        Create Campaign — Step {step}/3
      </h2>

      {step === 1 && (
        <div className="flex flex-col gap-3">
          <label className="text-xs font-medium" style={{ color: "var(--egov-muted)" }}>
            Campaign Name
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Super Typhoon Odette"
              className="mt-1 w-full px-3 py-2 text-xs"
              style={{ border: "1px solid var(--egov-line)", borderRadius: "calc(var(--egov-radius) * 0.4)" }}
            />
          </label>
          <label className="text-xs font-medium" style={{ color: "var(--egov-muted)" }}>
            Disaster Type
            <input
              type="text"
              value={disasterType}
              onChange={(e) => setDisasterType(e.target.value)}
              placeholder="e.g. typhoon, fire, flood"
              className="mt-1 w-full px-3 py-2 text-xs"
              style={{ border: "1px solid var(--egov-line)", borderRadius: "calc(var(--egov-radius) * 0.4)" }}
            />
          </label>
          <label className="text-xs font-medium" style={{ color: "var(--egov-muted)" }}>
            Disaster Date
            <input
              type="date"
              value={disasterDate}
              onChange={(e) => setDisasterDate(e.target.value)}
              className="mt-1 w-full px-3 py-2 text-xs"
              style={{ border: "1px solid var(--egov-line)", borderRadius: "calc(var(--egov-radius) * 0.4)" }}
            />
          </label>
          <button
            type="button"
            onClick={() => setStep(2)}
            disabled={!name || !disasterType || !disasterDate}
            className="mt-2 px-4 py-2 text-xs font-medium text-white disabled:opacity-50"
            style={{ background: "var(--egov-blue)", borderRadius: "calc(var(--egov-radius) * 0.4)" }}
          >
            Next
          </button>
        </div>
      )}

      {step === 2 && (
        <div className="flex flex-col gap-3">
          {questions.map((q, i) => (
            <div key={i} className="flex gap-2 items-start">
              <div className="flex-1 flex flex-col gap-1">
                <input
                  type="text"
                  value={q.question_text}
                  onChange={(e) => updateQuestion(i, "question_text", e.target.value)}
                  placeholder="Question text"
                  className="w-full px-3 py-2 text-xs"
                  style={{ border: "1px solid var(--egov-line)", borderRadius: "calc(var(--egov-radius) * 0.4)" }}
                />
                <select
                  value={q.need_category}
                  onChange={(e) => updateQuestion(i, "need_category", e.target.value)}
                  className="w-full px-3 py-2 text-xs"
                  style={{ border: "1px solid var(--egov-line)", borderRadius: "calc(var(--egov-radius) * 0.4)" }}
                >
                  {NEED_CATEGORIES.map((nc) => (
                    <option key={nc.value} value={nc.value}>
                      {nc.label}
                    </option>
                  ))}
                </select>
              </div>
              {questions.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeQuestion(i)}
                  className="px-2 py-2 text-xs"
                  style={{ color: "var(--egov-red)" }}
                >
                  ✕
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            onClick={addQuestion}
            className="text-xs font-medium"
            style={{ color: "var(--egov-blue)" }}
          >
            + Add question
          </button>
          <div className="flex gap-2 mt-2">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="px-4 py-2 text-xs font-medium"
              style={{ border: "1px solid var(--egov-line)", borderRadius: "calc(var(--egov-radius) * 0.4)", color: "var(--egov-muted)" }}
            >
              Back
            </button>
            <button
              type="button"
              onClick={() => setStep(3)}
              disabled={questions.every((q) => !q.question_text.trim())}
              className="px-4 py-2 text-xs font-medium text-white disabled:opacity-50"
              style={{ background: "var(--egov-blue)", borderRadius: "calc(var(--egov-radius) * 0.4)" }}
            >
              Next
            </button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="flex flex-col gap-3">
          <div className="p-3" style={{ background: "var(--egov-soft)", borderRadius: "calc(var(--egov-radius) * 0.4)" }}>
            <p className="text-xs font-bold" style={{ color: "var(--egov-ink)" }}>{name}</p>
            <p className="text-xs" style={{ color: "var(--egov-muted)" }}>{disasterType} — {disasterDate}</p>
            <p className="text-xs mt-2" style={{ color: "var(--egov-muted)" }}>
              {questions.filter((q) => q.question_text.trim()).length} question(s)
            </p>
          </div>
          <div className="flex gap-2 mt-2">
            <button
              type="button"
              onClick={() => setStep(2)}
              className="px-4 py-2 text-xs font-medium"
              style={{ border: "1px solid var(--egov-line)", borderRadius: "calc(var(--egov-radius) * 0.4)", color: "var(--egov-muted)" }}
            >
              Back
            </button>
            <button
              type="button"
              onClick={handlePublish}
              disabled={submitting}
              className="px-4 py-2 text-xs font-medium text-white disabled:opacity-50"
              style={{ background: "var(--egov-blue)", borderRadius: "calc(var(--egov-radius) * 0.4)" }}
            >
              {submitting ? "Publishing..." : "Publish Campaign"}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 5: Commit**

```bash
git add src/features/campaigns/
git commit -m "feat: add campaigns feature (service, builder, hooks)"
```
