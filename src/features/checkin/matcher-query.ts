import { supabase } from "@/lib/supabase"
import type { Household, HouseholdMember } from "@/lib/types"
import { matchHousehold, type MatchResult } from "@/lib/matcher"

export async function fetchHouseholdsAndMembers(
  barangayCode: string
): Promise<{ households: Household[]; members: HouseholdMember[] }> {
  const [{ data: hhData, error: hhError }, { data: memData, error: memError }] = await Promise.all([
    supabase.from("households").select("*").eq("barangay_code", barangayCode),
    supabase.from("household_members").select("*"),
  ])
  if (hhError) throw hhError
  if (memError) throw memError
  return { households: (hhData ?? []) as Household[], members: (memData ?? []) as HouseholdMember[] }
}

export async function matchResidentToHousehold(
  firstName: string,
  lastName: string,
  barangayCode: string
): Promise<MatchResult> {
  const { households, members } = await fetchHouseholdsAndMembers(barangayCode)
  return matchHousehold({ first_name: firstName, last_name: lastName, barangay_code: barangayCode }, members, households)
}
