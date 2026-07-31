import { useEffect, useState } from 'react'
import { HandaBottomSheet, type SheetState } from '@/components/HandaBottomSheet'
import { CitizenHelpChat } from '@/components/CitizenHelpChat'
import { DisasterReportForm } from '@/components/DisasterReportForm'
import { useSession } from '@/features/auth/session-context'
import { getCampaignEReportDefaults } from '@/features/demo/historical-selectors'
import { translateText } from '@/lib/egov-ai-service'
import { useHandaStore } from '@/shared'

const QUICK_SERVICES = [
  { label: 'NGAs', icon: '🏛' },
  { label: 'LGUs', icon: '🏢' },
  { label: 'Travel', icon: '✈' },
  { label: 'Health', icon: '❤' },
  { label: 'Report', icon: '!' },
]

const PREVIEW_CARDS = [
  { title: 'Weather and Alerts', body: '29°C in Makati. Mostly sunny with scattered advisories.' },
  { title: 'eTrabaho', body: 'Preview only for the demo build.' },
  { title: 'Digital ID', body: 'Preview only for the demo build.' },
]

const FILIPINO_FALLBACK_COPY: Record<string, string> = {
  alertLabel: 'Babala sa Sakuna',
  pending: 'naghihintay',
  affected: 'Apektado ako',
  later: 'Mamaya',
  eReport: 'Maghain ng eReport Case',
  needsTitle: 'Iulat ang inyong pangangailangan',
  hide: 'Itago',
  submittedTitle: 'Naisumite na ang check-in',
  submittedBody: 'Manatiling nakaabang sa pinakabagong update mula sa inyong LGU.',
  aiTitle: 'eGov AI para sa HANDA',
}

function toFilipinoCampaignTitle(title: string) {
  return title
    .replace(/Rapid Assessment/gi, 'Mabilisang Pagtatasa')
    .replace(/Typhoon/gi, 'Bagyong')
    .replace(/Flood/gi, 'Baha')
    .replace(/Fire/gi, 'Sunog')
}

function toFilipinoQuestion(text: string) {
  if (text === 'Is your home heavily damaged or unsafe to occupy?') {
    return 'Lubha bang nasira ang inyong bahay o hindi na ligtas tirhan?'
  }
  if (text === 'Is your home structurally damaged?') {
    return 'May pinsala ba sa istruktura ng inyong bahay?'
  }
  if (text === 'Does your household need food or clean drinking water?') {
    return 'Kailangan ba ng inyong sambahayan ng pagkain o malinis na inuming tubig?'
  }
  if (text === 'Is your family short on food supply (less than 3 days)?') {
    return 'Kapusin ba ang inyong pamilya sa suplay ng pagkain na mas mababa sa tatlong araw?'
  }
  if (text === 'Does anyone in your household need medical attention?') {
    return 'Mayroon bang sinuman sa inyong sambahayan na nangangailangan ng agarang atensiyong medikal?'
  }
  if (text === 'Do you have access to electricity?') {
    return 'May access ba kayo sa kuryente?'
  }
  return text
}

function toFilipinoCategory(category: string) {
  const normalized = category.toLowerCase().replace(/[_\s]+/g, '_')
  if (normalized === 'shelter') return 'Silungan'
  if (normalized === 'food_or_water' || normalized === 'food_water') return 'Pagkain at tubig'
  if (normalized === 'medical') return 'Medikal'
  if (normalized === 'utilities') return 'Kuryente at utilities'
  return category
}

