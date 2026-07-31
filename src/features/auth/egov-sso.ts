import type { DemoIdentity, EgovProfile } from "./types"
import { supabase } from "@/lib/supabase"

export type { DemoIdentity }

const USE_MOCK = import.meta.env.VITE_EGOV_SSO_USE_MOCK !== "false"

const MOCK_PROFILES: Record<DemoIdentity, EgovProfile> = {
  josie: {
    uniqid: "MVPCBEUVCGPZR",
    email: "josie@yopmail.com",
    first_name: "JOSIE",
    middle_name: "SANTOS",
    last_name: "DELA CRUZ",
    suffix: null,
    mobile: "+639090000000",
    barangay: "POBLACION",
    barangay_code: "0105503021",
    municipality: "CITY OF ALAMINOS",
    municipality_code: "0105503000",
    province: "PANGASINAN",
    province_code: "0105500000",
    region: "REGION I (ILOCOS REGION)",
    region_code: "0100000000",
    photo: null,
  },
  alexis: {
    uniqid: "BRGY_ALEXIS001",
    email: "alexis.ramos@yopmail.com",
    first_name: "ALEXIS",
    middle_name: "NAVARRO",
    last_name: "RAMOS",
    suffix: null,
    mobile: "+639090000004",
    barangay: "POBLACION",
    barangay_code: "0105503021",
    municipality: "CITY OF ALAMINOS",
    municipality_code: "0105503000",
    province: "PANGASINAN",
    province_code: "0105500000",
    region: "REGION I (ILOCOS REGION)",
    region_code: "0100000000",
    photo: null,
  },
  maria: {
    uniqid: "RESIDENT_MARIA001",
    email: "maria@yopmail.com",
    first_name: "MARIA",
    middle_name: "REYES",
    last_name: "SANTOS",
    suffix: null,
    mobile: "+639090000001",
    barangay: "POBLACION",
    barangay_code: "0105503021",
    municipality: "CITY OF ALAMINOS",
    municipality_code: "0105503000",
    province: "PANGASINAN",
    province_code: "0105500000",
    region: "REGION I (ILOCOS REGION)",
    region_code: "0100000000",
    photo: null,
  },
  pedro: {
    uniqid: "RESIDENT_PEDRO002",
    email: "pedro@yopmail.com",
    first_name: "PEDRO",
    middle_name: "GARCIA",
    last_name: "REYES",
    suffix: null,
    mobile: "+639090000002",
    barangay: "POBLACION",
    barangay_code: "0105503021",
    municipality: "CITY OF ALAMINOS",
    municipality_code: "0105503000",
    province: "PANGASINAN",
    province_code: "0105500000",
    region: "REGION I (ILOCOS REGION)",
    region_code: "0100000000",
    photo: null,
  },
  dev: {
    uniqid: "DEV_CITYAPP_001",
    email: "dev@cityapp.ph",
    first_name: "DEV",
    middle_name: null,
    last_name: "USER",
    suffix: null,
    mobile: "+639090000005",
    barangay: "POBLACION",
    barangay_code: "0105503021",
    municipality: "CITY OF ALAMINOS",
    municipality_code: "0105503000",
    province: "PANGASINAN",
    province_code: "0105500000",
    region: "REGION I (ILOCOS REGION)",
    region_code: "0100000000",
    photo: null,
  },
  lgu: {
    uniqid: "LGU_ALAMINOS_001",
    email: "lgu.command@alaminos.gov.ph",
    first_name: "CITY",
    middle_name: null,
    last_name: "COMMAND",
    suffix: null,
    mobile: "+639090000006",
    barangay: "POBLACION",
    barangay_code: "0105503021",
    municipality: "CITY OF ALAMINOS",
    municipality_code: "0105503000",
    province: "PANGASINAN",
    province_code: "0105500000",
    region: "REGION I (ILOCOS REGION)",
    region_code: "0100000000",
    photo: null,
  },
}

function requireSupabase() {
  if (!supabase) throw new Error("Supabase client not configured")
  return supabase
}

function getExchangeCodeFromUrl(): string | null {
  if (typeof window === "undefined") return null
  const params = new URLSearchParams(window.location.search)
  return params.get("exchange_code")
}

export async function runSSO(identity?: DemoIdentity): Promise<EgovProfile> {
  if (USE_MOCK) {
    await new Promise((r) => setTimeout(r, 600))
    const mockExchangeCode = crypto.randomUUID()
    const mockAccessToken = crypto.randomUUID()
    console.log("[SSO MOCK] exchange_code:", mockExchangeCode)
    console.log("[SSO MOCK] access_token:", mockAccessToken)
    return MOCK_PROFILES[identity ?? "josie"]
  }
  const exchangeCode = getExchangeCodeFromUrl()
  const { data, error } = await requireSupabase().functions.invoke("egov", {
    body: {
      action: "sso-profile",
      payload: exchangeCode ? { exchange_code: exchangeCode } : {},
    },
  })
  if (error) throw error
  return data as EgovProfile
}

export { MOCK_PROFILES }
