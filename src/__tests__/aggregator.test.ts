import { describe, it, expect } from "vitest"
import { aggregate, filterAffected } from "@/lib/aggregator"
import type { CheckIn, CheckInAnswer, CampaignQuestion, Household } from "@/lib/types"

const households: Household[] = [
  { id: "hh-1", barangay_code: "0105503021", household_head_name: "Santos", address: "Blk 4", member_count: 4 },
  { id: "hh-2", barangay_code: "0105503021", household_head_name: "Reyes", address: "Blk 5", member_count: 3 },
  { id: "hh-3", barangay_code: "0105503021", household_head_name: "Cruz", address: "Blk 6", member_count: 5 },
]

const questions: CampaignQuestion[] = [
  { id: "q-1", campaign_id: "c-1", question_text: "Home damaged?", need_category: "shelter", display_order: 0 },
  { id: "q-2", campaign_id: "c-1", question_text: "Need medical?", need_category: "medical", display_order: 1 },
  { id: "q-3", campaign_id: "c-1", question_text: "Need food?", need_category: "food_water", display_order: 2 },
]

describe("aggregate", () => {
  it("counts distinct affected households (dedup by household_id)", () => {
    const checkIns: CheckIn[] = [
      { id: "ci-1", campaign_id: "c-1", household_id: "hh-1", submitted_by: "u1", status: "unresolved", created_at: "", updated_at: "" },
      { id: "ci-2", campaign_id: "c-1", household_id: "hh-1", submitted_by: "u2", status: "unresolved", created_at: "", updated_at: "" },
      { id: "ci-3", campaign_id: "c-1", household_id: "hh-2", submitted_by: "u3", status: "unresolved", created_at: "", updated_at: "" },
    ]
    const answers: CheckInAnswer[] = []
    const result = aggregate(checkIns, answers, questions, households)
    expect(result.totalAffected).toBe(2)
  })

  it("computes need-type breakdown from answers", () => {
    const checkIns: CheckIn[] = [
      { id: "ci-1", campaign_id: "c-1", household_id: "hh-1", submitted_by: "u1", status: "unresolved", created_at: "", updated_at: "" },
    ]
    const answers: CheckInAnswer[] = [
      { id: "a-1", check_in_id: "ci-1", question_id: "q-1", answer: "yes" },
      { id: "a-2", check_in_id: "ci-1", question_id: "q-2", answer: "no" },
      { id: "a-3", check_in_id: "ci-1", question_id: "q-3", answer: "yes" },
    ]
    const result = aggregate(checkIns, answers, questions, households)
    expect(result.byNeedType).toEqual({ shelter: 1, medical: 0, food_water: 1 })
  })

  it("identifies non-respondents (households with no check-in)", () => {
    const checkIns: CheckIn[] = [
      { id: "ci-1", campaign_id: "c-1", household_id: "hh-1", submitted_by: "u1", status: "unresolved", created_at: "", updated_at: "" },
    ]
    const result = aggregate(checkIns, [], questions, households)
    expect(result.nonRespondents.length).toBe(2)
    expect(result.nonRespondents.map((h) => h.id)).toEqual(["hh-2", "hh-3"])
  })

  it("breaks down by status", () => {
    const checkIns: CheckIn[] = [
      { id: "ci-1", campaign_id: "c-1", household_id: "hh-1", submitted_by: "u1", status: "unresolved", created_at: "", updated_at: "" },
      { id: "ci-2", campaign_id: "c-1", household_id: "hh-2", submitted_by: "u2", status: "visited", created_at: "", updated_at: "" },
      { id: "ci-3", campaign_id: "c-1", household_id: "hh-3", submitted_by: "u3", status: "resolved", created_at: "", updated_at: "" },
    ]
    const result = aggregate(checkIns, [], questions, households)
    expect(result.byStatus).toEqual({ unresolved: 1, visited: 1, resolved: 1 })
  })

  it("builds affected rows with need badges", () => {
    const checkIns: CheckIn[] = [
      { id: "ci-1", campaign_id: "c-1", household_id: "hh-1", submitted_by: "u1", status: "unresolved", created_at: "", updated_at: "" },
    ]
    const answers: CheckInAnswer[] = [
      { id: "a-1", check_in_id: "ci-1", question_id: "q-1", answer: "yes" },
      { id: "a-2", check_in_id: "ci-1", question_id: "q-3", answer: "yes" },
    ]
    const result = aggregate(checkIns, answers, questions, households)
    expect(result.affected.length).toBe(1)
    expect(result.affected[0].needs).toEqual(["food_water", "shelter"])
    expect(result.affected[0].household.household_head_name).toBe("Santos")
  })
})

describe("filterAffected", () => {
  const affected = [
    { checkInId: "ci-1", household: households[0], needs: ["shelter"] as string[], status: "unresolved" as const },
    { checkInId: "ci-2", household: households[1], needs: ["medical"] as string[], status: "visited" as const },
    { checkInId: "ci-3", household: households[2], needs: ["shelter", "food_water"] as string[], status: "resolved" as const },
  ]

  it("filters by need type", () => {
    const result = filterAffected(affected, { needType: "shelter" })
    expect(result.length).toBe(2)
  })

  it("filters by status", () => {
    const result = filterAffected(affected, { status: "visited" })
    expect(result.length).toBe(1)
    expect(result[0].checkInId).toBe("ci-2")
  })

  it("returns all when no filters", () => {
    const result = filterAffected(affected, {})
    expect(result.length).toBe(3)
  })
})
