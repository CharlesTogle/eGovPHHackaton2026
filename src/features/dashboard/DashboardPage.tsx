import { useState } from "react"
import { useSession } from "@/features/auth"
import { useCampaigns } from "@/features/campaigns/useCampaigns"
import { CampaignBuilder } from "@/features/campaigns/CampaignBuilder"
import { closeCampaign } from "@/features/campaigns/service"
import { useDashboardData } from "./useDashboardData"
import { useCampaignLive } from "./live"
import { advanceStatus } from "./status"
import { toCsv, downloadCsv } from "@/lib/csv"
import type { NeedCategory, CheckInStatus } from "@/lib/types"
import { filterAffected } from "@/lib/aggregator"

export function DashboardPage() {
  const { session, logout } = useSession()
  if (!session) return null

  const { campaigns, refetch: refetchCampaigns } = useCampaigns(session.profile.barangay_code)
  const [showBuilder, setShowBuilder] = useState(false)
  const [selectedCampaignId, setSelectedCampaignId] = useState<string | null>(
    campaigns.find((c) => c.status === "active")?.id ?? null
  )
  const [filterNeed, setFilterNeed] = useState<NeedCategory | "">("")
  const [filterStatus, setFilterStatus] = useState<CheckInStatus | "">("")

  const { data, loading, refresh } = useDashboardData(selectedCampaignId, session.profile.barangay_code)
  useCampaignLive(selectedCampaignId, refresh)

  const selectedCampaign = campaigns.find((c) => c.id === selectedCampaignId) ?? null

  const filteredRows = data
    ? filterAffected(data.affected, {
        needType: filterNeed || undefined,
        status: filterStatus || undefined,
      })
    : []

  async function handleAdvanceStatus(checkInId: string, currentStatus: CheckInStatus) {
    await advanceStatus(checkInId, currentStatus)
    await refresh()
  }

  async function handleClose() {
    if (!selectedCampaignId) return
    await closeCampaign(selectedCampaignId)
    await refetchCampaigns()
    setSelectedCampaignId(null)
  }

  function handleExport() {
    if (!data) return
    const csv = toCsv(filteredRows)
    downloadCsv("affected-households.csv", csv)
  }

  const cardStyle = {
    background: "var(--card)",
    borderRadius: "var(--egov-radius)",
    border: "1px solid var(--egov-line)",
  }

  return (
    <div className="min-h-dvh" style={{ background: "var(--egov-soft)" }}>
      <header
        className="flex items-center justify-between px-6 py-4"
        style={{ background: "rgba(255,255,255,0.82)", borderBottom: "1px solid var(--egov-line)" }}
      >
        <div className="flex items-center gap-3">
          <img src="/egovph-logo.png" alt="eGovPH" className="h-8" />
          <div>
            <h1 className="text-sm font-bold" style={{ color: "var(--egov-ink)" }}>
              HANDA — Dashboard
            </h1>
            <p className="text-xs" style={{ color: "var(--egov-muted)" }}>
              Barangay {session.profile.barangay}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs" style={{ color: "var(--egov-muted)" }}>
            {session.profile.first_name} {session.profile.last_name}
          </span>
          <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ background: "var(--egov-blue)", color: "#fff" }}>
            Official
          </span>
          <button type="button" onClick={logout} className="text-xs px-3 py-1.5 rounded-full" style={{ border: "1px solid var(--egov-line)", color: "var(--egov-muted)" }}>
            Sign out
          </button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto p-6 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <select
              value={selectedCampaignId ?? ""}
              onChange={(e) => setSelectedCampaignId(e.target.value || null)}
              className="px-3 py-2 text-xs"
              style={{ border: "1px solid var(--egov-line)", borderRadius: "calc(var(--egov-radius) * 0.4)" }}
            >
              <option value="">Select campaign...</option>
              {campaigns.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.status})
                </option>
              ))}
            </select>
            {selectedCampaign?.status === "active" && (
              <button type="button" onClick={handleClose} className="px-3 py-2 text-xs font-medium" style={{ color: "var(--egov-red)" }}>
                Close Campaign
              </button>
            )}
          </div>
          <button
            type="button"
            onClick={() => setShowBuilder(!showBuilder)}
            className="px-4 py-2 text-xs font-medium text-white"
            style={{ background: "var(--egov-blue)", borderRadius: "calc(var(--egov-radius) * 0.4)" }}
          >
            {showBuilder ? "Cancel" : "+ New Campaign"}
          </button>
        </div>

        {showBuilder && (
          <CampaignBuilder
            onDone={async () => {
              setShowBuilder(false)
              await refetchCampaigns()
            }}
          />
        )}

        {!showBuilder && selectedCampaign && (
          <>
            {loading ? (
              <p className="text-xs text-center py-8" style={{ color: "var(--egov-muted)" }}>Loading...</p>
            ) : data ? (
              <>
                <div className="grid grid-cols-3 gap-4">
                  {[
                    { label: "Active campaigns", value: campaigns.filter((c) => c.status === "active").length },
                    { label: "Affected households", value: data.totalAffected },
                    { label: "Non-respondents", value: data.nonRespondents.length },
                  ].map((m) => (
                    <div key={m.label} className="p-4" style={cardStyle}>
                      <p className="text-xs" style={{ color: "var(--egov-muted)" }}>{m.label}</p>
                      <p className="text-2xl font-bold mt-1" style={{ color: "var(--egov-ink)" }}>{m.value}</p>
                    </div>
                  ))}
                </div>

                <div className="p-4" style={cardStyle}>
                  <h3 className="text-xs font-bold mb-2" style={{ color: "var(--egov-ink)" }}>Need Breakdown</h3>
                  <div className="flex gap-4">
                    {(["shelter", "medical", "food_water"] as NeedCategory[]).map((cat) => (
                      <div key={cat} className="text-center">
                        <p className="text-lg font-bold" style={{ color: "var(--egov-blue)" }}>{data.byNeedType[cat]}</p>
                        <p className="text-xs" style={{ color: "var(--egov-muted)" }}>{cat.replace("_", " / ")}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex gap-2">
                  <select
                    value={filterNeed}
                    onChange={(e) => setFilterNeed(e.target.value as NeedCategory | "")}
                    className="px-3 py-2 text-xs"
                    style={{ border: "1px solid var(--egov-line)", borderRadius: "calc(var(--egov-radius) * 0.4)" }}
                  >
                    <option value="">All needs</option>
                    <option value="shelter">Shelter</option>
                    <option value="medical">Medical</option>
                    <option value="food_water">Food / Water</option>
                  </select>
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value as CheckInStatus | "")}
                    className="px-3 py-2 text-xs"
                    style={{ border: "1px solid var(--egov-line)", borderRadius: "calc(var(--egov-radius) * 0.4)" }}
                  >
                    <option value="">All statuses</option>
                    <option value="unresolved">Unresolved</option>
                    <option value="visited">Visited</option>
                    <option value="resolved">Resolved</option>
                  </select>
                  <button type="button" onClick={handleExport} className="px-3 py-2 text-xs font-medium" style={{ border: "1px solid var(--egov-line)", borderRadius: "calc(var(--egov-radius) * 0.4)", color: "var(--egov-muted)" }}>
                    Export CSV
                  </button>
                </div>

                <div className="p-4" style={cardStyle}>
                  <h3 className="text-xs font-bold mb-2" style={{ color: "var(--egov-ink)" }}>Affected Households ({filteredRows.length})</h3>
                  {filteredRows.length === 0 ? (
                    <p className="text-xs" style={{ color: "var(--egov-muted)" }}>No affected households yet.</p>
                  ) : (
                    <div className="flex flex-col gap-2">
                      {filteredRows.map((row) => (
                        <div key={row.checkInId} className="flex items-center justify-between p-3" style={{ border: "1px solid var(--egov-line)", borderRadius: "calc(var(--egov-radius) * 0.3)" }}>
                          <div>
                            <p className="text-xs font-medium" style={{ color: "var(--egov-ink)" }}>
                              {row.household.household_head_name}
                            </p>
                            <p className="text-xs" style={{ color: "var(--egov-muted)" }}>{row.household.address}</p>
                            <div className="flex gap-1 mt-1">
                              {row.needs.map((need) => (
                                <span key={need} className="text-xs px-1.5 py-0.5 rounded" style={{ background: "var(--egov-soft)", color: "var(--egov-blue)" }}>
                                  {need}
                                </span>
                              ))}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs px-2 py-0.5 rounded-full" style={{
                              background: row.status === "resolved" ? "#138a4b" : row.status === "visited" ? "var(--egov-gold)" : "var(--egov-red)",
                              color: "#fff",
                            }}>
                              {row.status}
                            </span>
                            {row.status !== "resolved" && (
                              <button
                                type="button"
                                onClick={() => handleAdvanceStatus(row.checkInId, row.status)}
                                className="text-xs px-2 py-1"
                                style={{ border: "1px solid var(--egov-line)", borderRadius: "calc(var(--egov-radius) * 0.3)", color: "var(--egov-muted)" }}
                              >
                                Advance →
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {data.nonRespondents.length > 0 && (
                  <div className="p-4" style={cardStyle}>
                    <h3 className="text-xs font-bold mb-2" style={{ color: "var(--egov-ink)" }}>
                      Non-Respondents ({data.nonRespondents.length})
                    </h3>
                    <div className="flex flex-col gap-1">
                      {data.nonRespondents.map((hh) => (
                        <div key={hh.id} className="flex justify-between text-xs">
                          <span style={{ color: "var(--egov-ink)" }}>{hh.household_head_name}</span>
                          <span style={{ color: "var(--egov-muted)" }}>{hh.address}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            ) : null}
          </>
        )}

        {!showBuilder && !selectedCampaign && (
          <div className="p-6 text-center" style={cardStyle}>
            <p className="text-sm" style={{ color: "var(--egov-muted)" }}>
              Select a campaign or create a new one to view the dashboard.
            </p>
          </div>
        )}
      </main>
    </div>
  )
}
