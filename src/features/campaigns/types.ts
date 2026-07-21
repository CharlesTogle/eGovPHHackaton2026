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
