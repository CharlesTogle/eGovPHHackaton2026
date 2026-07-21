import type { CheckIn, CheckInAnswer, CampaignQuestion, Household, NeedCategory } from "./types"

export interface AffectedRow {
  checkInId: string
  household: Household
  needs: NeedCategory[]
  status: CheckIn["status"]
}

export interface DashboardData {
  totalAffected: number
  byNeedType: Record<NeedCategory, number>
  byStatus: Record<CheckIn["status"], number>
  affected: AffectedRow[]
  nonRespondents: Household[]
}

export function aggregate(
  checkIns: CheckIn[],
  answers: CheckInAnswer[],
  questions: CampaignQuestion[],
  households: Household[]
): DashboardData {
  const householdById = new Map(households.map((h) => [h.id, h]))

  const checkInByHousehold = new Map<string, CheckIn>()
  for (const ci of checkIns) {
    if (!checkInByHousehold.has(ci.household_id)) {
      checkInByHousehold.set(ci.household_id, ci)
    }
  }

  const answersByCheckIn = new Map<string, CheckInAnswer[]>()
  for (const a of answers) {
    const list = answersByCheckIn.get(a.check_in_id) ?? []
    list.push(a)
    answersByCheckIn.set(a.check_in_id, list)
  }

  const questionById = new Map(questions.map((q) => [q.id, q]))

  const byNeedType: Record<NeedCategory, number> = { shelter: 0, medical: 0, food_water: 0 }
  const byStatus: Record<CheckIn["status"], number> = { unresolved: 0, visited: 0, resolved: 0 }
  const affected: AffectedRow[] = []
  const checkedInHouseholdIds = new Set<string>()

  for (const [householdId, ci] of checkInByHousehold) {
    const hh = householdById.get(householdId)
    if (!hh) continue

    checkedInHouseholdIds.add(householdId)
    byStatus[ci.status]++

    const hhAnswers = answersByCheckIn.get(ci.id) ?? []
    const needs = new Set<NeedCategory>()
    for (const a of hhAnswers) {
      if (a.answer.toLowerCase() === "yes") {
        const q = questionById.get(a.question_id)
        if (q) needs.add(q.need_category)
      }
    }

    for (const need of needs) {
      byNeedType[need]++
    }

    affected.push({
      checkInId: ci.id,
      household: hh,
      needs: Array.from(needs).sort(),
      status: ci.status,
    })
  }

  const nonRespondents = households.filter((h) => !checkedInHouseholdIds.has(h.id))

  return {
    totalAffected: affected.length,
    byNeedType,
    byStatus,
    affected,
    nonRespondents,
  }
}

export function filterAffected(
  rows: AffectedRow[],
  filters: { needType?: NeedCategory; status?: CheckIn["status"] }
): AffectedRow[] {
  return rows.filter((row) => {
    if (filters.needType && !row.needs.includes(filters.needType)) return false
    if (filters.status && row.status !== filters.status) return false
    return true
  })
}