export function ResidentConsole() {
  const { session, logout } = useSession()
  const { data, loading, submitCheckIn } = useHandaStore()

  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [sheetState, setSheetState] = useState<SheetState>('mid')
  const [showSurvey, setShowSurvey] = useState(false)
  const [showEReportModal, setShowEReportModal] = useState(false)
  const [showSubmissionModal, setShowSubmissionModal] = useState(false)
  const [toastMsg, setToastMsg] = useState('')
  const [translatedCopy, setTranslatedCopy] = useState<Record<string, string> | null>(null)
  const [isTranslatingSheet, setIsTranslatingSheet] = useState(false)

  if (!session) return null

  const profile = session.profile
  const activeCampaign = data.campaigns.find(c => c.status === 'active')
  const residentCheckIn = activeCampaign
    ? data.checkIns.find(ci => ci.campaign_id === activeCampaign.id && ci.submitted_by === profile.uniqid)
    : undefined
  const shouldShowHandaSheet = !!activeCampaign && residentCheckIn?.status !== 'resolved'
  const residentQuestions = activeCampaign
    ? data.questions
      .filter(q => q.campaign_id === activeCampaign.id)
      .sort((a, b) => a.display_order - b.display_order)
    : []
  const eReportDefaults = activeCampaign ? getCampaignEReportDefaults(activeCampaign.id) : null

  useEffect(() => {
    if (!shouldShowHandaSheet) return
    if (!residentCheckIn) {
      setSheetState('mid')
      return
    }
    setSheetState('minimized')
  }, [residentCheckIn, shouldShowHandaSheet])

  function handleOpenEReport() {
    setSheetState('minimized')
    setShowEReportModal(true)
  }

  async function handleTranslateSheet() {
    if (!activeCampaign || isTranslatingSheet) return

    const entries: Record<string, string> = {
      alertLabel: 'Emergency Alert',
      alertTitle: toFilipinoCampaignTitle(activeCampaign.name),
      alertBody: `Idineklara ang ${activeCampaign.disaster_type.toLowerCase()} noong ${activeCampaign.disaster_date}. Iulat na ngayon ang pangangailangan ng inyong sambahayan upang mauna kayo sa pagtugon at ayuda.`,
      status: residentCheckIn?.status ?? 'pending',
      affected: "Yes, I'm affected",
      later: 'Later',
      eReport: 'File eReport Case',
      needsTitle: 'Report your needs',
      hide: 'Hide',
      submittedTitle: 'Check-in submitted',
      submittedBody: 'Your case stays pinned here until the LGU marks it resolved.',
      aiTitle: 'eGov AI for HANDA',
    }

    residentQuestions.forEach((question, index) => {
      entries[`question_${index}`] = toFilipinoQuestion(question.question_text)
      entries[`category_${index}`] = toFilipinoCategory(question.need_category)
      entries[`answer_${index}`] = answers[question.id] === 'yes' ? 'Oo' : 'Hindi'
    })

    setIsTranslatingSheet(true)
    try {
      const translatedEntries = await Promise.all(
        Object.entries(entries).map(async ([key, value]) => {
          const localFallback = FILIPINO_FALLBACK_COPY[key] || value
          const result = await translateText(value, 'fil', 'en')
          return [key, result.translated_prompt || localFallback] as const
        })
      )
      setTranslatedCopy(Object.fromEntries(translatedEntries))
    } finally {
      setIsTranslatingSheet(false)
    }
  }

  function text(key: string, fallback: string) {
    return translatedCopy?.[key] || fallback
  }

  function answerText(isYes: boolean) {
    if (translatedCopy) return isYes ? 'Oo' : 'Hindi'
    return isYes ? 'Yes' : 'No'
  }

  function showToast(message: string) {
    setToastMsg(message)
    window.setTimeout(() => setToastMsg(''), 2400)
  }

  async function handleSubmit() {
    if (!activeCampaign) return
    const answerList = Object.entries(answers)
      .filter(([, value]) => value)
      .map(([question_id, answer]) => ({ question_id, answer }))

    await submitCheckIn({
      campaign_id: activeCampaign.id,
      name: `${profile.first_name} ${profile.last_name}`,
      submitted_by: profile.uniqid,
      answers: answerList,
    })

    setAnswers({})
    setShowSurvey(false)
    setSheetState('minimized')
    setShowSubmissionModal(true)
    showToast('Check-in submitted. LGU has been notified.')
  }

  const currentDate = new Intl.DateTimeFormat('en-PH', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date())

  if (loading) {
    return (
      <div className="resident-mobile-shell resident-mobile-loading">
        <div className="section-card p-5">
          <div className="skeleton-bar" style={{ width: '45%', height: '22px', margin: 0 }} />
          <div className="skeleton-bar" style={{ width: '70%', height: '14px', margin: '12px 0 0' }} />
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="resident-mobile-shell">
        <header className="resident-mobile-topbar">
          <img src="/egovph-logo.png" alt="eGovPH" className="resident-mobile-logo" />
          <button type="button" className="resident-mobile-avatar" onClick={logout}>
            {profile.first_name[0]}
          </button>
        </header>

        <section className="resident-mobile-greeting section-card">
          <div>
            <p className="resident-mobile-eyebrow">Mabuhay, {profile.first_name.toUpperCase()}</p>
            <h1>Welcome to eGovPH</h1>
            <p>HANDA is the active demo service for your disaster response check-in.</p>
          </div>
          <button type="button" className="pill-btn ghost" onClick={logout}>Sign out</button>
        </section>

        <section className="resident-mobile-meta section-card">
          <span>☀ Metro Manila</span>
          <span>{currentDate}</span>
        </section>

        <section className="resident-mobile-search section-card">
          <span>Search Services like <strong>National ID</strong></span>
          <span className="resident-mobile-search-icon">⌕</span>
        </section>

        <section className="resident-mobile-services">
          {QUICK_SERVICES.map(service => (
            <button key={service.label} type="button" className="resident-mobile-service">
              <span>{service.icon}</span>
              <strong>{service.label}</strong>
            </button>
          ))}
        </section>

        <section className="resident-mobile-handa-card section-card">
          <div>
            <p className="resident-mobile-eyebrow">Active Demo</p>
            <h2>{activeCampaign ? activeCampaign.name : 'HANDA Disaster Check-In'}</h2>
            <p>
              {activeCampaign
                ? `${activeCampaign.disaster_type} on ${activeCampaign.disaster_date}. Open HANDA to report needs, translate the alert, and ask eGov AI.`
                : 'No active campaign right now. The layout stays ready for the next HANDA alert.'}
            </p>
          </div>
          <button
            type="button"
            className="big-btn primary"
            onClick={() => setSheetState('expanded')}
            disabled={!shouldShowHandaSheet}
          >
            Open HANDA
          </button>
        </section>

        <section className="resident-mobile-preview-grid">
          {PREVIEW_CARDS.map(card => (
            <article key={card.title} className="section-card resident-mobile-preview-card">
              <p className="resident-mobile-eyebrow">Preview Only</p>
              <h3>{card.title}</h3>
              <p>{card.body}</p>
            </article>
          ))}
        </section>

        <nav className="resident-mobile-nav">
          <button type="button" className="resident-mobile-nav-item active">
            <span>⌂</span>
            <strong>Home</strong>
          </button>
          <button type="button" className="resident-mobile-nav-item">
            <span>▣</span>
            <strong>Scan</strong>
          </button>
          <button
            type="button"
            className="resident-mobile-nav-center"
            onClick={() => setSheetState('expanded')}
          >
            HANDA
          </button>
          <button type="button" className="resident-mobile-nav-item">
            <span>☰</span>
            <strong>History</strong>
          </button>
          <button type="button" className="resident-mobile-nav-item" onClick={logout}>
            <span>◌</span>
            <strong>Account</strong>
          </button>
        </nav>
      </div>

      {shouldShowHandaSheet && activeCampaign && !showEReportModal && (
        <HandaBottomSheet
          state={sheetState}
          onStateChange={setSheetState}
          title={activeCampaign.name}
          subtitle={residentCheckIn ? `Case status: ${residentCheckIn.status}` : 'Disaster needs check-in'}
        >
          <div className="resident-sheet-stack">
            <section className="resident-sheet-card resident-sheet-translate-top">
              <div>
                <p className="resident-mobile-eyebrow">eGov AI</p>
                <h3>{translatedCopy ? 'Naisalin sa Filipino' : 'Translate this sheet'}</h3>
                <p>{translatedCopy ? 'Bottom-sheet labels are now shown in Filipino.' : 'Translate the alert and needs form into Filipino.'}</p>
              </div>
              <button type="button" className="pill-btn primary" onClick={handleTranslateSheet} disabled={isTranslatingSheet}>
                {isTranslatingSheet ? 'Translating...' : 'Translate to Filipino'}
              </button>
            </section>

            <section className="resident-sheet-card resident-sheet-alert">
              <div>
                <p className="resident-mobile-eyebrow">{text('alertLabel', 'Emergency Alert')}</p>
                <h3>{text('alertTitle', activeCampaign.name)}</h3>
                <p>
                  {text('alertBody', `${activeCampaign.disaster_type} declared on ${activeCampaign.disaster_date}. Report your household needs now so responders can prioritize aid.`)}
                </p>
              </div>
              <span className={`status-chip ${residentCheckIn?.status === 'resolved' ? 'good' : residentCheckIn?.status === 'visited' ? 'warn' : 'open'}`}>
                {text('status', residentCheckIn?.status ?? 'pending')}
              </span>
            </section>

            <section className="resident-sheet-card resident-sheet-actions">
              {!residentCheckIn && (
                <>
                  <button type="button" className="big-btn primary" onClick={() => { setShowSurvey(true); setSheetState('expanded') }}>
                    {text('affected', "Yes, I'm affected")}
                  </button>
                  <button type="button" className="big-btn ghost" onClick={() => setSheetState('minimized')}>
                    {text('later', 'Later')}
                  </button>
                </>
              )}

              {residentCheckIn && (
                <div className="resident-sheet-status-copy">
                  <strong>{text('submittedTitle', 'Check-in submitted')}</strong>
                  <p>{text('submittedBody', 'Your case stays pinned here until the LGU marks it resolved.')}</p>
                </div>
              )}

              <button type="button" className="pill-btn ghost" onClick={handleOpenEReport}>
                {text('eReport', 'File eReport Case')}
              </button>
            </section>
            {showSurvey && !residentCheckIn && (
              <section className="resident-sheet-card resident-sheet-form">
                <div className="resident-sheet-section-title">
                  <h3>{text('needsTitle', 'Report your needs')}</h3>
                  <button type="button" className="pill-btn ghost" onClick={() => setShowSurvey(false)}>{text('hide', 'Hide')}</button>
                </div>
                <div className="resident-sheet-question-list">
                  {residentQuestions.map((question, index) => (
                    <button
                      key={question.id}
                      type="button"
                      className={`resident-sheet-question ${answers[question.id] === 'yes' ? 'active' : ''}`}
                      onClick={() => setAnswers(prev => ({
                        ...prev,
                        [question.id]: prev[question.id] === 'yes' ? 'no' : 'yes',
                      }))}
                    >
                      <span>
                        <strong>{text(`question_${index}`, question.question_text)}</strong>
                        <small>{text(`category_${index}`, question.need_category)}</small>
                      </span>
                      <strong>{answerText(answers[question.id] === 'yes')}</strong>
                    </button>
                  ))}
                </div>
                <button type="button" className="big-btn primary" onClick={handleSubmit}>
                  Submit to HANDA
                </button>
              </section>
            )}

            <section className="resident-sheet-card">
              <div className="resident-sheet-section-title">
                <h3>{text('aiTitle', 'eGov AI for HANDA')}</h3>
              </div>
              <CitizenHelpChat embedded />
            </section>
          </div>
        </HandaBottomSheet>
      )}

      <DisasterReportForm
        key={`${showEReportModal}-${activeCampaign?.id ?? 'none'}`}
        isOpen={showEReportModal}
        onClose={() => setShowEReportModal(false)}
        disasterName={activeCampaign?.name}
        campaignDefaults={eReportDefaults}
        userProfile={{
          first_name: profile.first_name,
          last_name: profile.last_name,
          mobile: profile.mobile,
          email: profile.email,
        }}
      />

      {showSubmissionModal && (
        <div className="modal-overlay" onClick={() => setShowSubmissionModal(false)}>
          <div className="modal-card resident-confirmation-modal" onClick={(event) => event.stopPropagation()}>
            <p className="resident-mobile-eyebrow">Assessment Submitted</p>
            <h2>Wait for the latest update from your LGU</h2>
            <p>
              Your household needs have been logged. Keep this sample QR ready for future scanning if your address or relief status needs field verification later on.
            </p>

            <div className="resident-qr-card">
              <div className="resident-qr-grid" aria-hidden="true">
                {Array.from({ length: 49 }).map((_, index) => (
                  <span
                    key={index}
                    className={`resident-qr-cell ${[
                      0, 1, 2, 4, 6, 7, 8,
                      10, 12, 14, 15, 18, 20,
                      21, 22, 24, 26, 27,
                      28, 30, 32, 34, 35,
                      36, 38, 40, 42, 43, 44,
                      46, 48,
                    ].includes(index) ? 'filled' : ''}`}
                  />
                ))}
              </div>
              <div>
                <strong>Sample Resident Scan Code</strong>
                <p>Use this later for address verification and addressed-help updates once LGU scanning is enabled.</p>
              </div>
            </div>

            <div className="resident-confirmation-actions">
              <button type="button" className="big-btn primary" onClick={() => setShowSubmissionModal(false)}>
                Got it
              </button>
            </div>
          </div>
        </div>
      )}

      {toastMsg && <div className="toast-bar left-4 right-4 md:left-auto md:right-6 md:max-w-[360px]">{toastMsg}</div>}
    </>
  )
}
