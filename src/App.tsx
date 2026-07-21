import { useState, useEffect, useCallback } from 'react'
import { useHandaStore, can } from './shared'
import { Shell } from './components/Shell'
import type { HandaData, DashboardRow, CheckInStatus } from './shared'

type StoreProps = {
  official: import('./shared').Official | null
  loginOfficial: () => void
  logoutOfficial: () => void
  loading: boolean
  data: HandaData
  createCampaign: (input: { name: string; disaster_type: string; disaster_date: string }) => Promise<import('./shared').Campaign | null>
  saveCampaign: (id: string, input: { name: string; disaster_type: string; disaster_date: string }) => Promise<void>
  addQuestion: (campaignId: string, question_text: string, need_category: string) => void
  removeQuestion: (questionId: string) => void
  updateCampaignStatus: (campaignId: string, status: import('./shared').CampaignStatus) => Promise<void>
  updateCaseStatus: (checkInId: string, status: CheckInStatus) => Promise<void>
  submitCheckIn: (input: { campaign_id: string; name: string; submitted_by: string; answers: { question_id: string; answer: string }[] }) => Promise<import('./shared').CheckIn>
  getDashboard: (campaignId: string) => import('./shared').Dashboard
  exportCsv: (campaignId: string) => string
  copyQuestions: (sourceCampaignId: string, targetCampaignId: string) => void
}

