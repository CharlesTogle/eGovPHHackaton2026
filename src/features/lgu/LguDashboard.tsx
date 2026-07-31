import { useEffect, useMemo, useState } from 'react'
import { Shell } from '@/components/Shell'
import { useSession } from '@/features/auth/session-context'
import { useHandaStore } from '@/shared'
import { buildLguIncidentRows, summarizeNeededSupplies } from '@/features/demo/historical-selectors'

type LguTab = 'dashboard' | 'developers'
type DeveloperApplicationStatus = 'pending' | 'accepted' | 'rejected'

type DeveloperApplication = {
  id: string
  organization: string
  contact: string
  barangay: string
  municipalityCode: string
  requestedAccess: string[]
  useCase: string
  submittedAt: string
  status: DeveloperApplicationStatus
}

const MOCK_DEVELOPER_APPLICATIONS: DeveloperApplication[] = [
  {
    id: 'lgu-dev-001',
    organization: 'CityData PH',
    contact: 'alyssa@citydata.ph',
    barangay: 'Poblacion',
    municipalityCode: '0105503000',
    requestedAccess: ['/v1/lgu/incidents', '/v1/lgu/aggregates', '/v1/lgu/live'],
    useCase: 'Mirror LGU-wide disaster metrics inside the city command wall and dispatch board.',
    submittedAt: '2026-07-30T09:15:00Z',
    status: 'pending',
  },
  {
    id: 'lgu-dev-002',
    organization: 'RescueOps',
    contact: 'ops@rescueops.ph',
    barangay: 'Lucap',
    municipalityCode: '0105503000',
    requestedAccess: ['/v1/lgu/assessments', '/v1/lgu/non-respondents'],
    useCase: 'Feed unreached household lists to field responders during municipal operations.',
    submittedAt: '2026-07-29T06:45:00Z',
    status: 'accepted',
  },
  {
    id: 'lgu-dev-003',
    organization: 'Kawit Systems',
    contact: 'hello@kawit.systems',
    barangay: 'Toclong',
    municipalityCode: '0421110000',
    requestedAccess: ['/v1/lgu/aggregates'],
    useCase: 'Prototype municipality-level rollups for executive dashboards.',
    submittedAt: '2026-07-28T11:00:00Z',
    status: 'rejected',
  },
]

const STORAGE_KEY = 'handa_lgu_developer_applications'

function loadDeveloperApplications() {
  if (typeof window === 'undefined') return MOCK_DEVELOPER_APPLICATIONS
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return MOCK_DEVELOPER_APPLICATIONS
    const stored = JSON.parse(raw) as DeveloperApplication[]
    const byId = new Map(stored.map(app => [app.id, app]))
    return MOCK_DEVELOPER_APPLICATIONS.map(app => byId.get(app.id) ?? app)
  } catch {
    return MOCK_DEVELOPER_APPLICATIONS
  }
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
}

