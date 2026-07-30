import { useState, useEffect } from "react"
import { Shell } from "@/components/Shell"
import { useSession } from "@/features/auth/session-context"
import { supabase } from "@/lib/supabase"

type DevRecord = { id: string; uniqid: string; name: string; email: string; organization: string; barangay_code: string }
type ApiKey = { id: string; key: string; barangay_code: string; scope: "barangay" | "lgu" }
type Barangay = { code: string; name: string; municipality_code: string | null }

type EndpointDoc = {
  id: string
  method: string
  path: string
  summary: string
  description: string
  queryParams?: { name: string; type: string; description: string }[]
  requestBody?: { contentType: string; example: string }
  sampleRequest: string
  responses: { code: string; description: string; contentType: string; example: string }[]
}

const ENDPOINT_DOCS: EndpointDoc[] = [
  {
    id: "barangay",
    method: "GET",
    path: "/barangays/{psgc}",
    summary: "Your barangay details",
    description: "Returns the barangay metadata for the PSGC code matching your API key's scope. Barangay-scoped keys can only query their own barangay. LGU-scoped keys can query any barangay in their municipality.",
    sampleRequest: `curl --request GET \\
  --url 'https://api.handa.gov.ph/v1/barangays/0105503021' \\
  --header 'Authorization: Bearer hnd_sk_demo_alaminos_poblacion'`,
    responses: [
      {
        code: "200",
        description: "Barangay found",
        contentType: "application/json",
        example: `{
  "code": "0105503021",
  "name": "Poblacion, Alaminos, Pangasinan",
  "municipality": "CITY OF ALAMINOS",
  "municipality_code": "0105503000",
  "province": "PANGASINAN",
  "province_code": "0105500000",
  "region": "REGION I (ILOCOS REGION)",
  "region_code": "0100000000"
}`,
      },
      {
        code: "403",
        description: "Scope mismatch — barangay-scoped key querying a different barangay",
        contentType: "application/json",
        example: `{
  "error": "forbidden",
  "message": "API key is not scoped to this barangay"
}`,
      },
      {
        code: "404",
        description: "Unknown PSGC",
        contentType: "application/json",
        example: `{
  "error": "not_found",
  "message": "Barangay not found"
}`,
      },
    ],
  },
  {
    id: "assessments-list",
    method: "GET",
    path: "/assessments",
    summary: "List assessments in your barangay",
    description: "Returns the assessments visible to your API key's scope. Barangay-scoped keys see their own barangay's assessments; LGU-scoped keys see all assessments in their municipality.",
    queryParams: [
      { name: "status", type: "string", description: "Optional filter: draft, active, closed, archived" },
      { name: "limit", type: "integer", description: "Pagination size. Default 25" },
      { name: "offset", type: "integer", description: "Pagination offset. Default 0" },
    ],
    sampleRequest: `curl --request GET \\
  --url 'https://api.handa.gov.ph/v1/assessments?status=active&limit=25&offset=0' \\
  --header 'Authorization: Bearer hnd_sk_demo_alaminos_poblacion'`,
    responses: [
      {
        code: "200",
        description: "Assessment list",
        contentType: "application/json",
        example: `{
  "data": [
    {
      "id": "a0000000-0000-0000-0000-000000000001",
      "name": "Typhoon Odette Response",
      "disaster_type": "Typhoon",
      "disaster_date": "2025-01-15",
      "status": "active",
      "barangay_code": "0105503021",
      "created_at": "2025-01-15T00:00:00Z",
      "updated_at": "2025-01-15T00:00:00Z"
    }
  ],
  "meta": {
    "total": 1,
    "limit": 25,
    "offset": 0
  }
}`,
      },
      {
        code: "401",
        description: "Missing or invalid API key",
        contentType: "application/json",
        example: `{
  "error": "unauthorized",
  "message": "Missing or invalid API key"
}`,
      },
    ],
  },
  {
    id: "assessment-detail",
    method: "GET",
    path: "/assessments/{id}",
    summary: "Single assessment detail",
    description: "Returns metadata, lifecycle state, and question set for one assessment.",
    sampleRequest: `curl --request GET \\
  --url 'https://api.handa.gov.ph/v1/assessments/a0000000-0000-0000-0000-000000000001' \\
  --header 'Authorization: Bearer hnd_sk_demo_alaminos_poblacion'`,
    responses: [
      {
        code: "200",
        description: "Assessment detail",
        contentType: "application/json",
        example: `{
  "id": "a0000000-0000-0000-0000-000000000001",
  "name": "Typhoon Odette Response",
  "disaster_type": "Typhoon",
  "disaster_date": "2025-01-15",
  "status": "active",
  "barangay_code": "0105503021",
  "questions": [
    {
      "id": "b0000000-0000-0000-0000-000000000001",
      "question_text": "Is your home damaged?",
      "need_category": "Shelter",
      "display_order": 0
    }
  ]
}`,
      },
      {
        code: "404",
        description: "Unknown assessment",
        contentType: "application/json",
        example: `{
  "error": "not_found",
  "message": "Assessment not found"
}`,
      },
    ],
  },
  {
    id: "assessment-aggregates",
    method: "GET",
    path: "/assessments/{id}/aggregates",
    summary: "Affected count, needs breakdown",
    description: "Returns the high-level dashboard counters used by LGU command views.",
    sampleRequest: `curl --request GET \\
  --url 'https://api.handa.gov.ph/v1/assessments/a0000000-0000-0000-0000-000000000001/aggregates' \\
  --header 'Authorization: Bearer hnd_sk_demo_alaminos_poblacion'`,
    responses: [
      {
        code: "200",
        description: "Aggregate metrics",
        contentType: "application/json",
        example: `{
  "assessment_id": "a0000000-0000-0000-0000-000000000001",
  "affected_count": 2,
  "unresolved_count": 1,
  "needs_breakdown": {
    "Shelter": 2,
    "Food or water": 1,
    "Medical": 1
  }
}`,
      },
      {
        code: "403",
        description: "Scope mismatch",
        contentType: "application/json",
        example: `{
  "error": "forbidden",
  "message": "API key is not scoped to this barangay"
}`,
      },
    ],
  },
  {
    id: "assessment-responses",
    method: "GET",
    path: "/assessments/{id}/responses",
    summary: "Paginated check-in responses",
    description: "Returns resident check-ins with inline answers for downstream case handling or reporting.",
    queryParams: [
      { name: "status", type: "string", description: "Optional filter: unresolved, visited, resolved" },
      { name: "limit", type: "integer", description: "Pagination size. Default 25" },
      { name: "offset", type: "integer", description: "Pagination offset. Default 0" },
    ],
    sampleRequest: `curl --request GET \\
  --url 'https://api.handa.gov.ph/v1/assessments/a0000000-0000-0000-0000-000000000001/responses?status=unresolved' \\
  --header 'Authorization: Bearer hnd_sk_demo_alaminos_poblacion'`,
    responses: [
      {
        code: "200",
        description: "Check-in response page",
        contentType: "application/json",
        example: `{
  "data": [
    {
      "id": "c0000000-0000-0000-0000-000000000002",
      "name": "Maria Santos",
      "submitted_by": "Maria Santos",
      "status": "unresolved",
      "answers": [
        {
          "question_id": "b0000000-0000-0000-0000-000000000001",
          "question_text": "Is your home damaged?",
          "need_category": "Shelter",
          "answer": "yes"
        }
      ],
      "created_at": "2025-01-15T00:00:00Z"
    }
  ],
  "meta": {
    "total": 1,
    "limit": 25,
    "offset": 0
  }
}`,
      },
      {
        code: "404",
        description: "Assessment missing",
        contentType: "application/json",
        example: `{
  "error": "not_found",
  "message": "Assessment not found"
}`,
      },
    ],
  },
  {
    id: "assessment-export",
    method: "GET",
    path: "/assessments/{id}/export.csv",
    summary: "CSV export of all check-ins",
    description: "Returns the same flat export consumed by dashboard users in spreadsheet workflows.",
    sampleRequest: `curl --request GET \\
  --url 'https://api.handa.gov.ph/v1/assessments/a0000000-0000-0000-0000-000000000001/export.csv' \\
  --header 'Authorization: Bearer hnd_sk_demo_alaminos_poblacion'`,
    responses: [
      {
        code: "200",
        description: "CSV export",
        contentType: "text/csv",
        example: `Name,Needs,Status,Submitted By,Created At
"Juan Dela Cruz","Shelter",visited,"Juan Dela Cruz","2025-01-15T00:00:00Z"
"Maria Santos","Shelter; Food or water; Medical",unresolved,"Maria Santos","2025-01-15T00:00:00Z"`,
      },
      {
        code: "204",
        description: "Assessment has no responses yet",
        contentType: "text/plain",
        example: `No content`,
      },
    ],
  },
  {
    id: "assessment-update",
    method: "PATCH",
    path: "/assessments/{id}",
    summary: "Update assessment metadata",
    description: "Administrative metadata update for name, disaster type, and disaster date.",
    requestBody: {
      contentType: "application/json",
      example: `{
  "name": "Typhoon Odette Response",
  "disaster_type": "Typhoon",
  "disaster_date": "2025-01-15"
}`,
    },
    sampleRequest: `curl --request PATCH \\
  --url 'https://api.handa.gov.ph/v1/assessments/a0000000-0000-0000-0000-000000000001' \\
  --header 'Authorization: Bearer hnd_sk_demo_alaminos_poblacion' \\
  --header 'Content-Type: application/json' \\
  --data '{
    "name": "Typhoon Odette Response",
    "disaster_type": "Typhoon",
    "disaster_date": "2025-01-15"
  }'`,
    responses: [
      {
        code: "200",
        description: "Assessment updated",
        contentType: "application/json",
        example: `{
  "id": "a0000000-0000-0000-0000-000000000001",
  "name": "Typhoon Odette Response",
  "disaster_type": "Typhoon",
  "disaster_date": "2025-01-15",
  "status": "draft",
  "updated_at": "2025-01-15T03:10:00Z"
}`,
      },
      {
        code: "422",
        description: "Validation failure",
        contentType: "application/json",
        example: `{
  "error": "validation_error",
  "message": "disaster_date cannot be in the future"
}`,
      },
    ],
  },
  {
    id: "assessment-publish",
    method: "POST",
    path: "/assessments/{id}/publish",
    summary: "Publish draft assessment",
    description: "Transitions the draft to active and closes any other active assessment within the same barangay.",
    sampleRequest: `curl --request POST \\
  --url 'https://api.handa.gov.ph/v1/assessments/a0000000-0000-0000-0000-000000000001/publish' \\
  --header 'Authorization: Bearer hnd_sk_demo_alaminos_poblacion'`,
    responses: [
      {
        code: "200",
        description: "Assessment published",
        contentType: "application/json",
        example: `{
  "id": "a0000000-0000-0000-0000-000000000001",
  "status": "active",
  "closed_assessment_ids": ["a0000000-0000-0000-0000-000000000009"]
}`,
      },
      {
        code: "409",
        description: "Already active or archived",
        contentType: "application/json",
        example: `{
  "error": "conflict",
  "message": "Only draft or closed assessments can be published"
}`,
      },
    ],
  },
]

