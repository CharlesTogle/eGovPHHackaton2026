### Task 2: DashboardAggregator with tests

**Files:**
- Create: `src/lib/aggregator.ts`
- Create: `src/__tests__/aggregator.test.ts`

**Interfaces:**
- Consumes: types from `src/lib/types.ts`
- Produces: `aggregate(checkIns, answers, questions, households) → DashboardData`
- Produces: `filterAffected(rows, filters) → AffectedRow[]`

- [ ] **Step 1: Write failing aggregator tests**

Create `src/__tests__/aggregator.test.ts`:
```ts
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
    expect(result.affected[0].needs).toEqual(["shelter", "food_water"])
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
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `pnpm vitest run`
Expected: FAIL — `Cannot find module '@/lib/aggregator'`

- [ ] **Step 3: Implement aggregator**

Create `src/lib/aggregator.ts`:
```ts
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
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `pnpm vitest run`
Expected: All 8 tests PASS

- [ ] **Step 5: Commit**

```bash
git add src/lib/aggregator.ts src/__tests__/aggregator.test.ts
git commit -m "feat: add DashboardAggregator with vitest tests"
```