function OfficialConsole({ official, loginOfficial, logoutOfficial, loading, data, createCampaign, saveCampaign, addQuestion, removeQuestion, updateCampaignStatus, updateCaseStatus, submitCheckIn, getDashboard, exportCsv, copyQuestions }: StoreProps) {
  const [name, setName] = useState('')
  const [disasterType, setDisasterType] = useState('Typhoon')
  const [disasterDate, setDisasterDate] = useState('')
  const [newQ, setNewQ] = useState('')
  const [newCat, setNewCat] = useState('')
  const [editingCampaignId, setEditingCampaignId] = useState<string | null>(null)
  const [selectedRow, setSelectedRow] = useState<DashboardRow | null>(null)
  const [modalStatus, setModalStatus] = useState<CheckInStatus>('unresolved')
  const [manualEntryOpen, setManualEntryOpen] = useState(false)
  const [mobileActionsOpen, setMobileActionsOpen] = useState(false)
  const [manualName, setManualName] = useState('')
  const [manualAnswers, setManualAnswers] = useState<Record<string, string>>({})
  const [sidebarTab, setSidebarTab] = useState<'dashboard' | 'campaigns'>(() => {
    const hash = window.location.hash
    if (hash === '#assessments') return 'campaigns'
    if (!hash || hash === '#') {
      window.location.hash = '#dashboard'
      return 'dashboard'
    }
    return hash === '#dashboard' ? 'dashboard' : 'dashboard'
  })

  const navigate = useCallback((tab: 'dashboard' | 'campaigns') => {
    setSidebarTab(tab)
    window.location.hash = tab === 'campaigns' ? '#assessments' : '#dashboard'
  }, [])

  useEffect(() => {
    const onHash = () => {
      const tab = window.location.hash === '#assessments' ? 'campaigns' : 'dashboard'
      setSidebarTab(tab)
    }
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])
  const [toastMsg, setToastMsg] = useState('')
  const [pendingAction, setPendingAction] = useState<{ type: 'publish' | 'close' | 'archive'; campaignId: string } | null>(null)

  const [selectedCampaignId, setSelectedCampaignId] = useState<string | null>(null)
  const [copyFromCampaignId, setCopyFromCampaignId] = useState('')
  const [saving, setSaving] = useState(false)
  const [queueStatusFilter, setQueueStatusFilter] = useState<CheckInStatus | 'all'>('all')
  const [queueNameSort, setQueueNameSort] = useState<'asc' | 'desc'>('asc')

  const activeCampaign = data.campaigns.find(c => c.status === 'active')
  const selectedCampaign = selectedCampaignId ? data.campaigns.find(c => c.id === selectedCampaignId) : activeCampaign
  const dashboard = selectedCampaign ? getDashboard(selectedCampaign.id) : null
  const queueRows = dashboard
    ? dashboard.rows
      .filter(r => queueStatusFilter === 'all' || r.checkIn.status === queueStatusFilter)
      .slice()
      .sort((a, b) => queueNameSort === 'asc'
        ? a.checkIn.name.localeCompare(b.checkIn.name)
        : b.checkIn.name.localeCompare(a.checkIn.name))
    : []
  const openCampaigns = data.campaigns.filter(c => c.status === 'draft' || c.status === 'closed')
  const viewableCampaigns = data.campaigns

  async function handleCreateCampaign(e: React.FormEvent) {
    e.preventDefault()
    if (!name || !disasterDate) return
    if (disasterDate > new Date().toISOString().split('T')[0]) {
      showToast('Disaster date cannot be in the future.')
      return
    }
    setSaving(true)
    const existing = editingCampaignId ? data.campaigns.find(c => c.id === editingCampaignId) : null
    if (existing) {
      await saveCampaign(existing.id, { name, disaster_type: disasterType, disaster_date: disasterDate })
      showToast('Assessment updated.')
    } else {
      const c = await createCampaign({ name, disaster_type: disasterType, disaster_date: disasterDate })
      if (c) setEditingCampaignId(c.id)
    }
    setSaving(false)
    setName(''); setDisasterDate('')
  }

  function handleAddQuestion(e: React.FormEvent) {
    e.preventDefault()
    if (!editingCampaignId || !newQ || !newCat) return
    addQuestion(editingCampaignId, newQ, newCat); setNewQ(''); setNewCat('')
  }

  function openModal(row: DashboardRow) { setSelectedRow(row); setModalStatus(row.checkIn.status) }
  async function handleSaveStatus() { if (!selectedRow) return; await updateCaseStatus(selectedRow.checkIn.id, modalStatus); setSelectedRow(null) }

  async function handleManualSubmit() {
    if (!selectedCampaign || !manualName || !official) return
    const answerList = Object.entries(manualAnswers)
      .filter(([, v]) => v)
      .map(([question_id, answer]) => ({ question_id, answer }))
    await submitCheckIn({
      campaign_id: selectedCampaign.id,
      name: manualName,
      submitted_by: `${official.name} (manual)`,
      answers: answerList,
    })
    setManualEntryOpen(false)
    setManualName('')
    setManualAnswers({})
  }

  function handleExportCsv() {
    if (!selectedCampaign) return
    const csv = exportCsv(selectedCampaign.id)
    if (!csv) { showToast('No data to export.'); return }
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${selectedCampaign.name.replace(/\s+/g, '_')}_export.csv`
    a.click()
    URL.revokeObjectURL(url)
    showToast('CSV exported.')
  }

  function showToast(msg: string) {
    setToastMsg(msg)
    setTimeout(() => setToastMsg(''), 2400)
  }

  async function handleConfirmAction() {
    if (!pendingAction) return
    const { type, campaignId } = pendingAction
    if (type === 'publish') {
      await updateCampaignStatus(campaignId, 'active')
      showToast('Assessment published!')
      setSelectedCampaignId(campaignId)
    } else if (type === 'close') {
      await updateCampaignStatus(campaignId, 'closed')
      showToast('Assessment closed.')
    } else if (type === 'archive') {
      await updateCampaignStatus(campaignId, 'archived')
      showToast('Assessment archived.')
    }
    setPendingAction(null)
  }

  function confirmAction(type: 'publish' | 'close' | 'archive', campaignId: string) {
    setPendingAction({ type, campaignId })
  }

  if (!official) {
    return (
      <div className="w-full h-full flex items-center justify-center" style={{ fontFamily: 'Arial, Helvetica, sans-serif' }}>
        <div className="text-center" style={{ background: '#fff', border: '1px solid var(--line)', borderRadius: '28px', padding: '32px', maxWidth: '420px', width: '100%' }}>
          <h2 style={{ margin: 0, fontSize: '24px', letterSpacing: '-0.04em', color: 'var(--ink)' }}>Barangay Official Login</h2>
          <p style={{ color: '#556075', lineHeight: 1.45, fontSize: '14px', marginTop: '8px' }}>Sign in with your eGovPH account to manage incident assessments.</p>
          <button className="big-btn primary mt-5" onClick={loginOfficial}>Sign in as Official</button>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <Shell official={null} sidebarTab="dashboard" onNavigate={() => {}} onLogout={() => {}}>
        <div className="skeleton-bar" style={{ width: '60%', height: '24px' }} />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4 mt-5">
          <div className="section-card p-[18px]">
            <div className="skeleton-bar" style={{ width: '40%', height: '36px', margin: 0 }} />
            <div className="skeleton-bar" style={{ width: '30%', height: '14px', margin: '8px 0 0' }} />
          </div>
          <div className="section-card p-[18px]">
            <div className="skeleton-bar" style={{ width: '40%', height: '36px', margin: 0 }} />
            <div className="skeleton-bar" style={{ width: '30%', height: '14px', margin: '8px 0 0' }} />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-[1fr_0.68fr] gap-3">
          <div className="section-card">
            <div className="skeleton-bar" style={{ width: '30%', height: '16px', margin: '16px' }} />
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="skeleton-bar" style={{ width: `${85 - i * 8}%`, margin: '10px 16px' }} />
            ))}
          </div>
          <div className="section-card">
            <div className="skeleton-bar" style={{ width: '35%', height: '16px', margin: '16px' }} />
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="skeleton-bar" style={{ width: `${78 - i * 5}%`, margin: '10px 16px' }} />
            ))}
          </div>
        </div>
      </Shell>
    )
  }

  return (
    <>
    <Shell
      official={official}
      sidebarTab={sidebarTab}
      onNavigate={navigate}
      onLogout={logoutOfficial}
    >
          {sidebarTab === 'dashboard' && (
            <>
              <div className="dashboard-sticky-head">
                <div className="dashboard-assessment-control flex items-center gap-3 mb-5">
                  <label htmlFor="campaign-select" className="text-sm font-bold" style={{ color: '#313a4c', whiteSpace: 'nowrap' }}>Assessment:</label>
                  <select
                    id="campaign-select"
                    value={selectedCampaignId ?? ''}
                    onChange={e => setSelectedCampaignId(e.target.value || null)}
                    className="min-h-[44px] rounded-2xl px-3 py-2 text-sm min-w-0 flex-1"
                    style={{ border: '1px solid #cdd8ed', background: '#fff', color: 'var(--ink)', maxWidth: '480px' }}
                  >
                    <option value="">— Select an assessment —</option>
                    {viewableCampaigns.map(c => (
                      <option key={c.id} value={c.id}>{c.name} ({c.status})</option>
                    ))}
                  </select>
                </div>
                {selectedCampaign && (
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
                    <div>
                      <div className="dashboard-title-row flex items-center gap-3 mb-1">
                        <h2 style={{ margin: 0, fontSize: 'clamp(22px, 4vw, 28px)', letterSpacing: '-0.04em', color: 'var(--ink)' }}>{selectedCampaign.name}</h2>
                        <span className={`status-chip ${selectedCampaign.status === 'active' ? 'open' : selectedCampaign.status === 'draft' ? '' : selectedCampaign.status === 'closed' ? 'warn' : selectedCampaign.status === 'archived' ? 'danger' : ''}`}
                          style={selectedCampaign.status === 'draft' ? { background: 'var(--soft)', color: 'var(--muted-text)' } : selectedCampaign.status === 'closed' ? { background: '#fff3cd', color: '#856404' } : undefined}>
                          {selectedCampaign.status}
                        </span>
                      </div>
                      <p style={{ color: '#556075', lineHeight: 1.45, fontSize: '14px' }}>Barangay {selectedCampaign.barangay_code} — {selectedCampaign.disaster_type}, {selectedCampaign.disaster_date}</p>
                    </div>
                    <button
                      className="dashboard-actions-toggle md:hidden"
                      type="button"
                      onClick={() => setMobileActionsOpen(open => !open)}
                      aria-expanded={mobileActionsOpen}
                      aria-controls="dashboard-actions"
                    >
                      Actions
                      <span aria-hidden="true">⌄</span>
                    </button>
                    <div id="dashboard-actions" className={`dashboard-actions flex gap-2 flex-wrap ${mobileActionsOpen ? 'open' : ''}`}>
                      {can(official.role, 'manual_entry') && selectedCampaign?.status === 'active' && (
                        <button className="pill-btn ghost text-xs sm:text-sm" onClick={() => setManualEntryOpen(true)}>Manual entry</button>
                      )}
                      {can(official.role, 'export_csv') && (
                        <button className="pill-btn primary text-xs sm:text-sm" onClick={handleExportCsv}>Export CSV</button>
                      )}
                      {selectedCampaign.status !== 'archived' && (
                        <>
                          {selectedCampaign.status !== 'active' && can(official.role, 'publish_campaign') && (
                            <button className="pill-btn primary text-xs sm:text-sm" onClick={() => confirmAction('publish', selectedCampaign.id)}>Publish</button>
                          )}
                          {selectedCampaign.status !== 'closed' && can(official.role, 'close_campaign') && (
                            <button className="pill-btn ghost text-xs sm:text-sm" onClick={() => confirmAction('close', selectedCampaign.id)}>Close</button>
                          )}
                          {can(official.role, 'archive_campaign') && (
                            <button className="pill-btn ghost text-xs sm:text-sm" onClick={() => confirmAction('archive', selectedCampaign.id)}>Archive</button>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                )}
                </div>

              {selectedCampaign ? (
                <>
                  {dashboard && (
                    <>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                        <div className="section-card p-[18px]" style={{ border: '1px solid var(--line)', background: '#fff' }}>
                          <strong style={{ display: 'block', fontSize: 'clamp(26px, 5vw, 36px)', color: 'var(--blue-2)', letterSpacing: '-0.05em' }}>{dashboard.affectedCount}</strong>
                          <span style={{ color: 'var(--muted-text)', fontWeight: 700, fontSize: '14px' }}>Check-ins</span>
                        </div>
                        <div className="section-card p-[18px]" style={{ border: '1px solid var(--line)', background: '#fff' }}>
                          <strong style={{ display: 'block', fontSize: 'clamp(26px, 5vw, 36px)', color: 'var(--red)', letterSpacing: '-0.05em' }}>{dashboard.unresolvedCount}</strong>
                          <span style={{ color: 'var(--muted-text)', fontWeight: 700, fontSize: '14px' }}>Unresolved</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-[1fr_0.68fr] gap-3 mb-4">
                        <div className="section-card">
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4" style={{ borderBottom: '1px solid #edf1f8' }}>
                            <h3 style={{ margin: 0 }}>Check-in queue</h3>
                            <div className="flex flex-col sm:flex-row gap-2">
                              <label className="sr-only" htmlFor="queue-sort">Sort by name</label>
                              <select
                                id="queue-sort"
                                value={queueNameSort}
                                onChange={e => setQueueNameSort(e.target.value as 'asc' | 'desc')}
                                className="min-h-[40px] rounded-2xl px-3 py-1 text-sm"
                                style={{ border: '1px solid #cdd8ed', background: '#fff', color: 'var(--ink)' }}
                              >
                                <option value="asc">Name A-Z</option>
                                <option value="desc">Name Z-A</option>
                              </select>
                              <label className="sr-only" htmlFor="queue-status">Filter by status</label>
                              <select
                                id="queue-status"
                                value={queueStatusFilter}
                                onChange={e => setQueueStatusFilter(e.target.value as CheckInStatus | 'all')}
                                className="min-h-[40px] rounded-2xl px-3 py-1 text-sm"
                                style={{ border: '1px solid #cdd8ed', background: '#fff', color: 'var(--ink)' }}
                              >
                                <option value="all">All statuses</option>
                                <option value="unresolved">Unresolved</option>
                                <option value="visited">Visited</option>
                                <option value="resolved">Resolved</option>
                              </select>
                            </div>
                          </div>
                          <div className="overflow-x-auto">
                          <table className="w-full min-w-[400px] border-collapse text-sm">
                            <thead>
                              <tr>
                                <th className="text-left py-3 px-4 font-bold" style={{ color: '#4b5568', background: '#f8faff', borderBottom: '1px solid #edf1f8' }}>Name</th>
                                <th className="text-left py-3 px-4 font-bold" style={{ color: '#4b5568', background: '#f8faff', borderBottom: '1px solid #edf1f8' }}>Submitted by</th>
                                <th className="text-left py-3 px-4 font-bold" style={{ color: '#4b5568', background: '#f8faff', borderBottom: '1px solid #edf1f8' }}>Status</th>
                              </tr>
                            </thead>
                            <tbody>
                              {queueRows.map(r => (
                                <tr
                                  key={r.checkIn.id}
                                  className={selectedCampaign?.status === 'active' ? 'cursor-pointer' : ''}
                                  style={{ borderBottom: '1px solid #edf1f8' }}
                                  onClick={() => selectedCampaign?.status === 'active' && openModal(r)}
                                >
                                  <td className="py-3 px-4 font-medium">{r.checkIn.name}</td>
                                  <td className="py-3 px-4" style={{ color: 'var(--muted-text)' }}>{r.checkIn.submitted_by}</td>
                                  <td className="py-3 px-4">
                                    <span className={`status-chip ${r.checkIn.status === 'resolved' ? 'good' : r.checkIn.status === 'visited' ? 'warn' : 'open'}`}>
                                      {r.checkIn.status}
                                    </span>
                                  </td>
                                </tr>
                              ))}
                              {queueRows.length === 0 && (
                                <tr>
                                  <td colSpan={3} className="py-6 px-4 text-center" style={{ color: 'var(--muted-text)' }}>No check-ins match this filter.</td>
                                </tr>
                              )}
                            </tbody>
                          </table>
                          </div>
                        </div>

                        {Object.keys(dashboard.needBreakdown).length > 0 && (
                          <div className="section-card">
                            <h3>Need breakdown</h3>
                            <div className="flex flex-col gap-2.5 p-4">
                              {Object.entries(dashboard.needBreakdown).map(([cat, count]) => (
                                <div key={cat} className="need-item">
                                  <div className="need-icon" />
                                  <strong style={{ fontSize: '14px', color: 'var(--ink)' }}>{cat}</strong>
                                  <strong style={{ fontSize: '18px', color: 'var(--blue-2)' }}>{count}</strong>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </>
              ) : (
                <div className="empty-state-box text-center">
                  <h3 style={{ margin: 0, fontSize: '18px', letterSpacing: '-0.04em', color: 'var(--ink)' }}>No assessment selected</h3>
                  <p style={{ color: '#556075', lineHeight: 1.45, fontSize: '14px', marginTop: '8px' }}>Select an assessment from the dropdown above, or create one first.</p>
                  <button className="big-btn primary mt-4" onClick={() => navigate('campaigns')}>Go to Assessments</button>
                </div>
              )}
            </>
          )}

          {sidebarTab === 'campaigns' && (
            <>
              <h2 style={{ margin: '0 0 4px', fontSize: 'clamp(20px, 4vw, 28px)', letterSpacing: '-0.04em' }}>Incident assessment builder</h2>
              <p style={{ color: '#556075', lineHeight: 1.45, fontSize: '14px' }}>Reusable question sets keep recurring typhoon, flood, and fire assessments fast.</p>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">
                {can(official.role, 'create_campaign') && (
                <div className="form-card">
                  <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: 'var(--ink)' }}>Create assessment</h3>
                  <form onSubmit={handleCreateCampaign} className="flex flex-col gap-4 mt-3">
                    <div className="flex flex-col gap-2">
                      <label htmlFor="campaign-name" style={{ fontWeight: 800, fontSize: '14px', color: '#313a4c' }}>Disaster name</label>
                      <input id="campaign-name" value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Typhoon Odette" className="w-full min-h-[48px] rounded-2xl px-3 py-3 text-sm" style={{ border: '1px solid #cdd8ed', background: '#fff', color: 'var(--ink)' }} />
                      <span style={{ color: '#5e687b', fontSize: '13px' }}>Shown to residents in the check-in prompt.</span>
                    </div>
                    <div className="flex flex-col gap-2">
                      <label htmlFor="campaign-type" style={{ fontWeight: 800, fontSize: '14px', color: '#313a4c' }}>Disaster type</label>
                      <select id="campaign-type" value={disasterType} onChange={e => setDisasterType(e.target.value)} className="w-full min-h-[48px] rounded-2xl px-3 py-3 text-sm" style={{ border: '1px solid #cdd8ed', background: '#fff', color: 'var(--ink)' }}>
                        <option>Typhoon</option><option>Flood</option><option>Fire</option><option>Earthquake</option>
                      </select>
                    </div>
                    <div className="flex flex-col gap-2">
                      <label htmlFor="campaign-date" style={{ fontWeight: 800, fontSize: '14px', color: '#313a4c' }}>Disaster date</label>
                      <input id="campaign-date" type="date" max={new Date().toISOString().split('T')[0]} value={disasterDate} onChange={e => setDisasterDate(e.target.value)} className="w-full min-h-[48px] rounded-2xl px-3 py-3 text-sm" style={{ border: '1px solid #cdd8ed', background: '#fff', color: 'var(--ink)' }} />
                    </div>
                    <div className="flex gap-2"><button className="big-btn primary" type="submit" disabled={saving} style={saving ? { opacity: 0.8 } : undefined}>
                      {saving && <span className="spinner" />}
                      {saving ? 'Saving...' : editingCampaignId && data.campaigns.some(c => c.id === editingCampaignId) ? 'Update assessment' : 'Save draft'}
                    </button></div>
                  </form>
                </div>
                )}

                {can(official.role, 'edit_questions') && (
                <div className="form-card">
                  <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: 'var(--ink)' }}>Question set</h3>
                  {editingCampaignId ? (
                    <>
                      <div className="flex flex-col gap-3 mt-4">
                        {data.questions.filter(q => q.campaign_id === editingCampaignId).sort((a, b) => a.display_order - b.display_order).map(q => (
                          <div key={q.id} className="question-card flex items-center justify-between">
                            <div>
                              <strong style={{ display: 'block', fontSize: '14px', color: 'var(--ink)' }}>{q.question_text}</strong>
                              <p style={{ margin: '4px 0 0', fontSize: '12px', color: 'var(--muted-text)' }}>Need category: {q.need_category}</p>
                            </div>
                            {can(official.role, 'edit_questions') && (
                              <button className="pill-btn ghost" style={{ fontSize: '12px', padding: '6px 10px' }} onClick={() => removeQuestion(q.id)}>Remove</button>
                            )}
                          </div>
                        ))}
                      </div>
                      {(() => {
                        const hasQuestions = data.questions.filter(q => q.campaign_id === editingCampaignId).length > 0
                        const otherCamps = data.campaigns.filter(c => c.id !== editingCampaignId && data.questions.some(q => q.campaign_id === c.id))
                        return otherCamps.length > 0 ? (
                          <div className="flex items-center gap-2 mt-3 pt-3" style={{ borderTop: hasQuestions ? '1px solid var(--line)' : 'none' }}>
                            <label htmlFor="copy-from" className="text-sm font-bold" style={{ color: '#313a4c', whiteSpace: 'nowrap' }}>Copy from:</label>
                            <select id="copy-from" value={copyFromCampaignId} onChange={e => setCopyFromCampaignId(e.target.value)} className="min-h-[40px] rounded-2xl px-3 py-1 text-sm flex-1" style={{ border: '1px solid #cdd8ed', background: '#fff', color: 'var(--ink)' }}>
                              <option value="">— Select —</option>
                              {otherCamps.map(c => (
                                <option key={c.id} value={c.id}>{c.name}</option>
                              ))}
                            </select>
                            <button className="pill-btn ghost" style={{ fontSize: '12px', padding: '6px 12px', whiteSpace: 'nowrap' }}
                              onClick={() => {
                                if (!copyFromCampaignId) return
                                copyQuestions(copyFromCampaignId, editingCampaignId)
                                setCopyFromCampaignId('')
                                showToast('Questions copied!')
                              }}
                              disabled={!copyFromCampaignId}
                            >Copy</button>
                          </div>
                        ) : null
                      })()}
                      <form onSubmit={handleAddQuestion} className="flex flex-col gap-3 mt-4 pt-4" style={{ borderTop: '1px solid var(--line)' }}>
                        <div className="flex flex-col gap-2">
                          <label htmlFor="q-text" style={{ fontWeight: 800, fontSize: '14px', color: '#313a4c' }}>Question</label>
                          <input id="q-text" value={newQ} onChange={e => setNewQ(e.target.value)} placeholder="e.g. Is your home damaged?" className="w-full min-h-[48px] rounded-2xl px-3 py-3 text-sm" style={{ border: '1px solid #cdd8ed', background: '#fff', color: 'var(--ink)' }} />
                        </div>
                        <div className="flex flex-col gap-2">
                          <label htmlFor="q-cat" style={{ fontWeight: 800, fontSize: '14px', color: '#313a4c' }}>Need category</label>
                          <input id="q-cat" value={newCat} onChange={e => setNewCat(e.target.value)} placeholder="e.g. Shelter" className="w-full min-h-[48px] rounded-2xl px-3 py-3 text-sm" style={{ border: '1px solid #cdd8ed', background: '#fff', color: 'var(--ink)' }} />
                        </div>
                        <div><button className="big-btn ghost" type="submit">Add question</button></div>
                      </form>
                    </>
                  ) : (
                    <div className="empty-state-box mt-4 text-center">
                      <p style={{ color: '#556075', fontSize: '14px' }}>Create an assessment first, then add questions here.</p>
                    </div>
                  )}
                </div>
                )}
              </div>

              {openCampaigns.length > 0 && (
                <div className="form-card mt-4">
                  <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: 'var(--ink)' }}>Saved assessments</h3>
                  <ul style={{ listStyle: 'none', padding: 0, margin: '12px 0 0' }}>
                    {openCampaigns.map(c => (
                      <li key={c.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 py-3 text-sm" style={{ borderBottom: '1px solid #edf1f8' }}>
                        <span style={{ fontWeight: 600, color: 'var(--ink)' }}>{c.name} — {c.disaster_type}, {c.disaster_date}</span>
                        <div className="flex gap-2">
                          {can(official.role, 'edit_questions') && (
                            <button className="pill-btn ghost" style={{ fontSize: '12px', padding: '6px 12px' }} onClick={() => {
                              setName(c.name)
                              setDisasterType(c.disaster_type)
                              setDisasterDate(c.disaster_date)
                              setEditingCampaignId(c.id)
                              navigate('campaigns')
                            }}>Edit</button>
                          )}
                          {can(official.role, 'publish_campaign') && c.status === 'draft' && (
                            <button className="pill-btn primary" style={{ fontSize: '12px', padding: '6px 12px' }} onClick={() => confirmAction('publish', c.id)}>Publish</button>
                          )}
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </>
          )}

      <nav className="bottom-toolbar md:hidden">
        <button className={`toolbar-tab ${sidebarTab === 'dashboard' ? 'active' : ''}`} onClick={() => navigate('dashboard')}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="7" height="7" rx="1"/>
            <rect x="14" y="3" width="7" height="7" rx="1"/>
            <rect x="3" y="14" width="7" height="7" rx="1"/>
            <rect x="14" y="14" width="7" height="7" rx="1"/>
          </svg>
          <span>Dashboard</span>
        </button>
        <button className={`toolbar-tab ${sidebarTab === 'campaigns' ? 'active' : ''}`} onClick={() => navigate('campaigns')}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/>
            <line x1="4" y1="22" x2="4" y2="15"/>
          </svg>
          <span>Assessments</span>
        </button>
      </nav>
    </Shell>

      {selectedRow && (
        <div className="modal-overlay" onClick={() => setSelectedRow(null)}>
          <div className="modal-card" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2>Case detail</h2>
              <button className="pill-btn ghost" style={{ fontSize: '12px', padding: '6px 12px' }} onClick={() => setSelectedRow(null)}>Close</button>
            </div>
            <div className="mb-4">
              <p style={{ fontSize: '16px', fontWeight: 700, color: 'var(--ink)' }}>{selectedRow.checkIn.name}</p>
              <p style={{ fontSize: '13px', color: 'var(--muted-text)' }}>Submitted by: {selectedRow.checkIn.submitted_by}</p>
              <p style={{ fontSize: '13px', color: 'var(--muted-text)' }}>{new Date(selectedRow.checkIn.created_at).toLocaleString()}</p>
            </div>
            {can(official.role, 'update_case') && selectedCampaign?.status === 'active' && (
            <div className="mb-4">
              <label className="block mb-2" style={{ fontWeight: 800, fontSize: '14px', color: '#313a4c' }}>Status</label>
              <select value={modalStatus} onChange={e => setModalStatus(e.target.value as CheckInStatus)} className="w-full min-h-[48px] rounded-2xl px-3 py-3 text-sm" style={{ border: '1px solid #cdd8ed', background: '#fff', color: 'var(--ink)' }}>
                <option value="unresolved">Unresolved</option>
                <option value="visited">Visited</option>
                <option value="resolved">Resolved</option>
              </select>
            </div>
            )}
            {selectedRow.answers.length > 0 && (
              <div className="mb-4">
                <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--muted-text)', marginBottom: '4px' }}>Answers</p>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                  {selectedRow.answers.map(a => {
                    const q = data.questions.find(q => q.id === a.question_id)
                    return (
                      <li key={a.id} className="text-sm py-1" style={{ borderBottom: '1px solid #edf1f8' }}>
                        {q?.question_text ?? 'Unknown'}: <span style={{ color: a.answer === 'yes' ? 'var(--red)' : 'var(--muted-text)', fontWeight: 600 }}>{a.answer}</span>
                      </li>
                    )
                  })}
                </ul>
              </div>
            )}
            <div className="flex gap-3">
              {can(official.role, 'update_case') && selectedCampaign?.status === 'active' && (
                <button className="big-btn primary" onClick={handleSaveStatus}>Save</button>
              )}
              <button className="big-btn ghost" onClick={() => setSelectedRow(null)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {manualEntryOpen && selectedCampaign && (
        <div className="modal-overlay" onClick={() => setManualEntryOpen(false)}>
          <div className="modal-card" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2>Manual resident entry</h2>
              <button className="pill-btn ghost" style={{ fontSize: '12px', padding: '6px 12px' }} onClick={() => { setManualEntryOpen(false); setManualName('') }}>Close</button>
            </div>
            <p style={{ color: '#5e687b', fontSize: '13px', marginBottom: '12px' }}>For offline field deployment when a resident cannot use the app.</p>

            <div className="mb-4">
              <label htmlFor="manual-name" className="block mb-2" style={{ fontWeight: 800, fontSize: '14px', color: '#313a4c' }}>Name</label>
              <input
                id="manual-name"
                type="text"
                value={manualName}
                onChange={e => setManualName(e.target.value)}
                placeholder="Enter resident name..."
                className="w-full min-h-[48px] rounded-2xl px-3 py-3 text-sm"
                style={{ border: '1px solid #cdd8ed', background: '#fff', color: 'var(--ink)' }}
              />
            </div>

            <div className="mb-4">
              <p className="mb-2" style={{ fontWeight: 800, fontSize: '14px', color: '#313a4c' }}>Reported needs</p>
              <div className="flex flex-col gap-3">
                {data.questions.filter(q => q.campaign_id === selectedCampaign.id).sort((a, b) => a.display_order - b.display_order).map(q => (
                  <button
                    key={q.id}
                    type="button"
                    className={`w-full text-left flex justify-between items-center gap-3 p-4 rounded-[18px] border ${manualAnswers[q.id] === 'yes' ? 'border-[#0646f4] shadow-[0_0_0_3px_rgba(6,70,244,0.1)]' : ''}`}
                    style={{ background: '#fff', borderColor: manualAnswers[q.id] === 'yes' ? undefined : '#d8e2f6' }}
                    onClick={() => setManualAnswers(prev => ({ ...prev, [q.id]: prev[q.id] === 'yes' ? 'no' : 'yes' }))}
                  >
                    <span>
                      <strong style={{ display: 'block', fontSize: '14px' }}>{q.question_text}</strong>
                      <span style={{ display: 'block', marginTop: '3px', color: '#667085', fontSize: '13px' }}>{q.need_category}</span>
                    </span>
                    <strong style={{ fontSize: '14px', color: manualAnswers[q.id] === 'yes' ? 'var(--blue)' : '#667085' }}>
                      {manualAnswers[q.id] === 'yes' ? 'Yes' : 'No'}
                    </strong>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-3">
              <button className="big-btn primary" onClick={handleManualSubmit} disabled={!manualName} style={!manualName ? { opacity: 0.5, cursor: 'not-allowed' } : undefined}>Submit entry</button>
              <button className="big-btn ghost" onClick={() => { setManualEntryOpen(false); setManualName('') }}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {pendingAction && (
        <div className="modal-overlay" onClick={() => setPendingAction(null)}>
          <div className="modal-card" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2>Confirm {pendingAction.type === 'publish' ? 'publish' : pendingAction.type === 'close' ? 'close' : 'archive'}</h2>
              <button className="pill-btn ghost" style={{ fontSize: '12px', padding: '6px 12px' }} onClick={() => setPendingAction(null)}>Cancel</button>
            </div>
            {pendingAction.type === 'publish' && (
              <div className="mb-4">
                <p style={{ color: '#4b5568', lineHeight: 1.5, fontSize: '14px' }}>
                  This will open the assessment for check-ins. Any other active assessment will be automatically closed.
                  Residents will see this assessment as the active check-in prompt.
                </p>
              </div>
            )}
            {pendingAction.type === 'close' && (
              <div className="mb-4">
                <p style={{ color: '#4b5568', lineHeight: 1.5, fontSize: '14px' }}>
                  Closing stops new check-ins. Existing data remains viewable and exportable. 
                  You can still archive this assessment later, but residents will no longer be able to submit reports.
                </p>
              </div>
            )}
            {pendingAction.type === 'archive' && (
              <div className="mb-4">
                <p style={{ color: '#4b5568', lineHeight: 1.5, fontSize: '14px' }}>
                  Archiving removes the assessment from the active view. All check-in data is preserved
                  but the assessment will be in read-only mode. This cannot be undone from the dashboard.
                </p>
              </div>
            )}
            <div className="flex gap-3">
              <button className={`big-btn ${pendingAction.type === 'archive' ? 'danger' : 'primary'}`} onClick={handleConfirmAction}>
                {pendingAction.type === 'publish' ? 'Publish assessment' : pendingAction.type === 'close' ? 'Close assessment' : 'Archive assessment'}
              </button>
              <button className="big-btn ghost" onClick={() => setPendingAction(null)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {toastMsg && (
        <div className="toast-bar left-4 right-4 md:left-auto md:right-6 md:max-w-[360px]">
          {toastMsg}
        </div>
      )}
  </>
  )
}

export default function App() {
  const store = useHandaStore()

  return (
    <div className="min-h-[100dvh] w-full overflow-hidden" style={{ background: '#fff', fontFamily: 'Arial, Helvetica, sans-serif' }}>
      <OfficialConsole {...store} />
    </div>
  )
}
