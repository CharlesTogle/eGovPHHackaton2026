### Task 1: Install vitest + write shared types + HouseholdMatcher with tests

**Files:**
- Create: `src/lib/types.ts`
- Create: `src/lib/matcher.ts`
- Create: `src/__tests__/matcher.test.ts`
- Modify: `package.json` (add vitest)
- Modify: `tsconfig.app.json` (exclude tests from app build)
- Create: `vitest.config.ts`

**Interfaces:**
- Produces: `HouseholdMatcher.match(resident, members, households) → { kind: "match"; householdId: string } | { kind: "candidates"; candidates: Household[] }`
- Produces: shared types `Campaign`, `CampaignQuestion`, `Household`, `HouseholdMember`, `CheckIn`, `CheckInAnswer`, `CampaignStatus`, `CheckInStatus`

- [ ] **Step 1: Install vitest**

Run:
```bash
pnpm add -D vitest
```

- [ ] **Step 2: Create vitest.config.ts**

```ts
import { defineConfig } from "vitest/config"
import path from "path"

export default defineConfig({
  test: {
    include: ["src/__tests__/**/*.test.ts"],
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
})
```

- [ ] **Step 3: Exclude tests from app TypeScript build**

In `tsconfig.app.json`, add to the existing object (after `"include": ["src"]`):
```json
"exclude": ["src/__tests__"]
```

- [ ] **Step 4: Create shared types**

Create `src/lib/types.ts`:
```ts
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
```

- [ ] **Step 5: Write failing matcher tests**

Create `src/__tests__/matcher.test.ts`:
```ts
import { describe, it, expect } from "vitest"
import { matchHousehold } from "@/lib/matcher"
import type { HouseholdMember, Household, ResidentInfo } from "@/lib/types"

const households: Household[] = [
  { id: "hh-1", barangay_code: "0105503021", household_head_name: "Santos Household", address: "Blk 4", member_count: 4 },
  { id: "hh-2", barangay_code: "0105503021", household_head_name: "Reyes Household", address: "Blk 5", member_count: 3 },
  { id: "hh-3", barangay_code: "0105503021", household_head_name: "Cruz Household", address: "Blk 6", member_count: 5 },
]

const members: HouseholdMember[] = [
  { id: "m-1", household_id: "hh-1", first_name: "MARIA", last_name: "SANTOS" },
  { id: "m-2", household_id: "hh-1", first_name: "JUAN", last_name: "SANTOS" },
  { id: "m-3", household_id: "hh-2", first_name: "PEDRO", last_name: "REYES" },
  { id: "m-4", household_id: "hh-2", first_name: "ROSA", last_name: "REYES" },
  { id: "m-5", household_id: "hh-3", first_name: "JOSE", last_name: "CRUZ" },
]

describe("matchHousehold", () => {
  it("returns match when exactly one member matches by last_name + first_name (case-insensitive)", () => {
    const resident: ResidentInfo = { first_name: "maria", last_name: "santos", barangay_code: "0105503021" }
    const result = matchHousehold(resident, members, households)
    expect(result).toEqual({ kind: "match", householdId: "hh-1" })
  })

  it("returns match for exact uppercase match", () => {
    const resident: ResidentInfo = { first_name: "PEDRO", last_name: "REYES", barangay_code: "0105503021" }
    const result = matchHousehold(resident, members, households)
    expect(result).toEqual({ kind: "match", householdId: "hh-2" })
  })

  it("returns candidates when no member matches", () => {
    const resident: ResidentInfo = { first_name: "UNKNOWN", last_name: "PERSON", barangay_code: "0105503021" }
    const result = matchHousehold(resident, members, households)
    expect(result).toEqual({ kind: "candidates", candidates: households })
  })

  it("returns candidates when multiple members match (same last_name, different households)", () => {
    const extraMembers: HouseholdMember[] = [
      ...members,
      { id: "m-6", household_id: "hh-3", first_name: "MARIA", last_name: "CRUZ" },
    ]
    const resident: ResidentInfo = { first_name: "MARIA", last_name: "CRUZ", barangay_code: "0105503021" }
    const result = matchHousehold(resident, extraMembers, households)
    expect(result.kind).toBe("candidates")
    if (result.kind === "candidates") {
      expect(result.candidates.length).toBe(1)
      expect(result.candidates[0].id).toBe("hh-3")
    }
  })

  it("returns candidates when same name appears in multiple households", () => {
    const ambiguousMembers: HouseholdMember[] = [
      { id: "m-10", household_id: "hh-1", first_name: "MARIA", last_name: "SANTOS" },
      { id: "m-11", household_id: "hh-2", first_name: "MARIA", last_name: "SANTOS" },
    ]
    const resident: ResidentInfo = { first_name: "MARIA", last_name: "SANTOS", barangay_code: "0105503021" }
    const result = matchHousehold(resident, ambiguousMembers, households)
    expect(result.kind).toBe("candidates")
  })

  it("filters members by barangay_code via household filter", () => {
    const resident: ResidentInfo = { first_name: "maria", last_name: "santos", barangay_code: "9999999999" }
    const result = matchHousehold(resident, members, households)
    expect(result).toEqual({ kind: "candidates", candidates: [] })
  })
})
```

- [ ] **Step 6: Run tests to verify they fail**

Run: `pnpm vitest run`
Expected: FAIL — `Cannot find module '@/lib/matcher'`

- [ ] **Step 7: Implement matcher**

Create `src/lib/matcher.ts`:
```ts
import type { Household, HouseholdMember, ResidentInfo } from "./types"

export type MatchResult =
  | { kind: "match"; householdId: string }
  | { kind: "candidates"; candidates: Household[] }

export function matchHousehold(
  resident: ResidentInfo,
  members: HouseholdMember[],
  households: Household[]
): MatchResult {
  const barangayHouseholds = households.filter((h) => h.barangay_code === resident.barangay_code)
  const barangayHouseholdIds = new Set(barangayHouseholds.map((h) => h.id))

  const barangayMembers = members.filter((m) => barangayHouseholdIds.has(m.household_id))

  const matchingMembers = barangayMembers.filter(
    (m) =>
      m.last_name.toUpperCase() === resident.last_name.toUpperCase() &&
      m.first_name.toUpperCase() === resident.first_name.toUpperCase()
  )

  const matchedHouseholdIds = new Set(matchingMembers.map((m) => m.household_id))

  if (matchedHouseholdIds.size === 1) {
    return { kind: "match", householdId: matchedHouseholdIds.values().next().value! }
  }

  if (matchedHouseholdIds.size > 1) {
    const candidates = barangayHouseholds.filter((h) => matchedHouseholdIds.has(h.id))
    return { kind: "candidates", candidates }
  }

  if (matchedHouseholdIds.size === 0) {
    return { kind: "candidates", candidates: barangayHouseholds }
  }

  return { kind: "candidates", candidates: barangayHouseholds }
}
```

- [ ] **Step 8: Run tests to verify they pass**

Run: `pnpm vitest run`
Expected: All 6 tests PASS

- [ ] **Step 9: Commit**

```bash
git add src/lib/types.ts src/lib/matcher.ts src/__tests__/matcher.test.ts vitest.config.ts package.json pnpm-lock.yaml tsconfig.app.json
git commit -m "feat: add shared types, HouseholdMatcher, and vitest tests"
```
