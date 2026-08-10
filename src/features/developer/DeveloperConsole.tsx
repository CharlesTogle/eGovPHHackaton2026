import { useState, useEffect } from "react"
import { Shell, type SidebarTab } from "@/components/Shell"
import { useSession } from "@/features/auth/session-context"
import { getCreditBalance, type CreditBalanceResponse } from "@/lib/egov-ai-service"
import {
  getRegions,
  getProvinces,
  getMunicipalities,
  getBarangays,
  getReportTypes,
  type RegionItem,
  type ProvinceItem,
  type MunicipalityItem,
  type BarangayItem,
  type ReportTypeItem,
} from "@/lib/ereport-service"

interface DevRecord {
  id: string
  uniqid: string
  name: string
  email: string
  organization: string
  barangay_code: string
}

interface ApiKey {
  id: string
  key: string
  barangay_code: string
  scope: "barangay" | "lgu"
  created_at: string
}

interface EndpointDoc {
  id: string
  title: string
  method: "GET" | "POST"
  path: string
  description: string
  curlExample: string
  responses: Array<{
    code: string
    description: string
    contentType: string
    example: string
  }>
}

const ENDPOINT_DOCS: EndpointDoc[] = [
  {
    id: "barangay",
    title: "Barangay Disaster Aggregate Endpoint",
    method: "GET",
    path: "/api/v1/barangay/summary",
    description: "Returns active campaign details, total affected count, unresolved count, and needs breakdown for the authorized barangay.",
    curlExample: `curl -X GET "https://hackathon-sso.e.gov.ph/api/v1/barangay/summary?barangay_code=0105503021" \\
  -H "Authorization: Bearer hnd_sk_live_9a8b7c6d5e4f3a2b1c0d9e8f"`,
    responses: [
      {
        code: "200",
        description: "Aggregate metrics",
        contentType: "application/json",
        example: `{
  "assessment_id": "a0000000-0000-0000-0000-000000000001",
  "affected_count": 12,
  "unresolved_count": 4,
  "needs_breakdown": {
    "shelter": 8,
    "food_water": 10,
    "medical": 3
  }
}`,
      },
    ],
  },
  {
    id: "translate",
    title: "eGov AI Dialect Translator Endpoint",
    method: "POST",
    path: "/api/v1/egov/integration/translator/generate",
    description: "Translates disaster warnings and evacuation notices into 8 Philippine regional dialects.",
    curlExample: `curl -X POST "https://hackathon-sso.e.gov.ph/api/v1/egov/integration/translator/generate" \\
  -H "Authorization: Bearer hnd_sk_live_9a8b7c6d5e4f3a2b1c0d9e8f" \\
  -H "Content-Type: application/json" \\
  -d '{"prompt": "Evacuate to high ground immediately", "source_lang": "en", "target_lang": "fil"}'`,
    responses: [
      {
        code: "200",
        description: "Translation payload",
        contentType: "application/json",
        example: `{
  "original_prompt": "Evacuate to high ground immediately",
  "source_lang": "en",
  "target_lang": "fil",
  "translated_prompt": "Lumikas agad sa mataas na lugar"
}`,
      },
    ],
  },
  {
    id: "ereport",
    title: "eReport Incident Submission Pipeline",
    method: "POST",
    path: "/api/integration/submit_complaint",
    description: "Logs calamity incidents and citizen relief requests directly into the national eReport pipeline.",
    curlExample: `curl -X POST "https://hackathon-sso.e.gov.ph/api/integration/submit_complaint" \\
  -H "Authorization: Bearer hnd_sk_live_9a8b7c6d5e4f3a2b1c0d9e8f" \\
  -H "Content-Type: application/json" \\
  -d '{"mobile":"639171234567","report_type":"fire","subject":"Flood Alert","region_code":"010000000"}'`,
    responses: [
      {
        code: "200",
        description: "Complaint logged",
        contentType: "application/json",
        example: `{
  "code": 200,
  "message": "Complaint submitted successfully to eReport pipeline.",
  "data": {
    "case_number": "HND-884920",
    "status": "PENDING"
  }
}`,
      },
    ],
  },
]

