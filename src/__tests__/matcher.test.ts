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
      { id: "m-6", household_id: "hh-2", first_name: "MARIA", last_name: "CRUZ" },
      { id: "m-7", household_id: "hh-3", first_name: "MARIA", last_name: "CRUZ" },
    ]
    const resident: ResidentInfo = { first_name: "MARIA", last_name: "CRUZ", barangay_code: "0105503021" }
    const result = matchHousehold(resident, extraMembers, households)
    expect(result.kind).toBe("candidates")
    if (result.kind === "candidates") {
      expect(result.candidates.length).toBe(2)
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