export function DeveloperConsole() {
  const { session, logout } = useSession()
  const [selectedEndpointId, setSelectedEndpointId] = useState(ENDPOINT_DOCS[0].id)
  const [devRecord, setDevRecord] = useState<DevRecord | null>(null)
  const [apiKey, setApiKey] = useState<ApiKey | null>(null)
  const [barangays, setBarangays] = useState<Barangay[]>([])
  const [loading, setLoading] = useState(true)
  const [registering, setRegistering] = useState(false)
  const [copied, setCopied] = useState(false)
  const [toastMsg, setToastMsg] = useState("")

  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [org, setOrg] = useState("")
  const [selectedBarangay, setSelectedBarangay] = useState("")
  const [scope, setScope] = useState<"barangay" | "lgu">("barangay")
  const [regError, setRegError] = useState<string | null>(null)

  if (!session) return null

  const profile = session.profile

  useEffect(() => {
    if (!supabase) { setLoading(false); return }

    // Load barangays in the user's municipality — LGU scope devs pick any within it
    supabase.from("barangays").select("*").eq("municipality_code", profile.municipality_code).then(({ data }) => {
      if (data) setBarangays(data as Barangay[])
      setSelectedBarangay(profile.barangay_code)
    })

    supabase.from("developers").select("*").eq("uniqid", profile.uniqid).maybeSingle().then(({ data: dev }) => {
      if (!dev) { setLoading(false); return }
      setDevRecord(dev as DevRecord)
      setName(dev.name)
      setEmail(dev.email)
      setOrg(dev.organization)
      setSelectedBarangay(dev.barangay_code)

      supabase!.from("api_keys").select("*").eq("developer_id", dev.id).order("created_at", { ascending: false }).maybeSingle().then(({ data: key }) => {
        if (key) {
          setApiKey(key as ApiKey)
          setScope(key.scope)
        }
        setLoading(false)
      })
    })
  }, [profile.uniqid])

  function showToast(msg: string) {
    setToastMsg(msg)
    setTimeout(() => setToastMsg(""), 2400)
  }

  async function copyKey() {
    if (!apiKey) return
    try {
      await navigator.clipboard.writeText(apiKey.key)
    } catch {
      // ponytail: fallback for non-HTTPS dev
      const el = document.createElement("textarea")
      el.value = apiKey.key
      document.body.appendChild(el)
      el.select()
      document.execCommand("copy")
      document.body.removeChild(el)
    }
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault()
    if (!supabase || !name || !email || !org || !selectedBarangay) return
    setRegistering(true)
    setRegError(null)

    const { data: dev, error: devErr } = await supabase
      .from("developers")
      .insert({ uniqid: profile.uniqid, name, email, organization: org, barangay_code: selectedBarangay })
      .select()
      .single()

    if (devErr) {
      setRegError(devErr.message)
      setRegistering(false)
      return
    }

    const key = "hnd_sk_" + crypto.randomUUID().replace(/-/g, "")
    const { error: keyErr } = await supabase
      .from("api_keys")
      .insert({ key, developer_id: dev.id, barangay_code: selectedBarangay, scope })

    if (keyErr) {
      setRegError(keyErr.message)
      setRegistering(false)
      return
    }

    setDevRecord(dev as DevRecord)
    setApiKey({ id: "", key, barangay_code: selectedBarangay, scope })
    setRegistering(false)
    showToast("Registration complete. Your API key is ready.")
  }

  const barangayName = barangays.find(b => b.code === devRecord?.barangay_code)?.name ?? devRecord?.barangay_code ?? ""
  const selectedEndpoint = ENDPOINT_DOCS.find(endpoint => endpoint.id === selectedEndpointId) ?? ENDPOINT_DOCS[0]

  if (loading) {
    return (
      <Shell official={{ name: profile.first_name + " " + profile.last_name, uniqid: profile.uniqid, role: "developer", barangay_code: profile.barangay_code }} sidebarTab="dashboard" onNavigate={() => {}} onLogout={logout} role="developer">
        <div className="section-card p-[18px]">
          <div className="skeleton-bar" style={{ width: "40%", height: "24px" }} />
          <div className="skeleton-bar" style={{ width: "60%", height: "14px", margin: "8px 0 0" }} />
        </div>
      </Shell>
    )
  }

  if (!devRecord) {
    return (
      <Shell official={{ name: profile.first_name + " " + profile.last_name, uniqid: profile.uniqid, role: "developer", barangay_code: profile.barangay_code }} sidebarTab="dashboard" onNavigate={() => {}} onLogout={logout} role="developer">
        <div className="max-w-lg mx-auto">
          <h2 style={{ margin: "0 0 4px", fontSize: "clamp(20px, 4vw, 28px)", letterSpacing: "-0.04em" }}>Developer registration</h2>
          <p style={{ color: "#556075", lineHeight: 1.45, fontSize: "14px", marginBottom: "24px" }}>Register to get API access. Choose your scope level below.</p>

          <form onSubmit={handleRegister} className="section-card p-[24px] flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <label htmlFor="dev-name" style={{ fontWeight: 800, fontSize: "14px", color: "#313a4c" }}>Name</label>
              <input id="dev-name" value={name} onChange={e => setName(e.target.value)} placeholder="Your full name" className="w-full min-h-[48px] rounded-2xl px-3 py-3 text-sm" style={{ border: "1px solid #cdd8ed", background: "#fff", color: "var(--ink)" }} required />
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="dev-email" style={{ fontWeight: 800, fontSize: "14px", color: "#313a4c" }}>Email</label>
              <input id="dev-email" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" className="w-full min-h-[48px] rounded-2xl px-3 py-3 text-sm" style={{ border: "1px solid #cdd8ed", background: "#fff", color: "var(--ink)" }} required />
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="dev-org" style={{ fontWeight: 800, fontSize: "14px", color: "#313a4c" }}>Organization</label>
              <input id="dev-org" value={org} onChange={e => setOrg(e.target.value)} placeholder="e.g. CityApp Solutions" className="w-full min-h-[48px] rounded-2xl px-3 py-3 text-sm" style={{ border: "1px solid #cdd8ed", background: "#fff", color: "var(--ink)" }} required />
            </div>

            <div className="flex flex-col gap-2">
              <label style={{ fontWeight: 800, fontSize: "14px", color: "#313a4c" }}>API scope</label>
              <div className="flex gap-3">
                <button type="button" onClick={() => setScope("barangay")} className="flex-1 rounded-[18px] p-4 border text-left transition-colors" style={{ background: scope === "barangay" ? "#f4f7ff" : "#fff", borderColor: scope === "barangay" ? "#b9c9f5" : "#edf1f8", boxShadow: scope === "barangay" ? "0 0 0 1px rgba(6,70,244,0.06)" : "none" }}>
                  <strong style={{ display: "block", fontSize: "14px", color: "var(--ink)" }}>Barangay</strong>
                  <span style={{ color: "#556075", fontSize: "12px" }}>Access scoped to a single barangay</span>
                </button>
                <button type="button" onClick={() => setScope("lgu")} className="flex-1 rounded-[18px] p-4 border text-left transition-colors" style={{ background: scope === "lgu" ? "#f4f7ff" : "#fff", borderColor: scope === "lgu" ? "#b9c9f5" : "#edf1f8", boxShadow: scope === "lgu" ? "0 0 0 1px rgba(6,70,244,0.06)" : "none" }}>
                  <strong style={{ display: "block", fontSize: "14px", color: "var(--ink)" }}>LGU</strong>
                  <span style={{ color: "#556075", fontSize: "12px" }}>Access to all barangays in your municipality</span>
                </button>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="dev-barangay" style={{ fontWeight: 800, fontSize: "14px", color: "#313a4c" }}>{scope === "barangay" ? "Barangay" : "Primary barangay"}</label>
              <select id="dev-barangay" value={selectedBarangay} onChange={e => setSelectedBarangay(e.target.value)} className="w-full min-h-[48px] rounded-2xl px-3 py-3 text-sm" style={{ border: "1px solid #cdd8ed", background: "#fff", color: "var(--ink)" }} required>
                {barangays.map(b => <option key={b.code} value={b.code}>{b.name}</option>)}
              </select>
              <span style={{ color: "#5e687b", fontSize: "12px" }}>{scope === "barangay" ? "API key will only access this barangay's data." : "API key will access all barangays in your municipality."}</span>
            </div>

            {regError && <p style={{ color: "var(--red)", fontSize: "13px" }}>{regError}</p>}

            <button className="big-btn primary" type="submit" disabled={registering} style={registering ? { opacity: 0.7 } : undefined}>
              {registering ? "Registering..." : "Register & get API key"}
            </button>
          </form>
        </div>
        {toastMsg && <div className="toast-bar left-4 right-4 md:left-auto md:right-6 md:max-w-[360px]">{toastMsg}</div>}
      </Shell>
    )
  }

  return (
    <Shell official={{ name: devRecord.name, uniqid: devRecord.uniqid, role: "developer", barangay_code: devRecord.barangay_code }} sidebarTab="dashboard" onNavigate={() => {}} onLogout={logout} role="developer">
      <div>
        <h2 style={{ margin: "0 0 4px", fontSize: "clamp(20px, 4vw, 28px)", letterSpacing: "-0.04em" }}>Developer Console</h2>
        <p style={{ color: "#556075", lineHeight: 1.45, fontSize: "14px" }}>{devRecord.organization}</p>

        <div className="grid gap-4 mt-4 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] xl:grid-cols-[minmax(0,0.82fr)_minmax(480px,1.18fr)] items-start">
          <div className="flex flex-col gap-4">
            <div className="section-card p-[20px]">
              <h3 style={{ margin: 0, borderBottom: "none", padding: 0 }}>API key</h3>
              <p style={{ color: "#556075", fontSize: "13px", marginTop: "4px" }}>
                {apiKey?.scope === "lgu" ? `LGU scope — ${barangayName} municipality` : `Barangay scope — ${barangayName}`}
              </p>
              <div className="flex items-center gap-3 mt-3">
                <code style={{ flex: 1, padding: "12px 16px", background: "#f8faff", borderRadius: "14px", fontSize: "13px", fontFamily: "'JetBrains Mono', monospace", wordBreak: "break-all", border: "1px solid var(--line)" }}>
                  {apiKey?.key ?? "Loading..."}
                </code>
                <button className="pill-btn ghost" style={{ whiteSpace: "nowrap", padding: "10px 16px" }} onClick={copyKey}>
                  {copied ? "Copied" : "Copy"}
                </button>
              </div>
            </div>

            <div className="section-card p-[20px]">
              <h3 style={{ margin: 0, borderBottom: "none", padding: 0 }}>API endpoints</h3>
              <p style={{ color: "#556075", fontSize: "13px", marginTop: "4px", marginBottom: "16px" }}>Base URL: <code style={{ background: "#f0f4ff", padding: "2px 6px", borderRadius: "6px" }}>https://api.handa.gov.ph/v1</code></p>

              <div className="flex flex-col gap-2">
                {ENDPOINT_DOCS.map(endpoint => {
                  const active = endpoint.id === selectedEndpoint.id
                  return (
                    <button
                      key={endpoint.id}
                      type="button"
                      onClick={() => setSelectedEndpointId(endpoint.id)}
                      className="w-full text-left rounded-[18px] p-4 border transition-colors"
                      style={{
                        background: active ? "#f4f7ff" : "#fff",
                        borderColor: active ? "#b9c9f5" : "#edf1f8",
                        boxShadow: active ? "0 0 0 1px rgba(6,70,244,0.06)" : "none",
                      }}
                    >
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                        <span className="status-chip" style={{ background: endpoint.method === "GET" ? "var(--blue)" : endpoint.method === "POST" ? "var(--good)" : "var(--warn)", color: "#fff", fontSize: "11px", padding: "3px 8px", whiteSpace: "nowrap" }}>{endpoint.method}</span>
                        <code style={{ fontSize: "13px", fontFamily: "'JetBrains Mono', monospace", wordBreak: "break-all", flex: 1 }}>{endpoint.path}</code>
                      </div>
                      <p style={{ margin: "8px 0 0", color: active ? "#42506a" : "var(--muted-text)", fontSize: "13px" }}>{endpoint.summary}</p>
                    </button>
                  )
                })}
              </div>

              <div className="mt-4 p-3 rounded-[14px]" style={{ background: "#f8faff", border: "1px solid var(--line)" }}>
                <strong style={{ fontSize: "13px" }}>Auth header</strong>
                <code style={{ display: "block", marginTop: "4px", fontSize: "12px", fontFamily: "'JetBrains Mono', monospace", background: "#fff", padding: "6px 10px", borderRadius: "8px", border: "1px solid var(--line)" }}>
                  Authorization: Bearer {apiKey?.key ?? "YOUR_API_KEY"}
                </code>
              </div>
            </div>
          </div>

          <div className="section-card p-[20px] lg:sticky lg:top-5">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h3 style={{ margin: 0, borderBottom: "none", padding: 0 }}>Reference</h3>
                <p style={{ margin: "6px 0 0", color: "var(--muted-text)", fontSize: "13px", lineHeight: 1.5 }}>{selectedEndpoint.description}</p>
              </div>
              <span className="status-chip" style={{ background: selectedEndpoint.method === "GET" ? "var(--blue)" : selectedEndpoint.method === "POST" ? "var(--good)" : "var(--warn)", color: "#fff" }}>{selectedEndpoint.method}</span>
            </div>

            <div className="mt-4 rounded-[16px] p-4" style={{ background: "#f8faff", border: "1px solid var(--line)" }}>
              <div className="text-xs font-bold uppercase tracking-[0.12em]" style={{ color: "#667085" }}>Path</div>
              <code style={{ display: "block", marginTop: "8px", fontSize: "13px", fontFamily: "'JetBrains Mono', monospace", wordBreak: "break-all" }}>{selectedEndpoint.path}</code>
            </div>

            {selectedEndpoint.queryParams && selectedEndpoint.queryParams.length > 0 && (
              <div className="mt-4">
                <h4 style={{ margin: 0, fontSize: "14px", color: "var(--ink)", fontWeight: 800 }}>Query params</h4>
                <div className="mt-3 flex flex-col gap-2">
                  {selectedEndpoint.queryParams.map(param => (
                    <div key={param.name} className="rounded-[14px] p-3" style={{ border: "1px solid var(--line)", background: "#fff" }}>
                      <div className="flex items-center gap-2">
                        <code style={{ fontSize: "12px", fontFamily: "'JetBrains Mono', monospace" }}>{param.name}</code>
                        <span className="status-chip" style={{ background: "#eef2ff", color: "#42506a", padding: "3px 8px", fontSize: "11px" }}>{param.type}</span>
                      </div>
                      <p style={{ margin: "8px 0 0", color: "var(--muted-text)", fontSize: "13px" }}>{param.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {selectedEndpoint.requestBody && (
              <div className="mt-4">
                <div className="flex items-center justify-between gap-3">
                  <h4 style={{ margin: 0, fontSize: "14px", color: "var(--ink)", fontWeight: 800 }}>Request body</h4>
                  <span className="status-chip" style={{ background: "#eef2ff", color: "#42506a", padding: "3px 8px", fontSize: "11px" }}>{selectedEndpoint.requestBody.contentType}</span>
                </div>
                <pre style={{ margin: "12px 0 0", padding: "16px", background: "#101828", color: "#e4edff", borderRadius: "16px", fontSize: "12px", lineHeight: 1.6, overflowX: "auto" }}><code>{selectedEndpoint.requestBody.example}</code></pre>
              </div>
            )}

            <div className="mt-4">
              <div className="flex items-center justify-between gap-3">
                <h4 style={{ margin: 0, fontSize: "14px", color: "var(--ink)", fontWeight: 800 }}>Sample request</h4>
                <span className="status-chip" style={{ background: "#eef2ff", color: "#42506a", padding: "3px 8px", fontSize: "11px" }}>curl</span>
              </div>
              <pre style={{ margin: "12px 0 0", padding: "16px", background: "#101828", color: "#e4edff", borderRadius: "16px", fontSize: "12px", lineHeight: 1.6, overflowX: "auto" }}><code>{selectedEndpoint.sampleRequest}</code></pre>
            </div>

            <div className="mt-4">
              <h4 style={{ margin: 0, fontSize: "14px", color: "var(--ink)", fontWeight: 800 }}>Responses</h4>
              <div className="mt-3 flex flex-col gap-3">
                {selectedEndpoint.responses.map(response => (
                  <div key={response.code} className="rounded-[16px] overflow-hidden" style={{ border: "1px solid var(--line)", background: "#fff" }}>
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between px-4 py-3" style={{ borderBottom: "1px solid var(--line)", background: "#f8faff" }}>
                      <div className="flex items-center gap-2">
                        <span className="status-chip" style={{ background: response.code.startsWith("2") ? "#e7f7ef" : response.code.startsWith("4") ? "#fff4e5" : "#fef2f2", color: response.code.startsWith("2") ? "var(--good)" : response.code.startsWith("4") ? "var(--warn)" : "var(--red)", padding: "4px 8px" }}>{response.code}</span>
                        <strong style={{ fontSize: "13px", color: "var(--ink)" }}>{response.description}</strong>
                      </div>
                      <code style={{ fontSize: "12px", color: "#556075" }}>{response.contentType}</code>
                    </div>
                    <pre style={{ margin: 0, padding: "16px", background: "#101828", color: "#e4edff", fontSize: "12px", lineHeight: 1.6, overflowX: "auto" }}><code>{response.example}</code></pre>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      {toastMsg && <div className="toast-bar left-4 right-4 md:left-auto md:right-6 md:max-w-[360px]">{toastMsg}</div>}
    </Shell>
  )
}
