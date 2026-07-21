export type CampaignStatus = "draft" | "active" | "closed" | "archived"
export type CheckInStatus = "unresolved" | "visited" | "resolved"
export type NeedCategory = "shelter" | "medical" | "food_water"

export interface Campaign {
  id: string
  name: string
  disaster_type: string
  disaster_date: string
  status: CampaignStatus
  created_by: string
  barangay_code: string
  created_at: string
  updated_at: string
}

export interface CampaignQuestion {
  id: string
  campaign_id: string
  question_text: string
  need_category: NeedCategory
  display_order: number
}

export interface Household {
  id: string
  barangay_code: string
  household_head_name: string
  address: string
  member_count: number
}

export interface HouseholdMember {
  id: string
  household_id: string
  first_name: string
  last_name: string
}

export interface CheckIn {
  id: string
  campaign_id: string
  household_id: string
  submitted_by: string
  status: CheckInStatus
  created_at: string
  updated_at: string
}

export interface CheckInAnswer {
  id: string
  check_in_id: string
  question_id: string
  answer: string
}

export interface ResidentInfo {
  first_name: string
  last_name: string
  barangay_code: string
}
