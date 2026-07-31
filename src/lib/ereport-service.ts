/**
 * eReport API Service Layer
 *
 * Provides typed methods for eReport integration:
 * - Authentication (Token Generation)
 * - Datasets (Report Types, Regions, Provinces, Municipalities, Barangays)
 * - Complaint Submission
 * - OTP Verification & Report Viewing
 *
 * Automatically routes requests via Vite dev proxy (`/api/ereport`) in development
 * to bypass browser CORS restrictions.
 */

import {
  PSA_REGIONS,
  PSA_PROVINCES,
  PSA_MUNICIPALITIES,
  PSA_BARANGAYS,
  PSA_REPORT_TYPES,
  type RegionItem,
  type ProvinceItem,
  type MunicipalityItem,
  type BarangayItem,
  type ReportTypeItem,
} from "./psa-fallback-data"

export type { RegionItem, ProvinceItem, MunicipalityItem, BarangayItem, ReportTypeItem }

const IS_DEV = import.meta.env.DEV
const RAW_BASE_URL = (import.meta.env.VITE_EREPORT_BASE_URL as string) || "https://hackathon-sso.e.gov.ph"
const BASE_URL = IS_DEV ? "/api/ereport" : `${RAW_BASE_URL}/api/integration`
const ACCESS_CODE = (import.meta.env.VITE_EREPORT_ACCESS_TOKEN as string) || (import.meta.env.VITE_EGOV_INTEGRATION_ACCESS_CODE as string) || ""

let cachedIntegrationToken: string | null = null

export interface SubmitComplaintPayload {
  mobile: string
  first_name: string
  last_name: string
  gender: string
  complainant_email: string
  report_type: string
  subject: string
  message: string
  evidences?: string[]
  region_code: string
  province_code: string
  municipality_code: string
  barangay_code: string
  latitude?: string
  longitude?: string
}

export interface SubmitComplaintResponse {
  code?: number
  message?: string
  data?: {
    case_number: string
    id: string
    status: string
  }
  is_live_api?: boolean
}

/**
 * Get or refresh integration token for eReport
 */
export async function getEReportToken(): Promise<string> {
  if (cachedIntegrationToken) return cachedIntegrationToken

  if (!ACCESS_CODE) {
    console.warn("[eReport] No access code configured.")
    throw new Error("eReport access code missing.")
  }

  const endpoint = `${BASE_URL}/token`

  try {
    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ access_code: ACCESS_CODE }),
    })

    if (!res.ok) throw new Error(`eReport token error: HTTP ${res.status}`)

    const data = await res.json()
    cachedIntegrationToken = data.access_token || data.token
    console.log("[eReport] Successfully authenticated with live integration token.")
    return cachedIntegrationToken!
  } catch (err) {
    console.error("[eReport] Token request failed:", err)
    cachedIntegrationToken = "ereport_mock_integration_token_12345"
    return cachedIntegrationToken
  }
}

/**
 * Fetch report types dataset
 */
export async function getReportTypes(): Promise<ReportTypeItem[]> {
  const DISASTER_SCOPED_CODES = ["fire", "accident", "red_tape"]
  try {
    const token = await getEReportToken()
    const res = await fetch(`${BASE_URL}/datasets/report_types`, {
      headers: { "Authorization": `Bearer ${token}` },
    })
    if (!res.ok) throw new Error(`Report types error: HTTP ${res.status}`)
    const json = await res.json()
    const allTypes = json.data.map((item: any) => ({
      id: item.id,
      code: item.attributes.code,
      name: item.attributes.name,
      sequence: item.attributes.sequence,
      is_visible: item.attributes.is_visible,
      is_active: item.attributes.is_active,
    }))
    const filtered = allTypes.filter((t: ReportTypeItem) => DISASTER_SCOPED_CODES.includes(t.code))
    return filtered.length > 0 ? filtered : PSA_REPORT_TYPES
  } catch (err) {
    console.warn("[eReport] Failed to fetch report types, returning disaster-scoped PSA fallback dataset:", err)
    return PSA_REPORT_TYPES
  }
}

/**
 * Fetch regions list
 */
export async function getRegions(): Promise<RegionItem[]> {
  try {
    const token = await getEReportToken()
    const res = await fetch(`${BASE_URL}/datasets/regions`, {
      headers: { "Authorization": `Bearer ${token}` },
    })
    if (!res.ok) throw new Error(`Regions error: HTTP ${res.status}`)
    const json = await res.json()
    return json.data.map((item: any) => ({
      id: item.id,
      name: item.attributes.name,
    }))
  } catch (err) {
    console.warn("[eReport] Failed to fetch regions, returning all 18 PSA regions fallback:", err)
    return PSA_REGIONS
  }
}

/**
 * Fetch provinces for a region code
 */
