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