export function LguDashboard() {
  const { session, logout } = useSession()
  const { data, getDashboard, loading } = useHandaStore()
  const [tab, setTab] = useState<LguTab>('dashboard')
  const [applications, setApplications] = useState<DeveloperApplication[]>(loadDeveloperApplications)
  const [selectedApplicationId, setSelectedApplicationId] = useState<string | null>(null)
  const [toastMsg, setToastMsg] = useState('')

  const profile = session?.profile

  const visibleApplications = useMemo(
    () => (profile ? applications.filter(application => application.municipalityCode === profile.municipality_code) : []),
    [applications, profile],
  )
  const pendingApplications = visibleApplications.filter(application => application.status === 'pending')
  const selectedApplication = selectedApplicationId
    ? applications.find(application => application.id === selectedApplicationId) ?? null
    : null

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(applications))
  }, [applications])

  const incidentRows = useMemo(
    () => buildLguIncidentRows({ campaigns: data.campaigns, getDashboard }),
    [data.campaigns, getDashboard],
  )
  const neededSupplies = useMemo(() => summarizeNeededSupplies(incidentRows), [incidentRows])

  const totals = incidentRows.reduce(
    (acc, incident) => ({
      disasters: acc.disasters + 1,
      affected: acc.affected + incident.historicalAffectedPeople,
      checkIns: acc.checkIns + incident.assessmentCheckIns,
      unresolved: acc.unresolved + incident.unresolved,
      visited: acc.visited + incident.visited,
      resolved: acc.resolved + incident.resolved,
      barangays: acc.barangays + 1,
    }),
    { disasters: 0, affected: 0, checkIns: 0, unresolved: 0, visited: 0, resolved: 0, barangays: 0 },
  )

  if (!session || !profile) return null

  const official = {
    name: `${profile.first_name} ${profile.last_name}`,
    uniqid: profile.uniqid,
    role: 'lgu',
    barangay_code: profile.municipality_code,
  }

  function showToast(msg: string) {
    setToastMsg(msg)
    setTimeout(() => setToastMsg(''), 2400)
  }

  function updateApplicationStatus(applicationId: string, status: DeveloperApplicationStatus) {
    setApplications(current => current.map(application => (
      application.id === applicationId ? { ...application, status } : application
    )))
    showToast(`Developer application ${status}.`)
  }

  return (
    <>
      <Shell official={official} sidebarTab={tab === 'developers' ? 'developers' : 'dashboard'} onNavigate={nextTab => setTab(nextTab === 'developers' ? 'developers' : 'dashboard')} onLogout={logout} role="lgu">
        {tab === 'dashboard' && (
          <div>
            <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <span className="status-chip open">Shared demo data</span>
                  <span className="status-chip" style={{ background: '#eef2ff', color: '#42506a' }}>Parent LGU view</span>
                </div>
                <h2 style={{ margin: '0 0 4px', fontSize: 'clamp(22px, 4vw, 30px)', letterSpacing: '-0.05em' }}>LGU Incident Command Dashboard</h2>
                <p style={{ color: '#556075', lineHeight: 1.5, fontSize: '14px', maxWidth: '720px' }}>
                  Municipality-wide visibility across child barangays, aligned with the Layer 2 parent LGU dashboard in the system specification.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mt-5 mb-6">
              <div className="section-card p-5">
                <span className="text-xs font-semibold text-[var(--muted-text)] block mb-1">Disasters Recorded</span>
                <strong className="text-3xl font-extrabold text-[var(--blue-primary)]">{totals.disasters}</strong>
              </div>
              <div className="section-card p-5">
                <span className="text-xs font-semibold text-[var(--muted-text)] block mb-1">Historical People Affected</span>
                <strong className="text-3xl font-extrabold text-[var(--danger)]">{totals.affected.toLocaleString()}</strong>
              </div>
              <div className="section-card p-5">
                <span className="text-xs font-semibold text-[var(--muted-text)] block mb-1">Assessment Check-ins</span>
                <strong className="text-3xl font-extrabold text-[var(--warn)]">{totals.checkIns.toLocaleString()}</strong>
              </div>
              <div className="section-card p-5">
                <span className="text-xs font-semibold text-[var(--muted-text)] block mb-1">Incidents Synced</span>
                <strong className="text-3xl font-extrabold text-[var(--good)]">{totals.barangays}</strong>
              </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.8fr)] gap-4">
              <div className="section-card overflow-hidden">
                <div className="p-4" style={{ borderBottom: '1px solid #edf1f8' }}>
                  <h3 style={{ margin: 0 }}>Affected people per disaster</h3>
                  <p style={{ margin: '6px 0 0', color: 'var(--muted-text)', fontSize: '13px' }}>Each row comes from the same seeded assessments shown in the assessment builder.</p>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[960px] border-collapse text-sm">
                    <thead>
                      <tr>
                        <th className="text-left py-3 px-4 font-bold" style={{ color: '#4b5568', background: '#f8faff', borderBottom: '1px solid #edf1f8' }}>Disaster</th>
                        <th className="text-left py-3 px-4 font-bold" style={{ color: '#4b5568', background: '#f8faff', borderBottom: '1px solid #edf1f8' }}>Date</th>
                        <th className="text-left py-3 px-4 font-bold" style={{ color: '#4b5568', background: '#f8faff', borderBottom: '1px solid #edf1f8' }}>Location</th>
                        <th className="text-left py-3 px-4 font-bold" style={{ color: '#4b5568', background: '#f8faff', borderBottom: '1px solid #edf1f8' }}>Historical Affected</th>
                        <th className="text-left py-3 px-4 font-bold" style={{ color: '#4b5568', background: '#f8faff', borderBottom: '1px solid #edf1f8' }}>Check-ins</th>
                        <th className="text-left py-3 px-4 font-bold" style={{ color: '#4b5568', background: '#f8faff', borderBottom: '1px solid #edf1f8' }}>eReport</th>
                        <th className="text-left py-3 px-4 font-bold" style={{ color: '#4b5568', background: '#f8faff', borderBottom: '1px solid #edf1f8' }}>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {incidentRows.map(incident => (
                        <tr key={incident.id} style={{ borderBottom: '1px solid #edf1f8' }}>
                          <td className="py-3 px-4">
                            <strong style={{ display: 'block', color: 'var(--ink)' }}>{incident.disaster}</strong>
                          </td>
                          <td className="py-3 px-4" style={{ color: '#556075' }}>{formatDate(incident.happenedOn)}</td>
                          <td className="py-3 px-4" style={{ color: '#556075' }}>{incident.locationLabel}</td>
                          <td className="py-3 px-4" style={{ color: 'var(--blue-2)', fontWeight: 700 }}>{incident.historicalAffectedPeople.toLocaleString()}</td>
                          <td className="py-3 px-4" style={{ color: '#556075', fontWeight: 700 }}>{incident.assessmentCheckIns.toLocaleString()}</td>
                          <td className="py-3 px-4"><code style={{ padding: '4px 8px', borderRadius: '999px', background: '#eef2ff', color: '#42506a', fontSize: '12px' }}>{incident.ereportReportType}</code></td>
                          <td className="py-3 px-4">
                            <span className={`status-chip ${incident.status === 'active' ? 'open' : incident.status === 'closed' ? 'good' : 'warn'}`}>
                              {incident.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                      {incidentRows.length === 0 && (
                        <tr>
                          <td colSpan={7} className="py-6 px-4 text-center" style={{ color: 'var(--muted-text)' }}>No shared assessment incidents available.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="section-card">
                <div className="p-4" style={{ borderBottom: '1px solid #edf1f8' }}>
                  <h3 style={{ margin: 0 }}>People per status</h3>
                  <p style={{ margin: '6px 0 0', color: 'var(--muted-text)', fontSize: '13px' }}>Live assessment totals computed from the same seeded incidents.</p>
                </div>
                <div className="p-4 flex flex-col gap-3">
                  <div className="rounded-[18px] p-4" style={{ border: '1px solid #edf1f8', background: '#fff7e8' }}>
                    <strong style={{ display: 'block', fontSize: '26px', letterSpacing: '-0.04em', color: '#9a6700' }}>{totals.unresolved.toLocaleString()}</strong>
                    <span style={{ color: '#7a5d20', fontWeight: 700, fontSize: '14px' }}>Unresolved</span>
                  </div>
                  <div className="rounded-[18px] p-4" style={{ border: '1px solid #edf1f8', background: '#f0f4ff' }}>
                    <strong style={{ display: 'block', fontSize: '26px', letterSpacing: '-0.04em', color: 'var(--blue-2)' }}>{totals.visited.toLocaleString()}</strong>
                    <span style={{ color: '#42506a', fontWeight: 700, fontSize: '14px' }}>Visited</span>
                  </div>
                  <div className="rounded-[18px] p-4" style={{ border: '1px solid #edf1f8', background: '#edf9f1' }}>
                    <strong style={{ display: 'block', fontSize: '26px', letterSpacing: '-0.04em', color: 'var(--good)' }}>{totals.resolved.toLocaleString()}</strong>
                    <span style={{ color: '#24613c', fontWeight: 700, fontSize: '14px' }}>Resolved</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="section-card mt-4">
              <div className="p-4" style={{ borderBottom: '1px solid #edf1f8' }}>
                <h3 style={{ margin: 0 }}>Priority needed supplies</h3>
                <p style={{ margin: '6px 0 0', color: 'var(--muted-text)', fontSize: '13px' }}>Shared supply requests aggregated from the current historical incident set.</p>
              </div>
              <div className="p-4 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                {neededSupplies.map(supply => (
                  <div key={supply.label} className="rounded-[18px] p-4" style={{ border: '1px solid #edf1f8', background: '#fff' }}>
                    <strong style={{ display: 'block', fontSize: '15px', color: 'var(--ink)' }}>{supply.label}</strong>
                    <span style={{ display: 'block', marginTop: '6px', color: 'var(--blue-2)', fontWeight: 800, fontSize: '20px' }}>{supply.quantity}</span>
                    <span style={{ display: 'block', marginTop: '4px', color: 'var(--muted-text)', fontSize: '12px' }}>
                      Referenced by {supply.incidentCount} {supply.incidentCount === 1 ? 'incident' : 'incidents'}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {loading && (
              <p style={{ marginTop: '12px', color: 'var(--muted-text)', fontSize: '13px' }}>Refreshing shared assessment data...</p>
            )}
          </div>
        )}

        {tab === 'developers' && (
          <div>
            <h2 style={{ margin: '0 0 4px', fontSize: 'clamp(20px, 4vw, 28px)', letterSpacing: '-0.04em' }}>Developer apps</h2>
            <p style={{ color: '#556075', lineHeight: 1.45, fontSize: '14px' }}>
              Municipality-scoped app requests, modeled after the barangay-level developer application review flow.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4 mb-4">
              <div className="section-card p-[18px]" style={{ border: '1px solid var(--line)', background: '#fff' }}>
                <strong style={{ display: 'block', fontSize: 'clamp(26px, 5vw, 36px)', color: 'var(--blue-2)', letterSpacing: '-0.05em' }}>{visibleApplications.length}</strong>
                <span style={{ color: 'var(--muted-text)', fontWeight: 700, fontSize: '14px' }}>Applications</span>
              </div>
              <div className="section-card p-[18px]" style={{ border: '1px solid var(--line)', background: '#fff' }}>
                <strong style={{ display: 'block', fontSize: 'clamp(26px, 5vw, 36px)', color: 'var(--warn)', letterSpacing: '-0.05em' }}>{visibleApplications.filter(application => application.status === 'pending').length}</strong>
                <span style={{ color: 'var(--muted-text)', fontWeight: 700, fontSize: '14px' }}>Pending</span>
              </div>
              <div className="section-card p-[18px]" style={{ border: '1px solid var(--line)', background: '#fff' }}>
                <strong style={{ display: 'block', fontSize: 'clamp(26px, 5vw, 36px)', color: 'var(--good)', letterSpacing: '-0.05em' }}>{visibleApplications.filter(application => application.status === 'accepted').length}</strong>
                <span style={{ color: 'var(--muted-text)', fontWeight: 700, fontSize: '14px' }}>Accepted</span>
              </div>
            </div>

            <div className="section-card">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4" style={{ borderBottom: '1px solid #edf1f8' }}>
                <div>
                  <h3 style={{ margin: 0, padding: 0, borderBottom: 'none' }}>Application queue</h3>
                  <p style={{ margin: '6px 0 0', color: 'var(--muted-text)', fontSize: '13px' }}>Saved in local browser storage for the demo flow.</p>
                </div>
                <span className={`status-chip ${pendingApplications.length > 0 ? 'open' : 'good'}`}>
                  {pendingApplications.length} pending
                </span>
              </div>
              <div className="p-4">
                {visibleApplications.length === 0 ? (
                  <div className="empty-state-box text-center">
                    <p style={{ color: '#556075', fontSize: '14px', margin: 0 }}>No developer applications for this LGU yet.</p>
                  </div>
                ) : (
                  <div className="flex flex-col gap-3">
                    {visibleApplications.map(application => (
                      <div key={application.id} className="rounded-[18px] p-4" style={{ border: '1px solid #edf1f8', background: '#fff' }}>
                        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                          <div>
                            <div className="flex flex-wrap items-center gap-2">
                              <strong style={{ fontSize: '15px', color: 'var(--ink)' }}>{application.organization}</strong>
                              <span className={`status-chip ${application.status === 'accepted' ? 'good' : application.status === 'rejected' ? 'danger' : 'open'}`}>
                                {application.status}
                              </span>
                            </div>
                            <p style={{ margin: '6px 0 0', color: 'var(--muted-text)', fontSize: '13px' }}>{application.contact} • {application.barangay}</p>
                            <p style={{ margin: '6px 0 0', color: '#42506a', fontSize: '13px', lineHeight: 1.5 }}>{application.useCase}</p>
                          </div>
                          <div className="flex flex-wrap gap-2 lg:justify-end">
                            <button className="pill-btn ghost" style={{ fontSize: '12px', padding: '8px 12px' }} onClick={() => setSelectedApplicationId(application.id)}>Read</button>
                            <button
                              className="pill-btn primary"
                              style={{ fontSize: '12px', padding: '8px 12px', opacity: application.status === 'accepted' ? 0.55 : 1 }}
                              onClick={() => updateApplicationStatus(application.id, 'accepted')}
                              disabled={application.status === 'accepted'}
                            >
                              Accept
                            </button>
                            <button
                              className="pill-btn danger"
                              style={{ fontSize: '12px', padding: '8px 12px', opacity: application.status === 'rejected' ? 0.55 : 1 }}
                              onClick={() => updateApplicationStatus(application.id, 'rejected')}
                              disabled={application.status === 'rejected'}
                            >
                              Reject
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        <nav className="bottom-toolbar md:hidden">
          <button className={`toolbar-tab ${tab === 'dashboard' ? 'active' : ''}`} onClick={() => setTab('dashboard')}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="7" height="7" rx="1"/>
              <rect x="14" y="3" width="7" height="7" rx="1"/>
              <rect x="3" y="14" width="7" height="7" rx="1"/>
              <rect x="14" y="14" width="7" height="7" rx="1"/>
            </svg>
            <span>Dashboard</span>
          </button>
          <button className={`toolbar-tab ${tab === 'developers' ? 'active' : ''}`} onClick={() => setTab('developers')}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
              <circle cx="8.5" cy="7" r="4"/>
              <path d="M20 8v6"/>
              <path d="M23 11h-6"/>
            </svg>
            <span>Developers</span>
          </button>
        </nav>
      </Shell>

      {selectedApplication && (
        <div className="modal-overlay" onClick={() => setSelectedApplicationId(null)}>
          <div className="modal-card" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2>Developer application</h2>
              <button className="pill-btn ghost" style={{ fontSize: '12px', padding: '6px 12px' }} onClick={() => setSelectedApplicationId(null)}>Close</button>
            </div>

            <div className="flex flex-col gap-4">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <strong style={{ fontSize: '16px', color: 'var(--ink)' }}>{selectedApplication.organization}</strong>
                  <span className={`status-chip ${selectedApplication.status === 'accepted' ? 'good' : selectedApplication.status === 'rejected' ? 'danger' : 'open'}`}>
                    {selectedApplication.status}
                  </span>
                </div>
                <p style={{ margin: '6px 0 0', color: 'var(--muted-text)', fontSize: '13px' }}>{selectedApplication.barangay}</p>
              </div>

              <div className="rounded-[16px] p-4" style={{ background: '#f8faff', border: '1px solid var(--line)' }}>
                <p style={{ margin: 0, fontSize: '13px', color: '#42506a' }}><strong>Email:</strong> {selectedApplication.contact}</p>
                <p style={{ margin: '8px 0 0', fontSize: '13px', color: '#42506a' }}><strong>Municipality:</strong> {selectedApplication.municipalityCode}</p>
                <p style={{ margin: '8px 0 0', fontSize: '13px', color: '#42506a' }}><strong>Submitted:</strong> {new Date(selectedApplication.submittedAt).toLocaleString()}</p>
              </div>

              <div>
                <p style={{ margin: 0, fontSize: '13px', fontWeight: 700, color: 'var(--ink)' }}>Use case</p>
                <p style={{ margin: '8px 0 0', fontSize: '14px', color: '#556075', lineHeight: 1.55 }}>{selectedApplication.useCase}</p>
              </div>

              <div>
                <p style={{ margin: 0, fontSize: '13px', fontWeight: 700, color: 'var(--ink)' }}>Requested endpoints</p>
                <div className="flex flex-wrap gap-2 mt-3">
                  {selectedApplication.requestedAccess.map(endpoint => (
                    <code key={endpoint} style={{ padding: '6px 10px', borderRadius: '999px', background: '#eef2ff', color: '#42506a', fontSize: '12px', fontFamily: "'JetBrains Mono', monospace" }}>{endpoint}</code>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-5">
              <button
                className="big-btn primary"
                onClick={() => updateApplicationStatus(selectedApplication.id, 'accepted')}
                disabled={selectedApplication.status === 'accepted'}
                style={selectedApplication.status === 'accepted' ? { opacity: 0.55, cursor: 'not-allowed' } : undefined}
              >
                Accept
              </button>
              <button
                className="big-btn danger"
                onClick={() => updateApplicationStatus(selectedApplication.id, 'rejected')}
                disabled={selectedApplication.status === 'rejected'}
                style={selectedApplication.status === 'rejected' ? { opacity: 0.55, cursor: 'not-allowed' } : undefined}
              >
                Reject
              </button>
              <button className="big-btn ghost" onClick={() => setSelectedApplicationId(null)}>Done</button>
            </div>
          </div>
        </div>
      )}

      {toastMsg && <div className="toast-bar left-4 right-4 md:left-auto md:right-6 md:max-w-[360px]">{toastMsg}</div>}
    </>
  )
}
