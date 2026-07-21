import { useState } from 'react'
import { Shell } from '@/components/Shell'
import { useHandaStore } from '@/shared'
import { useSession } from '@/features/auth/session-context'

export function ResidentConsole() {
  const { session, logout } = useSession()
  const store = useHandaStore()
  const { data, loading, submitCheckIn, getDashboard } = store

  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [showModal, setShowModal] = useState(false)
  const [bannerDismissed, setBannerDismissed] = useState<string | null>(null)
  const [toastMsg, setToastMsg] = useState('')

  if (!session) return null

  const profile = session.profile
  const official = {
    name: `${profile.first_name} ${profile.last_name}`,
    uniqid: profile.uniqid,
    role: session.role,
    barangay_code: profile.barangay_code,
  }

  const activeCampaign = data.campaigns.find(
    c => c.status === 'active' && c.barangay_code === profile.barangay_code
  )

  const hasCheckedIn = activeCampaign
    ? data.checkIns.some(ci => ci.campaign_id === activeCampaign.id && ci.submitted_by === profile.uniqid)
    : false

  const showBanner = activeCampaign && !hasCheckedIn && bannerDismissed !== activeCampaign.id

  const dashboard = activeCampaign ? getDashboard(activeCampaign.id) : null

  function showToast(msg: string) {
    setToastMsg(msg)
    setTimeout(() => setToastMsg(''), 2400)
  }

  async function handleSubmit() {
    if (!activeCampaign) return
    const answerList = Object.entries(answers)
      .filter(([, v]) => v)
      .map(([question_id, answer]) => ({ question_id, answer }))
    await submitCheckIn({
      campaign_id: activeCampaign.id,
      name: `${profile.first_name} ${profile.last_name}`,
      submitted_by: profile.uniqid,
      answers: answerList,
    })
    setShowModal(false)
    setAnswers({})
    showToast('Check-in submitted. LGU has been notified.')
  }

  if (loading) {
    return (
      <Shell official={official} sidebarTab="dashboard" onNavigate={() => {}} onLogout={logout} role="resident">
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
      </Shell>
    )
  }

  return (
    <>
      <Shell official={official} sidebarTab="dashboard" onNavigate={() => {}} onLogout={logout} role="resident">
        {showBanner && activeCampaign && (
          <div
            className="section-card mb-4"
            style={{
              border: '2px solid var(--blue)',
              background: '#f0f4ff',
              padding: '20px',
            }}
          >
            <h3 style={{ margin: '0 0 8px', fontSize: '18px', color: 'var(--ink)' }}>
              Disaster Alert: {activeCampaign.name}
            </h3>
            <p style={{ margin: '0 0 16px', color: '#556075', fontSize: '14px' }}>
              {activeCampaign.disaster_type} on {activeCampaign.disaster_date}. Are you affected?
            </p>
            <div className="flex gap-3">
              <button
                className="big-btn primary"
                onClick={() => setShowModal(true)}
              >
                Yes, I'm affected
              </button>
              <button
                className="big-btn ghost"
                onClick={() => setBannerDismissed(activeCampaign.id)}
              >
                No
              </button>
            </div>
          </div>
        )}

        {activeCampaign && dashboard && (
          <>
            <h2 style={{ margin: '0 0 4px', fontSize: 'clamp(20px, 4vw, 28px)', letterSpacing: '-0.04em' }}>
              {activeCampaign.name}
            </h2>
            <p style={{ color: '#556075', lineHeight: 1.45, fontSize: '14px', marginBottom: '16px' }}>
              Barangay {activeCampaign.barangay_code} — {activeCampaign.disaster_type}, {activeCampaign.disaster_date}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
              <div className="section-card p-[18px]" style={{ border: '1px solid var(--line)', background: '#fff' }}>
                <strong style={{ display: 'block', fontSize: 'clamp(26px, 5vw, 36px)', color: 'var(--blue-2)', letterSpacing: '-0.05em' }}>
                  {dashboard.affectedCount}
                </strong>
                <span style={{ color: 'var(--muted-text)', fontWeight: 700, fontSize: '14px' }}>Affected residents</span>
              </div>
              <div className="section-card p-[18px]" style={{ border: '1px solid var(--line)', background: '#fff' }}>
                <strong style={{ display: 'block', fontSize: 'clamp(26px, 5vw, 36px)', color: 'var(--red)', letterSpacing: '-0.05em' }}>
                  {dashboard.unresolvedCount}
                </strong>
                <span style={{ color: 'var(--muted-text)', fontWeight: 700, fontSize: '14px' }}>Unresolved cases</span>
              </div>
            </div>

            {Object.keys(dashboard.needBreakdown).length > 0 && (
              <div className="section-card">
                <h3>Needs reported in your barangay</h3>
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
          </>
        )}

        {!activeCampaign && (
          <div className="empty-state-box text-center">
            <h3 style={{ margin: 0, fontSize: '18px', letterSpacing: '-0.04em', color: 'var(--ink)' }}>
              No active disaster reports near you
            </h3>
            <p style={{ color: '#556075', lineHeight: 1.45, fontSize: '14px', marginTop: '8px' }}>
              You'll be notified when a disaster is reported in your barangay.
            </p>
          </div>
        )}
      </Shell>

      {showModal && activeCampaign && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-card" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2>Report your needs</h2>
              <button className="pill-btn ghost" style={{ fontSize: '12px', padding: '6px 12px' }} onClick={() => setShowModal(false)}>
                Close
              </button>
            </div>
            <p style={{ color: '#5e687b', fontSize: '13px', marginBottom: '12px' }}>
              Answer the questions below so the LGU can assess your needs.
            </p>

            <div className="mb-4">
              <div className="flex flex-col gap-3">
                {data.questions
                  .filter(q => q.campaign_id === activeCampaign.id)
                  .sort((a, b) => a.display_order - b.display_order)
                  .map(q => (
                    <button
                      key={q.id}
                      type="button"
                      className={`w-full text-left flex justify-between items-center gap-3 p-4 rounded-[18px] border ${
                        answers[q.id] === 'yes' ? 'border-[#0646f4] shadow-[0_0_0_3px_rgba(6,70,244,0.1)]' : ''
                      }`}
                      style={{ background: '#fff', borderColor: answers[q.id] === 'yes' ? undefined : '#d8e2f6' }}
                      onClick={() => setAnswers(prev => ({ ...prev, [q.id]: prev[q.id] === 'yes' ? 'no' : 'yes' }))}
                    >
                      <span>
                        <strong style={{ display: 'block', fontSize: '14px' }}>{q.question_text}</strong>
                        <span style={{ display: 'block', marginTop: '3px', color: '#667085', fontSize: '13px' }}>
                          {q.need_category}
                        </span>
                      </span>
                      <strong style={{ fontSize: '14px', color: answers[q.id] === 'yes' ? 'var(--blue)' : '#667085' }}>
                        {answers[q.id] === 'yes' ? 'Yes' : 'No'}
                      </strong>
                    </button>
                  ))}
              </div>
            </div>

            <div className="flex gap-3">
              <button className="big-btn primary" onClick={handleSubmit}>
                Submit
              </button>
              <button className="big-btn ghost" onClick={() => setShowModal(false)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {toastMsg && <div className="toast-bar left-4 right-4 md:left-auto md:right-6 md:max-w-[360px]">{toastMsg}</div>}
    </>
  )
}
