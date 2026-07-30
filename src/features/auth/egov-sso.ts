import type { DemoIdentity, EgovProfile } from "./types"

export type { DemoIdentity }

const BASE_URL = import.meta.env.VITE_EGOV_SSO_BASE_URL as string | undefined
const EXCHANGE_CODE_PATH = import.meta.env.VITE_EGOV_SSO_EXCHANGE_CODE_PATH as string | undefined
const PARTNER_CODE = import.meta.env.VITE_EGOV_SSO_PARTNER_CODE as string | undefined
const PARTNER_SECRET = import.meta.env.VITE_EGOV_SSO_PARTNER_SECRET as string | undefined
const USE_MOCK = import.meta.env.VITE_EGOV_SSO_USE_MOCK !== "false"

type ExchangeCodeResponse = { exchange_code?: string; data?: { exchange_code?: string } }
type AccessTokenResponse = { access_token?: string; data?: { access_token?: string } }
type SSOAuthenticationResponse = { data?: EgovProfile }

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
}

async function generateExchangeCode(): Promise<string> {
  if (!BASE_URL || !PARTNER_CODE) throw new Error("SSO base URL or partner code not configured")

  const endpoint = new URL(EXCHANGE_CODE_PATH ?? "/api/exchange-code", BASE_URL)
  endpoint.searchParams.set("partner_code", PARTNER_CODE)

  const getRes = await fetch(endpoint, { method: "GET" })
  if (getRes.ok) {
    const data = await getRes.json() as ExchangeCodeResponse
    const exchangeCode = data.exchange_code ?? data.data?.exchange_code
    if (exchangeCode) return exchangeCode
    throw new Error("Exchange code missing from response")
  }

  const postRes = await fetch(new URL(EXCHANGE_CODE_PATH ?? "/api/exchange-code", BASE_URL), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ partner_code: PARTNER_CODE }),
  })
  if (!postRes.ok) {
    throw new Error(`Exchange code failed: GET ${getRes.status}, POST ${postRes.status}`)
  }

  const postData = await postRes.json() as ExchangeCodeResponse
  const exchangeCode = postData.exchange_code ?? postData.data?.exchange_code
  if (!exchangeCode) throw new Error("Exchange code missing from response")
  return exchangeCode
}

async function generateAccessToken(exchangeCode: string): Promise<string> {
  if (!BASE_URL || !PARTNER_CODE || !PARTNER_SECRET) throw new Error("SSO credentials not configured")
  const res = await fetch(`${BASE_URL}/api/token`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      exchange_code: exchangeCode,
      scope: "SSO_AUTHENTICATION",
      partner_code: PARTNER_CODE,
      partner_secret: PARTNER_SECRET,
    }),
  })
  if (!res.ok) throw new Error(`Token exchange failed: ${res.status}`)
  const data = await res.json() as AccessTokenResponse
  const accessToken = data.access_token ?? data.data?.access_token
  if (!accessToken) throw new Error("Access token missing from response")
  return accessToken
}

async function ssoAuthentication(accessToken: string): Promise<EgovProfile> {
  if (!BASE_URL) throw new Error("SSO base URL not configured")
  const res = await fetch(`${BASE_URL}/api/partner/sso_authentication`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
  })
  if (!res.ok) throw new Error(`SSO authentication failed: ${res.status}`)
  const json = await res.json() as SSOAuthenticationResponse
  if (!json.data) throw new Error("SSO profile missing from response")
  return json.data
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
  const exchangeCode = await generateExchangeCode()
  const accessToken = await generateAccessToken(exchangeCode)
  return ssoAuthentication(accessToken)
}

export { MOCK_PROFILES }