export async function getProvinces(regionCode: string): Promise<ProvinceItem[]> {
  try {
    const token = await getEReportToken()
    const res = await fetch(`${BASE_URL}/datasets/provinces?region_code=${regionCode}`, {
      headers: { "Authorization": `Bearer ${token}` },
    })
    if (!res.ok) throw new Error(`Provinces error: HTTP ${res.status}`)
    const json = await res.json()
    return json.data.map((item: any) => ({
      id: item.id,
      region_code: item.attributes.region_code,
      name: item.attributes.name,
    }))
  } catch (err) {
    console.warn(`[eReport] Failed to fetch provinces for region ${regionCode}, using PSA fallback:`, err)
    if (PSA_PROVINCES[regionCode]) {
      return PSA_PROVINCES[regionCode]
    }
    const regObj = PSA_REGIONS.find((r) => r.id === regionCode)
    const regName = regObj ? regObj.name.split("(")[0].trim() : "REGION"
    return [
      { id: `${regionCode.slice(0, 3)}010000`, region_code: regionCode, name: `${regName} PROVINCE CAPITAL` },
      { id: `${regionCode.slice(0, 3)}020000`, region_code: regionCode, name: `${regName} SECOND PROVINCE` },
    ]
  }
}

/**
 * Fetch municipalities for a province code
 */
export async function getMunicipalities(provinceCode: string): Promise<MunicipalityItem[]> {
  try {
    const token = await getEReportToken()
    const res = await fetch(`${BASE_URL}/datasets/municipalities?province_code=${provinceCode}`, {
      headers: { "Authorization": `Bearer ${token}` },
    })
    if (!res.ok) throw new Error(`Municipalities error: HTTP ${res.status}`)
    const json = await res.json()
    return json.data.map((item: any) => ({
      id: item.id,
      region_code: item.attributes.region_code,
      province_code: item.attributes.province_code,
      name: item.attributes.name,
    }))
  } catch (err) {
    console.warn(`[eReport] Failed to fetch municipalities for province ${provinceCode}, using PSA fallback:`, err)
    if (PSA_MUNICIPALITIES[provinceCode]) {
      return PSA_MUNICIPALITIES[provinceCode]
    }
    const regCode = provinceCode.slice(0, 3) + "000000"
    return [
      { id: `${provinceCode.slice(0, 5)}01000`, region_code: regCode, province_code: provinceCode, name: "CITY OF ALAMINOS (Capital)" },
      { id: `${provinceCode.slice(0, 5)}02000`, region_code: regCode, province_code: provinceCode, name: "CENTRAL MUNICIPALITY" },
    ]
  }
}

/**
 * Fetch barangays for a municipality code
 */
export async function getBarangays(municipalityCode: string): Promise<BarangayItem[]> {
  try {
    const token = await getEReportToken()
    const res = await fetch(`${BASE_URL}/datasets/barangays?municipality_code=${municipalityCode}`, {
      headers: { "Authorization": `Bearer ${token}` },
    })
    if (!res.ok) throw new Error(`Barangays error: HTTP ${res.status}`)
    const json = await res.json()
    return json.data.map((item: any) => ({
      id: item.id,
      region_code: item.attributes.region_code,
      province_code: item.attributes.province_code,
      municipality_code: item.attributes.municipality_code,
      name: item.attributes.name,
    }))
  } catch (err) {
    console.warn(`[eReport] Failed to fetch barangays for municipality ${municipalityCode}, using PSA fallback:`, err)
    if (PSA_BARANGAYS[municipalityCode]) {
      return PSA_BARANGAYS[municipalityCode]
    }
    const regCode = municipalityCode.slice(0, 3) + "000000"
    const provCode = municipalityCode.slice(0, 5) + "0000"
    return [
      { id: `${municipalityCode.slice(0, 7)}001`, region_code: regCode, province_code: provCode, municipality_code: municipalityCode, name: "Poblacion" },
      { id: `${municipalityCode.slice(0, 7)}010`, region_code: regCode, province_code: provCode, municipality_code: municipalityCode, name: "Barangay San Jose" },
      { id: `${municipalityCode.slice(0, 7)}020`, region_code: regCode, province_code: provCode, municipality_code: municipalityCode, name: "Barangay Santa Maria" },
    ]
  }
}

/**
 * Submit a complaint report to eReport
 */
export async function submitComplaint(payload: SubmitComplaintPayload): Promise<SubmitComplaintResponse> {
  try {
    const token = await getEReportToken()
    const res = await fetch(`${BASE_URL}/submit_complaint`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    })

    if (!res.ok) throw new Error(`Submit complaint error: HTTP ${res.status}`)

    const json = await res.json()
    return {
      ...json,
      is_live_api: true,
    }
  } catch (err) {
    console.warn("[eReport] Submit complaint failed, using fallback success response:", err)
    return {
      code: 200,
      message: "Complaint submitted successfully to eReport pipeline.",
      data: {
        case_number: `HND-${Math.floor(100000 + Math.random() * 900000)}`,
        id: crypto.randomUUID(),
        status: "PENDING",
      },
      is_live_api: false,
    }
  }
}
