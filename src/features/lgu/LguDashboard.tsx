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
  cityName: string
  barangay: string
  municipalityCode: string
  requestedAccess: string[]
  useCase: string
  submittedAt: string
  status: DeveloperApplicationStatus
}

const MOCK_DEVELOPER_APPLICATIONS: DeveloperApplication[] = [
  // Tacloban City (0803747000)
  {
    id: 'lgu-dev-tac-001',
    organization: 'CityData PH - Eastern Visayas',
    contact: 'alyssa@citydata.ph',
    cityName: 'Tacloban City',
    barangay: 'Brgy. 83 (San Jose)',
    municipalityCode: '0803747000',
    requestedAccess: ['/v1/lgu/incidents', '/v1/lgu/aggregates', '/v1/lgu/live'],
    useCase: 'Mirror LGU-wide disaster metrics inside the city command wall and dispatch board for San Jose coastal surge operations.',
    submittedAt: '2026-07-30T09:15:00Z',
    status: 'pending',
  },
  {
    id: 'lgu-dev-tac-002',
    organization: 'RescueOps Tacloban',
    contact: 'ops@rescueops.ph',
    cityName: 'Tacloban City',
    barangay: 'Brgy. 84 (Sagkahan)',
    municipalityCode: '0803747000',
    requestedAccess: ['/v1/lgu/assessments', '/v1/lgu/non-respondents'],
    useCase: 'Feed unreached household lists to rapid field responders during municipal coastal evacuation in Sagkahan.',
    submittedAt: '2026-07-29T06:45:00Z',
    status: 'accepted',
  },
  {
    id: 'lgu-dev-tac-003',
    organization: 'Anibong Community Tech Network',
    contact: 'dev@anibongtech.ph',
    cityName: 'Tacloban City',
    barangay: 'Brgy. 88 (Anibong)',
    municipalityCode: '0803747000',
    requestedAccess: ['/v1/lgu/aggregates', '/v1/lgu/supplies'],
    useCase: 'Integrate shoreline flood gauges and relief pack distribution checklists for hillside households.',
    submittedAt: '2026-07-28T14:20:00Z',
    status: 'pending',
  },

  // Cagayan de Oro City (1004305000)
  {
    id: 'lgu-dev-cdo-001',
    organization: 'CDO RiverWatch Systems',
    contact: 'ops@cdo-riverwatch.ph',
    cityName: 'Cagayan de Oro City',
    barangay: 'Brgy. Macasandig',
    municipalityCode: '1004305000',
    requestedAccess: ['/v1/lgu/incidents', '/v1/lgu/aggregates'],
    useCase: 'Prototype municipality-level rollups for executive flood response and riverbank water level alerts in Macasandig.',
    submittedAt: '2026-07-28T11:00:00Z',
    status: 'accepted',
  },
  {
    id: 'lgu-dev-cdo-002',
    organization: 'Carmen Community Volunteer Brigade',
    contact: 'help@carmenbrigade.ph',
    cityName: 'Cagayan de Oro City',
    barangay: 'Brgy. Carmen',
    municipalityCode: '1004305000',
    requestedAccess: ['/v1/lgu/assessments', '/v1/lgu/live'],
    useCase: 'Coordinate volunteer rescue boats and route medical aid to flooded puroks in Brgy. Carmen.',
    submittedAt: '2026-07-27T10:30:00Z',
    status: 'pending',
  },
  {
    id: 'lgu-dev-cdo-003',
    organization: 'Northern Mindanao Urban Analytics',
    contact: 'analytics@nm-urban.ph',
    cityName: 'Cagayan de Oro City',
    barangay: 'Brgy. Lapasan',
    municipalityCode: '1004305000',
    requestedAccess: ['/v1/lgu/aggregates', '/v1/lgu/non-respondents'],
    useCase: 'Analyze highway drainage backflow and unreached residential compounds along eastern CDO.',
    submittedAt: '2026-07-26T16:00:00Z',
    status: 'rejected',
  },

  // Tagbilaran City (0701200001)
  {
    id: 'lgu-dev-tag-001',
    organization: 'Tagbilaran SmartCommand GIS',
    contact: 'support@tagbilaransmart.gov',
    cityName: 'Tagbilaran City',
    barangay: 'Brgy. Cogon',
    municipalityCode: '0701200001',
    requestedAccess: ['/v1/lgu/incidents', '/v1/lgu/assessments'],
    useCase: 'Integrate real-time post-disaster check-in feeds with city-wide GIS maps for rapid building structural triage.',
    submittedAt: '2026-07-27T08:30:00Z',
    status: 'accepted',
  },
  {
    id: 'lgu-dev-tag-002',
    organization: 'Bohol QuakeNet Logistics',
    contact: 'coord@quakenet.org.ph',
    cityName: 'Tagbilaran City',
    barangay: 'Brgy. Poblacion I',
    municipalityCode: '0701200001',
    requestedAccess: ['/v1/lgu/aggregates', '/v1/lgu/live'],
    useCase: 'Distribute generator power access and temporary shelter kits across Poblacion I commercial and residential zones.',
    submittedAt: '2026-07-26T12:15:00Z',
    status: 'pending',
  },
  {
    id: 'lgu-dev-tag-003',
    organization: 'Bool Coastal Disaster Council',
    contact: 'watch@boolcoastal.ph',
    cityName: 'Tagbilaran City',
    barangay: 'Brgy. Bool',
    municipalityCode: '0701200001',
    requestedAccess: ['/v1/lgu/assessments', '/v1/lgu/supplies'],
    useCase: 'Monitor storm surge sandbagging supply requests and displaced family headcounts in Brgy. Bool.',
    submittedAt: '2026-07-25T09:40:00Z',
    status: 'pending',
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
  const [selectedCity, setSelectedCity] = useState<string>('all')
  const [applications, setApplications] = useState<DeveloperApplication[]>(loadDeveloperApplications)
  const [selectedApplicationId, setSelectedApplicationId] = useState<string | null>(null)
  const [toastMsg, setToastMsg] = useState('')

  const profile = session?.profile

  const visibleApplications = useMemo(() => {
    if (selectedCity === 'all') return applications
    return applications.filter(application => application.cityName === selectedCity)
  }, [applications, selectedCity])

  const pendingApplications = visibleApplications.filter(application => application.status === 'pending')
  const selectedApplication = selectedApplicationId
    ? applications.find(application => application.id === selectedApplicationId) ?? null
    : null

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(applications))
  }, [applications])

  const allIncidentRows = useMemo(
    () => buildLguIncidentRows({ campaigns: data.campaigns, getDashboard }),
    [data.campaigns, getDashboard],
  )

  const availableCities = useMemo(() => {
    const cities = Array.from(new Set(allIncidentRows.map(r => r.cityName))).filter(Boolean)
    return cities
  }, [allIncidentRows])

  const incidentRows = useMemo(() => {
    if (selectedCity === 'all') return allIncidentRows
    return allIncidentRows.filter(r => r.cityName === selectedCity)
  }, [allIncidentRows, selectedCity])

  const affectedBarangays = useMemo(() => {
    const map = new Map<string, { label: string; city: string; count: number }>()
    for (const row of incidentRows) {
      const existing = map.get(row.locationLabel)
      if (existing) {
        existing.count += 1
      } else {
        map.set(row.locationLabel, {
          label: row.locationLabel,
          city: row.cityName,
          count: 1,
        })
      }
    }
    return Array.from(map.values())
  }, [incidentRows])

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
                  <span className="status-chip open">City & Barangay Scoped</span>
                  <span className="status-chip" style={{ background: '#eef2ff', color: '#42506a' }}>Parent LGU view</span>
                </div>
                <h2 style={{ margin: '0 0 4px', fontSize: 'clamp(22px, 4vw, 30px)', letterSpacing: '-0.05em' }}>LGU Incident Command Dashboard</h2>
                <p style={{ color: '#556075', lineHeight: 1.5, fontSize: '14px', maxWidth: '760px' }}>
                  Municipality-wide visibility across child barangays. Incidents are organized per sample city and mapped to their specific affected barangays.
                </p>
              </div>
            </div>

            {/* City Selection Pills */}
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider mr-1">Jurisdiction Filter:</span>
              <button
                type="button"
                onClick={() => setSelectedCity('all')}
                className={`px-3 py-1.5 rounded-full text-xs transition-all ${
                  selectedCity === 'all'
                    ? 'bg-blue-50 text-[var(--blue-2)] border-2 border-[var(--blue-2)] font-bold shadow-xs'
                    : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 font-medium'
                }`}
              >
                All Jurisdictions ({allIncidentRows.length} incidents)
              </button>
              {availableCities.map(city => {
                const count = allIncidentRows.filter(r => r.cityName === city).length
                const isSelected = selectedCity === city
                return (
                  <button
                    key={city}
                    type="button"
                    onClick={() => setSelectedCity(city)}
                    className={`px-3 py-1.5 rounded-full text-xs transition-all ${
                      isSelected
                        ? 'bg-blue-50 text-[var(--blue-2)] border-2 border-[var(--blue-2)] font-bold shadow-xs'
                        : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 font-medium'
                    }`}
                  >
                    {city} ({count} barangays)
                  </button>
                )
              })}
            </div>

            {/* Affected Barangays in Current Scope Summary Banner */}
            <div className="mt-4 p-4 rounded-2xl bg-gradient-to-r from-blue-50/80 to-slate-50 border border-blue-100 flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <strong className="text-xs font-bold text-blue-900 uppercase tracking-wider">
                    {selectedCity === 'all' ? 'Affected Barangays Across All Cities' : `Affected Barangays in ${selectedCity}`} ({affectedBarangays.length})
                  </strong>
                </div>
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {affectedBarangays.map(b => (
                    <span key={b.label} className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-white text-slate-700 border border-blue-200/70 shadow-2xs">
                      {b.label}
                    </span>
                  ))}
                </div>
              </div>
              <div className="text-right shrink-0">
                <span className="text-xs text-slate-500 block">Total Disaster Campaigns</span>
                <span className="text-lg font-black text-[var(--blue-2)]">{incidentRows.length} Active Feeds</span>
              </div>
            </div>

            {/* KPI Totals */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mt-5 mb-6">
              <div className="section-card p-5">
                <span className="text-xs font-semibold text-[var(--muted-text)] block mb-1">Disasters in Scope</span>
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
                <span className="text-xs font-semibold text-[var(--muted-text)] block mb-1">Barangay Incidents Synced</span>
                <strong className="text-3xl font-extrabold text-[var(--good)]">{totals.barangays}</strong>
              </div>
            </div>

            {/* Incidents Table (Widened with Vertical Scroller) + Status Breakdown (Shortened) */}
            <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_250px] gap-4 items-stretch">
              <div className="section-card overflow-hidden flex flex-col">
                <div className="p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 shrink-0" style={{ borderBottom: '1px solid #edf1f8' }}>
                  <div>
                    <h3 style={{ margin: 0 }}>Affected people per disaster</h3>
                    <p style={{ margin: '4px 0 0', color: 'var(--muted-text)', fontSize: '13px' }}>
                      Disaster incidents grouped by parent city and child barangay check-in streams.
                    </p>
                  </div>
                  <span className="text-xs font-medium text-slate-500">
                    Showing {incidentRows.length} incident{incidentRows.length === 1 ? '' : 's'}
                  </span>
                </div>
                <div className="overflow-x-auto overflow-y-auto max-h-[380px]">
                  <table className="w-full min-w-[880px] border-collapse text-sm">
                    <thead className="sticky top-0 z-10 bg-[#f8faff] shadow-2xs">
                      <tr>
                        <th className="text-left py-3 px-4 font-bold" style={{ color: '#4b5568', background: '#f8faff', borderBottom: '1px solid #edf1f8' }}>Disaster</th>
                        <th className="text-left py-3 px-4 font-bold" style={{ color: '#4b5568', background: '#f8faff', borderBottom: '1px solid #edf1f8' }}>Date</th>
                        <th className="text-left py-3 px-4 font-bold" style={{ color: '#4b5568', background: '#f8faff', borderBottom: '1px solid #edf1f8' }}>Barangay Location</th>
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
                            <span className="text-xs text-slate-400">{incident.cityName}</span>
                          </td>
                          <td className="py-3 px-4" style={{ color: '#556075' }}>{formatDate(incident.happenedOn)}</td>
                          <td className="py-3 px-4">
                            <span className="font-semibold text-slate-800">{incident.locationLabel}</span>
                          </td>
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
                          <td colSpan={7} className="py-6 px-4 text-center" style={{ color: 'var(--muted-text)' }}>No shared assessment incidents available for this jurisdiction.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="section-card flex flex-col justify-between">
                <div className="p-4 shrink-0" style={{ borderBottom: '1px solid #edf1f8' }}>
                  <h3 style={{ margin: 0, fontSize: '16px' }}>People per status</h3>
                  <p style={{ margin: '4px 0 0', color: 'var(--muted-text)', fontSize: '12px', lineHeight: 1.4 }}>
                    Live totals for selected scope.
                  </p>
                </div>
                <div className="p-4 flex flex-col gap-2.5 flex-1 justify-around">
                  <div className="rounded-[14px] p-3" style={{ border: '1px solid #fed7aa', background: '#fff7ed' }}>
                    <strong style={{ display: 'block', fontSize: '22px', letterSpacing: '-0.04em', color: '#9a6700' }}>{totals.unresolved.toLocaleString()}</strong>
                    <span style={{ color: '#7a5d20', fontWeight: 700, fontSize: '13px' }}>Unresolved</span>
                  </div>
                  <div className="rounded-[14px] p-3" style={{ border: '1px solid #bfdbfe', background: '#eff6ff' }}>
                    <strong style={{ display: 'block', fontSize: '22px', letterSpacing: '-0.04em', color: 'var(--blue-2)' }}>{totals.visited.toLocaleString()}</strong>
                    <span style={{ color: '#1e40af', fontWeight: 700, fontSize: '13px' }}>Visited</span>
                  </div>
                  <div className="rounded-[14px] p-3" style={{ border: '1px solid #bbf7d0', background: '#f0fdf4' }}>
                    <strong style={{ display: 'block', fontSize: '22px', letterSpacing: '-0.04em', color: 'var(--good)' }}>{totals.resolved.toLocaleString()}</strong>
                    <span style={{ color: '#166534', fontWeight: 700, fontSize: '13px' }}>Resolved</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Priority Needed Supplies */}
            <div className="section-card mt-4">
              <div className="p-4" style={{ borderBottom: '1px solid #edf1f8' }}>
                <h3 style={{ margin: 0 }}>Priority needed supplies</h3>
                <p style={{ margin: '6px 0 0', color: 'var(--muted-text)', fontSize: '13px' }}>
                  Shared supply requests aggregated from the selected barangays in scope.
                </p>
              </div>
              <div className="p-4 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                {neededSupplies.map((supply) => (
                  <div key={supply.label} className="rounded-[18px] p-4" style={{ border: '1px solid #edf1f8', background: '#fff' }}>
                    <strong style={{ display: 'block', fontSize: '15px', color: 'var(--ink)' }}>{supply.label}</strong>
                    <span style={{ display: 'block', marginTop: '6px', color: 'var(--blue-2)', fontWeight: 800, fontSize: '20px' }}>{supply.quantity}</span>
                    <span style={{ display: 'block', marginTop: '4px', color: 'var(--muted-text)', fontSize: '12px' }}>
                      Referenced by {supply.incidentCount} {supply.incidentCount === 1 ? 'barangay incident' : 'barangay incidents'}
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
            <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <span className="status-chip open">Layer 2 Partner Integration</span>
                  <span className="status-chip" style={{ background: '#eef2ff', color: '#42506a' }}>Municipal Review Queue</span>
                </div>
                <h2 style={{ margin: '0 0 4px', fontSize: 'clamp(20px, 4vw, 28px)', letterSpacing: '-0.04em' }}>Developer Applications</h2>
                <p style={{ color: '#556075', lineHeight: 1.45, fontSize: '14px', maxWidth: '760px' }}>
                  Municipal API partner requests grouped by sample city and child barangay use case. Review and grant LGU dataset credentials.
                </p>
              </div>
            </div>

            {/* City Selection Pills (Synced) */}
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider mr-1">Jurisdiction Filter:</span>
              <button
                type="button"
                onClick={() => setSelectedCity('all')}
                className={`px-3 py-1.5 rounded-full text-xs transition-all ${
                  selectedCity === 'all'
                    ? 'bg-blue-50 text-[var(--blue-2)] border-2 border-[var(--blue-2)] font-bold shadow-xs'
                    : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 font-medium'
                }`}
              >
                All Jurisdictions ({applications.length} apps)
              </button>
              {availableCities.map(city => {
                const count = applications.filter(a => a.cityName === city).length
                const isSelected = selectedCity === city
                return (
                  <button
                    key={city}
                    type="button"
                    onClick={() => setSelectedCity(city)}
                    className={`px-3 py-1.5 rounded-full text-xs transition-all ${
                      isSelected
                        ? 'bg-blue-50 text-[var(--blue-2)] border-2 border-[var(--blue-2)] font-bold shadow-xs'
                        : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 font-medium'
                    }`}
                  >
                    {city} ({count} apps)
                  </button>
                )
              })}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4 mb-4">
              <div className="section-card p-[18px]" style={{ border: '1px solid var(--line)', background: '#fff' }}>
                <strong style={{ display: 'block', fontSize: 'clamp(26px, 5vw, 36px)', color: 'var(--blue-2)', letterSpacing: '-0.05em' }}>{visibleApplications.length}</strong>
                <span style={{ color: 'var(--muted-text)', fontWeight: 700, fontSize: '14px' }}>
                  {selectedCity === 'all' ? 'Total Applications' : `${selectedCity} Applications`}
                </span>
              </div>
              <div className="section-card p-[18px]" style={{ border: '1px solid var(--line)', background: '#fff' }}>
                <strong style={{ display: 'block', fontSize: 'clamp(26px, 5vw, 36px)', color: 'var(--warn)', letterSpacing: '-0.05em' }}>{visibleApplications.filter(application => application.status === 'pending').length}</strong>
                <span style={{ color: 'var(--muted-text)', fontWeight: 700, fontSize: '14px' }}>Pending Review</span>
              </div>
              <div className="section-card p-[18px]" style={{ border: '1px solid var(--line)', background: '#fff' }}>
                <strong style={{ display: 'block', fontSize: 'clamp(26px, 5vw, 36px)', color: 'var(--good)', letterSpacing: '-0.05em' }}>{visibleApplications.filter(application => application.status === 'accepted').length}</strong>
                <span style={{ color: 'var(--muted-text)', fontWeight: 700, fontSize: '14px' }}>Approved & Active</span>
              </div>
            </div>

            <div className="section-card">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4" style={{ borderBottom: '1px solid #edf1f8' }}>
                <div>
                  <h3 style={{ margin: 0, padding: 0, borderBottom: 'none' }}>Application queue</h3>
                  <p style={{ margin: '6px 0 0', color: 'var(--muted-text)', fontSize: '13px' }}>
                    {selectedCity === 'all' ? 'Showing partner applications across all cities' : `Showing partner applications for ${selectedCity}`}
                  </p>
                </div>
                <span className={`status-chip ${pendingApplications.length > 0 ? 'open' : 'good'}`}>
                  {pendingApplications.length} pending
                </span>
              </div>
              <div className="p-4">
                {visibleApplications.length === 0 ? (
                  <div className="empty-state-box text-center">
                    <p style={{ color: '#556075', fontSize: '14px', margin: 0 }}>No developer applications found for this jurisdiction.</p>
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
                            <p style={{ margin: '6px 0 0', color: 'var(--muted-text)', fontSize: '13px' }}>
                              <span className="font-semibold text-slate-700">{application.cityName}</span> • {application.barangay} • <span className="font-mono text-xs text-slate-500">{application.contact}</span>
                            </p>
                            <p style={{ margin: '6px 0 0', color: '#42506a', fontSize: '13px', lineHeight: 1.5 }}>{application.useCase}</p>
                            <div className="flex flex-wrap gap-1.5 mt-2">
                              {application.requestedAccess.map(endpoint => (
                                <code key={endpoint} style={{ padding: '3px 8px', borderRadius: '999px', background: '#eef2ff', color: '#42506a', fontSize: '11px', fontFamily: "'JetBrains Mono', monospace" }}>{endpoint}</code>
                              ))}
                            </div>
                          </div>
                          <div className="flex flex-wrap gap-2 lg:justify-end shrink-0 items-start">
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
                <p style={{ margin: '6px 0 0', color: 'var(--muted-text)', fontSize: '13px' }}>
                  <span className="font-semibold text-slate-700">{selectedApplication.cityName}</span> • {selectedApplication.barangay}
                </p>
              </div>

              <div className="rounded-[16px] p-4" style={{ background: '#f8faff', border: '1px solid var(--line)' }}>
                <p style={{ margin: 0, fontSize: '13px', color: '#42506a' }}><strong>Email:</strong> {selectedApplication.contact}</p>
                <p style={{ margin: '8px 0 0', fontSize: '13px', color: '#42506a' }}><strong>Jurisdiction:</strong> {selectedApplication.cityName} (PSGC: {selectedApplication.municipalityCode})</p>
                <p style={{ margin: '8px 0 0', fontSize: '13px', color: '#42506a' }}><strong>Barangay:</strong> {selectedApplication.barangay}</p>
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