function generateCleanApiKey(prefix: "barangay" | "lgu" = "barangay"): string {
  const chars = "abcdef0123456789"
  let randomHex = ""
  for (let i = 0; i < 24; i++) {
    randomHex += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return `hnd_sk_live_${prefix}_${randomHex}`
}

function formatMaskedApiKey(key: string, isVisible: boolean): string {
  if (isVisible) return key
  if (key.length > 22) {
    return `${key.slice(0, 16)}••••••••••••${key.slice(-4)}`
  }
  return `${key.slice(0, 8)}••••••••••••`
}

export function DeveloperConsole() {
  const { session, logout } = useSession()
  const [activeTab, setActiveTab] = useState<SidebarTab>("dashboard")

  const [devRecord, setDevRecord] = useState<DevRecord | null>(null)
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([])
  const [visibleKeyIds, setVisibleKeyIds] = useState<Set<string>>(new Set())
  const [barangayName, setBarangayName] = useState<string>("")
  const [loading, setLoading] = useState(true)
  const [copiedKeyId, setCopiedKeyId] = useState<string | null>(null)
  const [selectedEndpointId, setSelectedEndpointId] = useState<string>("barangay")
  const [credits, setCredits] = useState<CreditBalanceResponse | null>(null)

  // eReport Datasets Tab State
  const [regions, setRegions] = useState<RegionItem[]>([])
  const [provinces, setProvinces] = useState<ProvinceItem[]>([])
  const [municipalities, setMunicipalities] = useState<MunicipalityItem[]>([])
  const [datasetBarangays, setDatasetBarangays] = useState<BarangayItem[]>([])
  const [reportTypes, setReportTypes] = useState<ReportTypeItem[]>([])

  const [dsRegion, setDsRegion] = useState("")
  const [dsProvince, setDsProvince] = useState("")
  const [dsMunicipality, setDsMunicipality] = useState("")

  // Key Registration Form State
  const [org, setOrg] = useState("")
  const [scope, setScope] = useState<"barangay" | "lgu">("barangay")
  const [toastMsg, setToastMsg] = useState("")

  const profile = session?.profile

  useEffect(() => {
    if (!profile) return
    loadInitialData()
    getCreditBalance().then(setCredits)
  }, [profile])

  async function loadInitialData() {
    if (!profile) return
    setLoading(true)

    const mockDev: DevRecord = {
      id: "dev-001",
      uniqid: profile.uniqid,
      name: `${profile.first_name} ${profile.last_name}`,
      email: profile.email,
      organization: "CityData Tech PH",
      barangay_code: profile.barangay_code,
    }
    setDevRecord(mockDev)
    setOrg("CityData Tech PH")

    const initialKey: ApiKey = {
      id: "key-001",
      key: "hnd_sk_live_barangay_9a8b7c6d5e4f3a2b1c0d9e8f",
      barangay_code: profile.barangay_code,
      scope: "barangay",
      created_at: new Date().toLocaleDateString(),
    }
    setApiKeys([initialKey])
    setBarangayName(profile.barangay || "Poblacion, Alaminos")
    setLoading(false)
  }

  // Load eReport datasets when clicking datasets tab
  useEffect(() => {
    if (activeTab === "datasets" && regions.length === 0) {
      getRegions().then((r) => {
        setRegions(r)
        if (r.length > 0) setDsRegion(r[0].id)
      })
      getReportTypes().then(setReportTypes)
    }
  }, [activeTab])

  useEffect(() => {
    if (dsRegion) {
      getProvinces(dsRegion).then((p) => {
        setProvinces(p)
        if (p.length > 0) setDsProvince(p[0].id)
      })
    }
  }, [dsRegion])

  useEffect(() => {
    if (dsProvince) {
      getMunicipalities(dsProvince).then((m) => {
        setMunicipalities(m)
        if (m.length > 0) setDsMunicipality(m[0].id)
      })
    }
  }, [dsProvince])

  useEffect(() => {
    if (dsMunicipality) {
      getBarangays(dsMunicipality).then(setDatasetBarangays)
    }
  }, [dsMunicipality])

  function showToast(msg: string) {
    setToastMsg(msg)
    setTimeout(() => setToastMsg(""), 2400)
  }

  function toggleKeyVisibility(id: string) {
    setVisibleKeyIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function copyKeyText(keyStr: string, keyId: string) {
    navigator.clipboard.writeText(keyStr)
    setCopiedKeyId(keyId)
    setTimeout(() => setCopiedKeyId(null), 2000)
  }

  function handleDeleteKey(id: string) {
    setApiKeys((prev) => prev.filter((k) => k.id !== id))
    showToast("API secret key revoked & deleted.")
  }

  function handleGenerateNewKey(e: React.FormEvent) {
    e.preventDefault()
    if (!profile) return

    const newKeyObj: ApiKey = {
      id: `key-${Date.now()}`,
      key: generateCleanApiKey(scope),
      barangay_code: profile.barangay_code,
      scope,
      created_at: new Date().toLocaleDateString(),
    }

    setApiKeys((prev) => [newKeyObj, ...prev])
    showToast(`New ${scope.toUpperCase()} API Secret Key generated successfully!`)
  }

  const activeKey = apiKeys[0]
  const selectedEndpoint = ENDPOINT_DOCS.find((e) => e.id === selectedEndpointId) ?? ENDPOINT_DOCS[0]

  if (!devRecord || loading) {
    return (
      <Shell
        official={{ name: profile?.first_name || "Dev", uniqid: profile?.uniqid || "", role: "developer", barangay_code: profile?.barangay_code || "" }}
        sidebarTab={activeTab}
        onNavigate={setActiveTab}
        onLogout={logout}
        role="developer"
      >
        <div className="p-8 text-center text-slate-500">Loading Developer Portal...</div>
      </Shell>
    )
  }

  const officialInfo = {
    name: devRecord.name,
    uniqid: devRecord.uniqid,
    role: "developer",
    barangay_code: devRecord.barangay_code,
  }

  return (
    <Shell official={officialInfo} sidebarTab={activeTab} onNavigate={setActiveTab} onLogout={logout} role="developer">
      <div className="flex flex-col gap-6">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 pb-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">Developer API Portal</h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-0.5">{devRecord.organization} • {devRecord.email}</p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs bg-emerald-100 text-emerald-800 border border-emerald-200 px-3 py-1 rounded-full font-semibold">
              API Status: Online
            </span>
          </div>
        </div>

        {/* TAB 1: OVERVIEW & CREDITS */}
        {activeTab === "dashboard" && (
          <div className="flex flex-col gap-6">
            {/* Quick Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">eGov AI Credits</span>
                <div className="mt-2 flex items-baseline gap-2">
                  <strong className="text-3xl font-extrabold text-blue-700">{credits?.credits_remaining ?? 185}</strong>
                  <span className="text-xs text-slate-500">/ {credits?.credits_total ?? 200} total</span>
                </div>
                <span className="text-[11px] text-slate-400 mt-2">Active Hackathon Token Balance</span>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Active API Keys</span>
                <div className="mt-2 flex items-center justify-between">
                  <span className="text-sm font-semibold text-slate-900 truncate max-w-[160px]">
                    {apiKeys.length} {apiKeys.length === 1 ? "Key Active" : "Keys Active"}
                  </span>
                  <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded font-mono">Scoped</span>
                </div>
                <span className="text-[11px] text-slate-400 mt-2">{barangayName}</span>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Integrated APIs</span>
                <div className="mt-2 flex items-center gap-2">
                  <span className="text-xs font-bold bg-purple-100 text-purple-800 px-2.5 py-1 rounded-lg">eGov AI</span>
                  <span className="text-xs font-bold bg-amber-100 text-amber-800 px-2.5 py-1 rounded-lg">eReport</span>
                  <span className="text-xs font-bold bg-blue-100 text-blue-800 px-2.5 py-1 rounded-lg">eHANDA</span>
                </div>
                <span className="text-[11px] text-slate-400 mt-2">All Services Connected</span>
              </div>
            </div>

            {/* Active API Secret Key Summary Card */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <h3 className="font-bold text-sm text-slate-900">Active Production API Secret Key</h3>
                  <p className="text-xs text-slate-500 mt-0.5">Secret keys are automatically masked by default for security</p>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveTab("apikeys")}
                  className="pill-btn ghost text-xs py-1.5 px-3 font-semibold"
                >
                  Manage API Keys →
                </button>
              </div>

              {activeKey ? (
                <div className="mt-4 flex flex-col gap-3">
                  <div className="bg-slate-900 text-emerald-400 font-mono text-xs p-4 rounded-xl border border-slate-800 flex items-center justify-between overflow-x-auto gap-3">
                    <code>{formatMaskedApiKey(activeKey.key, visibleKeyIds.has(activeKey.id))}</code>
                    <div className="flex items-center gap-2 shrink-0 font-sans">
                      <button
                        type="button"
                        onClick={() => toggleKeyVisibility(activeKey.id)}
                        className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold px-3 py-1.5 rounded-lg transition-all"
                      >
                        {visibleKeyIds.has(activeKey.id) ? "Hide" : "Show Key"}
                      </button>
                      <button
                        type="button"
                        onClick={() => copyKeyText(activeKey.key, activeKey.id)}
                        className="text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-3 py-1.5 rounded-lg transition-all"
                      >
                        {copiedKeyId === activeKey.id ? "Copied!" : "Copy"}
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="mt-4 p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-500 text-center">
                  No active API key found. Go to <button type="button" onClick={() => setActiveTab("apikeys")} className="text-blue-700 underline font-semibold">API Key Management</button> to generate a new key.
                </div>
              )}
            </div>

            {/* Quick API Documentation Teaser */}
            <div className="bg-[var(--blue-soft)] border border-blue-200 p-6 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <h3 className="font-bold text-base text-slate-900">Explore eReport & eHANDA API Endpoints</h3>
                <p className="text-xs text-slate-600 mt-1 max-w-xl">
                  Query barangay disaster aggregates, check-in queue responses, eReport geographic datasets, and dialect translations programmatically.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setActiveTab("docs")}
                className="pill-btn primary text-xs py-2.5 px-5 font-bold shrink-0"
              >
                View API Docs →
              </button>
            </div>
          </div>
        )}

        {/* TAB 2: API DOCUMENTATION */}
        {activeTab === "docs" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
            <div className="lg:col-span-1 flex flex-col gap-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">Available Endpoints</h3>
              {ENDPOINT_DOCS.map((ep) => (
                <button
                  key={ep.id}
                  type="button"
                  onClick={() => setSelectedEndpointId(ep.id)}
                  className={`p-4 rounded-xl border text-left transition-all ${
                    selectedEndpointId === ep.id
                      ? "border-blue-600 bg-blue-50/70 shadow-xs ring-1 ring-blue-500"
                      : "border-slate-200 bg-white hover:border-slate-300"
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-extrabold font-mono px-2 py-0.5 rounded bg-blue-700 text-white">
                      {ep.method}
                    </span>
                    <span className="font-mono text-xs font-semibold text-slate-900 truncate">{ep.path}</span>
                  </div>
                  <h4 className="font-bold text-sm text-slate-900 mt-1">{ep.title}</h4>
                  <p className="text-xs text-slate-600 mt-1 line-clamp-2">{ep.description}</p>
                </button>
              ))}
            </div>

            <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col gap-5">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-extrabold font-mono px-2.5 py-1 rounded bg-blue-700 text-white">
                    {selectedEndpoint.method}
                  </span>
                  <span className="font-mono text-sm font-bold text-slate-900">{selectedEndpoint.path}</span>
                </div>
                <h3 className="text-lg font-bold text-slate-900">{selectedEndpoint.title}</h3>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">{selectedEndpoint.description}</p>
              </div>

              <div>
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-2">
                  Example Request (cURL)
                </span>
                <pre className="bg-slate-900 text-slate-100 font-mono text-xs p-4 rounded-xl overflow-x-auto border border-slate-800 leading-relaxed">
                  {selectedEndpoint.curlExample}
                </pre>
              </div>

              <div>
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-2">
                  Response Example (200 OK)
                </span>
                <pre className="bg-slate-900 text-emerald-400 font-mono text-xs p-4 rounded-xl overflow-x-auto border border-slate-800 leading-relaxed">
                  {selectedEndpoint.responses[0].example}
                </pre>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: EREPORT DATASETS */}
        {activeTab === "datasets" && (
          <div className="flex flex-col gap-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-base font-bold text-slate-900">PSA Location Hierarchy Datasets</h3>
                  <p className="text-xs text-slate-500 mt-0.5">eReport live PSA codes for Region, Province, Municipality, & Barangay</p>
                </div>
                <span className="text-xs bg-purple-100 text-purple-800 px-3 py-1 rounded-full font-bold">
                  PSA Standard
                </span>
              </div>

              {/* Filters */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Region</label>
                  <select
                    value={dsRegion}
                    onChange={(e) => setDsRegion(e.target.value)}
                    className="w-full p-2.5 text-xs border border-slate-300 rounded-xl bg-white font-medium"
                  >
                    {regions.map((r) => (
                      <option key={r.id} value={r.id}>{r.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Province</label>
                  <select
                    value={dsProvince}
                    onChange={(e) => setDsProvince(e.target.value)}
                    className="w-full p-2.5 text-xs border border-slate-300 rounded-xl bg-white font-medium"
                  >
                    {provinces.map((p) => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Municipality</label>
                  <select
                    value={dsMunicipality}
                    onChange={(e) => setDsMunicipality(e.target.value)}
                    className="w-full p-2.5 text-xs border border-slate-300 rounded-xl bg-white font-medium"
                  >
                    {municipalities.map((m) => (
                      <option key={m.id} value={m.id}>{m.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Table */}
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 border-b border-slate-200 text-slate-700 font-semibold">
                    <tr>
                      <th className="p-3">PSGC Code</th>
                      <th className="p-3">Barangay Name</th>
                      <th className="p-3">Municipality Code</th>
                      <th className="p-3">Region Code</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 bg-white">
                    {datasetBarangays.map((b) => (
                      <tr key={b.id} className="hover:bg-slate-50">
                        <td className="p-3 font-mono text-blue-700 font-bold">{b.id}</td>
                        <td className="p-3 font-semibold text-slate-900">{b.name}</td>
                        <td className="p-3 font-mono text-slate-600">{b.municipality_code}</td>
                        <td className="p-3 font-mono text-slate-600">{b.region_code}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Report Types Dataset */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
              <h3 className="text-sm font-bold text-slate-900 mb-2">eReport Disaster Complaint Categories ({reportTypes.length})</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {reportTypes.map((rt) => (
                  <div key={rt.id} className="p-3 border border-slate-200 rounded-xl bg-slate-50">
                    <span className="text-xs font-bold text-slate-900 block">{rt.name}</span>
                    <span className="text-[10px] font-mono text-blue-700 block mt-0.5">Code: {rt.code}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: API KEY MANAGEMENT */}
        {activeTab === "apikeys" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
            {/* Left: Active API Keys List */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col gap-4">
              <div>
                <h3 className="font-bold text-base text-slate-900">Your Active API Secret Keys ({apiKeys.length})</h3>
                <p className="text-xs text-slate-500 mt-0.5">API secret keys are automatically masked for security.</p>
              </div>

              {apiKeys.length === 0 ? (
                <div className="p-6 border border-dashed border-slate-200 rounded-xl bg-slate-50 text-center text-xs text-slate-500">
                  No active API secret keys. Use the form on the right to generate a key.
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {apiKeys.map((k) => {
                    const isVisible = visibleKeyIds.has(k.id)
                    return (
                      <div key={k.id} className="p-4 border border-slate-200 rounded-xl bg-slate-50 flex flex-col gap-2.5">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                            {k.scope === "lgu" ? "LGU Municipal Scope" : "Barangay Scope"}
                          </span>
                          <span className="text-[10px] bg-blue-100 text-blue-800 font-semibold px-2 py-0.5 rounded font-mono">
                            Active
                          </span>
                        </div>

                        <div className="bg-slate-900 text-emerald-400 font-mono text-xs p-3 rounded-lg border border-slate-800 flex items-center justify-between overflow-x-auto gap-2">
                          <code>{formatMaskedApiKey(k.key, isVisible)}</code>
                          <div className="flex items-center gap-1.5 shrink-0 font-sans">
                            <button
                              type="button"
                              onClick={() => toggleKeyVisibility(k.id)}
                              className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold px-2.5 py-1 rounded transition-all"
                            >
                              {isVisible ? "Hide" : "Show"}
                            </button>
                            <button
                              type="button"
                              onClick={() => copyKeyText(k.key, k.id)}
                              className="text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-2.5 py-1 rounded transition-all"
                            >
                              {copiedKeyId === k.id ? "Copied!" : "Copy"}
                            </button>
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-1 text-[11px]">
                          <span className="text-slate-400 font-mono">Created: {k.created_at}</span>
                          <button
                            type="button"
                            onClick={() => handleDeleteKey(k.id)}
                            className="text-xs text-red-600 hover:text-red-800 font-semibold hover:underline"
                          >
                            Revoke / Delete Key
                          </button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Right: Key Registration Form */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
              <h3 className="font-bold text-base text-slate-900 mb-1">Generate New API Key</h3>
              <p className="text-xs text-slate-600 mb-5">
                Issue a new standard API bearer secret key for third-party disaster management tools.
              </p>

              <form onSubmit={handleGenerateNewKey} className="flex flex-col gap-4 text-xs">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Organization / System Name</label>
                  <input
                    type="text"
                    value={org}
                    onChange={(e) => setOrg(e.target.value)}
                    placeholder="e.g. CityData PH"
                    className="w-full p-2.5 border border-slate-300 rounded-xl bg-white text-slate-900 font-medium"
                    required
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">API Permission Scope</label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setScope("barangay")}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        scope === "barangay"
                          ? "border-blue-600 bg-blue-50 font-bold ring-1 ring-blue-500"
                          : "border-slate-200 bg-white"
                      }`}
                    >
                      <span className="block text-slate-900">Barangay Scope</span>
                      <span className="text-[11px] text-slate-500 font-normal">Single barangay metrics</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setScope("lgu")}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        scope === "lgu"
                          ? "border-blue-600 bg-blue-50 font-bold ring-1 ring-blue-500"
                          : "border-slate-200 bg-white"
                      }`}
                    >
                      <span className="block text-slate-900">LGU Municipal Scope</span>
                      <span className="text-[11px] text-slate-500 font-normal">All barangays in municipality</span>
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  className="mt-2 bg-[var(--blue-primary)] hover:bg-[var(--blue-hover)] text-white font-semibold py-3 rounded-xl shadow-xs transition-all text-xs"
                >
                  + Generate New Secret Key
                </button>
              </form>
            </div>
          </div>
        )}
      </div>

      {toastMsg && <div className="toast-bar left-4 right-4 md:left-auto md:right-6 md:max-w-[360px]">{toastMsg}</div>}
    </Shell>
  )
}
