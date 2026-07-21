import { useState } from 'react'
import { useHandaStore } from './shared'
import type { HandaData, DashboardRow, CheckInStatus, Household, Official } from './shared'
import { Button } from '@/components/ui/button'

type ResidentStep = 'home' | 'prompt' | 'match' | 'questions' | 'done'

type StoreProps = {
  official: Official | null
  loginOfficial: () => void
  logoutOfficial: () => void
  data: HandaData
  createCampaign: (input: { name: string; disaster_type: string; disaster_date: string }) => import('./shared').Campaign | null
  addQuestion: (campaignId: string, question_text: string, need_category: string) => void
  removeQuestion: (questionId: string) => void
  updateCampaignStatus: (campaignId: string, status: import('./shared').CampaignStatus) => void
  updateCaseStatus: (checkInId: string, status: CheckInStatus) => void
  submitCheckIn: (input: { campaign_id: string; household_id: string; submitted_by: string; answers: { question_id: string; answer: string }[] }) => import('./shared').CheckIn
  getDashboard: (campaignId: string) => import('./shared').Dashboard
}

function ResidentFlow({ data, submitCheckIn }: Pick<StoreProps, 'data' | 'submitCheckIn'>) {
  const activeCampaign = data.campaigns.find(c => c.status === 'active')
  const questions = activeCampaign
    ? data.questions.filter(q => q.campaign_id === activeCampaign.id).sort((a, b) => a.display_order - b.display_order)
    : []

  const [step, setStep] = useState<ResidentStep>('home')
  const [selectedHousehold, setSelectedHousehold] = useState<Household | null>(null)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [searchName, setSearchName] = useState('')

  const barangayHouseholds = data.households.filter(hh => hh.barangay_code === activeCampaign?.barangay_code)
  const matchedHousehold = searchName
    ? barangayHouseholds.find(hh => {
        const q = searchName.toLowerCase()
        const members = data.members.filter(m => m.household_id === hh.id)
        return hh.household_head_name.toLowerCase().includes(q) ||
          members.some(m => `${m.first_name} ${m.last_name}`.toLowerCase().includes(q))
      }) ?? null
    : barangayHouseholds[0] ?? null

  const filteredHouseholds = searchName
    ? barangayHouseholds.filter(hh => {
        const q = searchName.toLowerCase()
        const members = data.members.filter(m => m.household_id === hh.id)
        return hh.household_head_name.toLowerCase().includes(q) ||
          members.some(m => `${m.first_name} ${m.last_name}`.toLowerCase().includes(q))
      })
    : []

  function toggleAnswer(qId: string) {
    setAnswers(prev => ({ ...prev, [qId]: prev[qId] === 'yes' ? 'no' : 'yes' }))
  }

  function handleSubmit() {
    if (!activeCampaign || !selectedHousehold) return
    const answerList = Object.entries(answers)
      .filter(([, v]) => v)
      .map(([question_id, answer]) => ({ question_id, answer }))
    submitCheckIn({
      campaign_id: activeCampaign.id,
      household_id: selectedHousehold.id,
      submitted_by: selectedHousehold.household_head_name,
      answers: answerList,
    })
    setStep('done')
  }

  if (!activeCampaign) {
    return (
      <div className="mx-auto max-w-[375px] p-6 font-sans">
        <div className="border border-border rounded-xl p-6 text-center">
          <h2 className="text-sm font-semibold text-foreground mb-2">No Active Campaign</h2>
          <p className="text-sm text-muted-foreground">Check back later when your barangay opens a disaster check-in.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-[375px] font-sans">
      {step === 'home' && (
        <div className="p-4">
          <div className="flex items-center justify-between mb-6">
            <span className="text-lg font-bold text-[#0646f4]">eGovPH</span>
          </div>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-full bg-muted" />
            <div>
              <strong className="text-sm">Hi, Resident</strong>
              <span className="block text-xs text-muted-foreground">+63 917 123 4567</span>
            </div>
          </div>
          <div className="border border-border rounded-xl p-4 mb-4">
            <strong className="text-sm">HANDA check-in</strong>
            <p className="text-xs text-muted-foreground mb-3">Tell your barangay if your household was affected by the latest disaster.</p>
            <Button size="sm" onClick={() => setStep('prompt')}>Open HANDA</Button>
          </div>
        </div>
      )}

      {step === 'prompt' && (
        <div className="p-4">
          <div className="flex items-center justify-between mb-4">
            <Button variant="ghost" size="xs" onClick={() => setStep('home')}>Back</Button>
            <span className="text-sm font-bold text-[#0646f4]">eGovPH</span>
          </div>
          <div className="h-1 bg-muted rounded-full mb-4"><div className="h-full bg-[#0646f4] rounded-full w-1/4" /></div>
          <div className="border border-border rounded-xl p-4">
            <span className="text-xs font-medium text-[#d83a34]">Typhoon assessment</span>
            <h2 className="text-lg font-bold mt-1 mb-2">Are you affected by {activeCampaign.name}?</h2>
            <p className="text-xs text-muted-foreground mb-4">Barangay {activeCampaign.barangay_code} is checking which households need shelter, medical help, food, or water.</p>
            <div className="flex flex-col gap-2">
              <Button onClick={() => setStep('match')}>Yes, affected</Button>
              <Button variant="ghost" onClick={() => setStep('done')}>No, safe</Button>
            </div>
          </div>
        </div>
      )}

      {step === 'match' && (
        <div className="p-4">
          <div className="flex items-center justify-between mb-4">
            <Button variant="ghost" size="xs" onClick={() => setStep('prompt')}>Back</Button>
            <span className="text-sm font-bold text-[#0646f4]">eGovPH</span>
          </div>
          <div className="h-1 bg-muted rounded-full mb-4"><div className="h-full bg-[#0646f4] rounded-full w-1/2" /></div>
          <h2 className="text-lg font-bold mb-1">Confirm your household</h2>
          <p className="text-xs text-muted-foreground mb-3">We matched your eGovPH profile to the barangay household list.</p>

          {matchedHousehold && (
            <button
              type="button"
              className={`w-full text-left border rounded-xl p-3 mb-2 ${selectedHousehold?.id === matchedHousehold.id ? 'border-[#0646f4] bg-[#eff6ff]' : 'border-border'}`}
              onClick={() => setSelectedHousehold(matchedHousehold)}
            >
              <strong className="text-sm">{matchedHousehold.household_head_name}</strong>
              <span className="block text-xs text-muted-foreground">{matchedHousehold.address}</span>
            </button>
          )}

          <div className="border border-border rounded-xl p-3 mb-2">
            <label htmlFor="hh-search" className="text-xs font-medium text-muted-foreground block mb-1">Not your household? Search or pick from the list</label>
            <input
              id="hh-search"
              value={searchName}
              onChange={e => setSearchName(e.target.value)}
              placeholder="Search by name..."
              className="border border-border rounded-md px-3 py-1.5 text-sm w-full"
            />
          </div>

          {(searchName ? filteredHouseholds : barangayHouseholds).length > 0 && (
            <div className="border border-border rounded-xl max-h-48 overflow-y-auto mb-4">
              {(searchName ? filteredHouseholds : barangayHouseholds).map(hh => (
                <button
                  key={hh.id}
                  type="button"
                  className={`w-full text-left px-3 py-2 text-sm border-b border-border last:border-0 hover:bg-muted/50 ${selectedHousehold?.id === hh.id ? 'bg-[#eff6ff]' : ''}`}
                  onClick={() => { setSelectedHousehold(hh); setSearchName('') }}
                >
                  <strong>{hh.household_head_name}</strong>
                  <span className="block text-xs text-muted-foreground">{hh.address}</span>
                </button>
              ))}
            </div>
          )}

          <Button disabled={!selectedHousehold} onClick={() => setStep('questions')}>Use this household</Button>
        </div>
      )}

      {step === 'questions' && (
        <div className="p-4">
          <div className="flex items-center justify-between mb-4">
            <Button variant="ghost" size="xs" onClick={() => setStep('match')}>Back</Button>
            <span className="text-sm font-bold text-[#0646f4]">eGovPH</span>
          </div>
          <div className="h-1 bg-muted rounded-full mb-4"><div className="h-full bg-[#0646f4] rounded-full w-3/4" /></div>
          <h2 className="text-lg font-bold mb-3">What does your household need?</h2>
          <div className="flex flex-col gap-2 mb-4">
            {questions.map(q => (
              <button
                key={q.id}
                type="button"
                className={`w-full text-left border rounded-xl p-3 ${answers[q.id] === 'yes' ? 'border-[#0646f4] bg-[#eff6ff]' : 'border-border'}`}
                onClick={() => toggleAnswer(q.id)}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <strong className="text-sm">{q.question_text}</strong>
                    <span className="block text-xs text-muted-foreground">{q.need_category}</span>
                  </div>
                  <span className={`text-xs font-medium ${answers[q.id] === 'yes' ? 'text-[#0646f4]' : 'text-muted-foreground'}`}>
                    {answers[q.id] === 'yes' ? 'Yes' : 'No'}
                  </span>
                </div>
              </button>
            ))}
          </div>
          <Button onClick={handleSubmit}>Submit report</Button>
        </div>
      )}

      {step === 'done' && (
        <div className="p-4 text-center">
          <div className="w-12 h-12 rounded-full bg-green-100 text-green-700 flex items-center justify-center text-xl mx-auto mb-4">&#10003;</div>
          <h2 className="text-lg font-bold mb-1">Report sent</h2>
          <p className="text-sm text-muted-foreground mb-4">Your barangay can now see your household needs. A responder may visit if follow-up is needed.</p>
          <Button onClick={() => { setStep('home'); setAnswers({}); setSelectedHousehold(null); setSearchName('') }}>Return home</Button>
        </div>
      )}
    </div>
  )
}

function OfficialConsole({ official, loginOfficial, logoutOfficial, data, createCampaign, addQuestion, removeQuestion, updateCampaignStatus, updateCaseStatus, getDashboard }: Omit<StoreProps, 'submitCheckIn'>) {
  const [name, setName] = useState('')
  const [disasterType, setDisasterType] = useState('Typhoon')
  const [disasterDate, setDisasterDate] = useState('')
  const [newQ, setNewQ] = useState('')
  const [newCat, setNewCat] = useState('')
  const [editingCampaignId, setEditingCampaignId] = useState<string | null>(null)
  const [selectedRow, setSelectedRow] = useState<DashboardRow | null>(null)
  const [modalStatus, setModalStatus] = useState<CheckInStatus>('unresolved')

  const draftCampaigns = data.campaigns.filter(c => c.status === 'draft')
  const activeCampaign = data.campaigns.find(c => c.status === 'active')
  const dashboard = activeCampaign ? getDashboard(activeCampaign.id) : null

  function handleCreateCampaign(e: React.FormEvent) {
    e.preventDefault()
    if (!name || !disasterDate) return
    const c = createCampaign({ name, disaster_type: disasterType, disaster_date: disasterDate })
    if (c) { setEditingCampaignId(c.id); setName(''); setDisasterDate('') }
  }

  function handleAddQuestion(e: React.FormEvent) {
    e.preventDefault()
    if (!editingCampaignId || !newQ || !newCat) return
    addQuestion(editingCampaignId, newQ, newCat); setNewQ(''); setNewCat('')
  }

  function openModal(row: DashboardRow) { setSelectedRow(row); setModalStatus(row.checkIn?.status ?? 'unresolved') }
  function handleSaveStatus() { if (!selectedRow?.checkIn) return; updateCaseStatus(selectedRow.checkIn.id, modalStatus); setSelectedRow(null) }

  if (!official) {
    return (
      <div className="mx-auto max-w-[960px] p-6">
        <header className="mb-6">
          <h1 className="text-2xl font-bold text-[#0646f4]">HANDA</h1>
          <span className="text-sm text-muted-foreground">Disaster Check-in System</span>
        </header>
        <div className="border border-border rounded-xl p-6 max-w-[400px] text-center">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-foreground mb-2">Barangay Official Login</h2>
          <p className="text-sm text-muted-foreground mb-4">Sign in with your eGovPH account to manage campaigns.</p>
          <Button onClick={loginOfficial}>Sign in as Official</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-[960px] p-6">
      <header className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#0646f4]">HANDA</h1>
          <span className="text-sm text-muted-foreground">Disaster Check-in System</span>
        </div>
        <div className="flex items-center gap-3 text-sm">
          <span className="font-semibold">{official.name}</span>
          <span className="text-muted-foreground">{official.uniqid}</span>
          <span className="bg-[#eff6ff] text-[#0646f4] px-2 py-0.5 rounded-full text-xs font-medium">{official.role}</span>
          <span className="bg-[#eff6ff] text-[#0646f4] px-2 py-0.5 rounded-full text-xs font-medium">{official.barangay_code}</span>
          <Button variant="ghost" size="sm" onClick={logoutOfficial}>Sign out</Button>
        </div>
      </header>

      {activeCampaign && (
        <div className="border border-border rounded-xl p-4 mb-4">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-foreground">Active Campaign</h2>
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" onClick={() => updateCampaignStatus(activeCampaign.id, 'closed')}>Close</Button>
              <Button variant="ghost" size="sm" onClick={() => updateCampaignStatus(activeCampaign.id, 'archived')}>Archive</Button>
            </div>
          </div>
          <p className="text-sm"><strong>{activeCampaign.name}</strong> — {activeCampaign.disaster_type}, {activeCampaign.disaster_date}</p>
          <span className="inline-block mt-1 bg-[#eff6ff] text-[#0646f4] px-2 py-0.5 rounded-full text-xs font-medium">Active</span>
        </div>
      )}

      {dashboard && (
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div className="border border-border rounded-xl p-4 text-center">
            <span className="block text-3xl font-bold text-[#0646f4]">{dashboard.affectedCount}</span>
            <span className="text-xs uppercase tracking-wide text-muted-foreground">Affected</span>
          </div>
          <div className="border border-border rounded-xl p-4 text-center">
            <span className="block text-3xl font-bold text-[#d83a34]">{dashboard.unresolvedCount}</span>
            <span className="text-xs uppercase tracking-wide text-muted-foreground">Unresolved</span>
          </div>
          <div className="border border-border rounded-xl p-4 text-center">
            <span className="block text-3xl font-bold text-muted-foreground">{dashboard.noCheckInCount}</span>
            <span className="text-xs uppercase tracking-wide text-muted-foreground">No Check-in</span>
          </div>
        </div>
      )}

      {dashboard && Object.keys(dashboard.needBreakdown).length > 0 && (
        <div className="border border-border rounded-xl p-4 mb-4">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-foreground mb-2">Need Breakdown</h2>
          <div className="flex flex-wrap gap-3">
            {Object.entries(dashboard.needBreakdown).map(([cat, count]) => (
              <span key={cat} className="bg-muted text-muted-foreground px-3 py-1 rounded-full text-sm">{cat} {count}</span>
            ))}
          </div>
        </div>
      )}

      {dashboard && (
        <div className="border border-border rounded-xl p-4 mb-4">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-foreground mb-3">Household Queue</h2>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b-2 border-border">
                <th className="text-left py-2 font-semibold text-muted-foreground">Household</th>
                <th className="text-left py-2 font-semibold text-muted-foreground">Address</th>
                <th className="text-left py-2 font-semibold text-muted-foreground">Status</th>
                <th className="text-left py-2 font-semibold text-muted-foreground">Submitted By</th>
              </tr>
            </thead>
            <tbody>
              {dashboard.rows.map(r => (
                <tr key={r.household.id} className="border-b border-border last:border-0 cursor-pointer hover:bg-muted/50" onClick={() => openModal(r)}>
                  <td className="py-2">{r.household.household_head_name}</td>
                  <td className="py-2 text-muted-foreground">{r.household.address}</td>
                  <td className="py-2">
                    <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${
                      r.checkIn?.status === 'resolved' ? 'bg-green-50 text-green-700'
                      : r.checkIn?.status === 'visited' ? 'bg-yellow-50 text-yellow-700'
                      : r.checkIn?.status === 'unresolved' ? 'bg-red-50 text-red-700'
                      : 'bg-muted text-muted-foreground'
                    }`}>{r.checkIn?.status ?? 'No check-in'}</span>
                  </td>
                  <td className="py-2 text-muted-foreground">{r.submitted_by ?? '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {draftCampaigns.length > 0 && (
        <div className="border border-border rounded-xl p-4 mb-4">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-foreground mb-2">Draft Campaigns</h2>
          <ul className="list-none p-0 m-0">
            {draftCampaigns.map(c => (
              <li key={c.id} className="flex items-center justify-between py-2 border-b border-border last:border-0 text-sm">
                <span>{c.name} — {c.disaster_type}, {c.disaster_date}</span>
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm" onClick={() => setEditingCampaignId(c.id)}>Edit</Button>
                  <Button size="sm" onClick={() => updateCampaignStatus(c.id, 'active')}>Publish</Button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="border border-border rounded-xl p-4 mb-4">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-foreground mb-3">{editingCampaignId ? 'Edit Campaign' : 'Create Campaign'}</h2>
        <form onSubmit={handleCreateCampaign} className="flex flex-col gap-3">
          <div className="flex flex-col gap-1">
            <label htmlFor="campaign-name" className="text-sm font-medium text-muted-foreground">Disaster name</label>
            <input id="campaign-name" value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Typhoon Odette" className="border border-border rounded-md px-3 py-1.5 text-sm" />
            <span className="text-xs text-muted-foreground">Shown to residents in the check-in prompt.</span>
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor="campaign-type" className="text-sm font-medium text-muted-foreground">Disaster type</label>
            <select id="campaign-type" value={disasterType} onChange={e => setDisasterType(e.target.value)} className="border border-border rounded-md px-3 py-1.5 text-sm">
              <option>Typhoon</option><option>Flood</option><option>Fire</option><option>Earthquake</option>
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor="campaign-date" className="text-sm font-medium text-muted-foreground">Disaster date</label>
            <input id="campaign-date" type="date" value={disasterDate} onChange={e => setDisasterDate(e.target.value)} className="border border-border rounded-md px-3 py-1.5 text-sm" />
          </div>
          <div><Button type="submit">Save draft</Button></div>
        </form>
      </div>

      {editingCampaignId && (
        <div className="border border-border rounded-xl p-4 mb-4">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-foreground mb-3">Question Set</h2>
          <ul className="list-none p-0 m-0 mb-3">
            {data.questions.filter(q => q.campaign_id === editingCampaignId).sort((a, b) => a.display_order - b.display_order).map(q => (
              <li key={q.id} className="flex items-center justify-between border border-border rounded-lg p-3 mb-2">
                <div>
                  <strong className="text-sm">{q.question_text}</strong>
                  <p className="text-xs text-muted-foreground">Need category: {q.need_category}</p>
                </div>
                <Button variant="ghost" size="xs" onClick={() => removeQuestion(q.id)}>Remove</Button>
              </li>
            ))}
          </ul>
          <form onSubmit={handleAddQuestion} className="flex flex-col gap-3 border-t border-border pt-3">
            <div className="flex flex-col gap-1">
              <label htmlFor="q-text" className="text-sm font-medium text-muted-foreground">Question</label>
              <input id="q-text" value={newQ} onChange={e => setNewQ(e.target.value)} placeholder="e.g. Is your home damaged?" className="border border-border rounded-md px-3 py-1.5 text-sm" />
            </div>
            <div className="flex flex-col gap-1">
              <label htmlFor="q-cat" className="text-sm font-medium text-muted-foreground">Need category</label>
              <input id="q-cat" value={newCat} onChange={e => setNewCat(e.target.value)} placeholder="e.g. Shelter" className="border border-border rounded-md px-3 py-1.5 text-sm" />
            </div>
            <div><Button type="submit" variant="ghost">Add question</Button></div>
          </form>
        </div>
      )}

      {selectedRow && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setSelectedRow(null)}>
          <div className="bg-white border border-border rounded-xl p-6 w-full max-w-md mx-4" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-foreground">Case Detail</h2>
              <Button variant="ghost" size="xs" onClick={() => setSelectedRow(null)}>Close</Button>
            </div>
            <div className="mb-4">
              <p className="text-sm"><strong>{selectedRow.household.household_head_name}</strong></p>
              <p className="text-xs text-muted-foreground">{selectedRow.household.address}</p>
              <p className="text-xs text-muted-foreground">{selectedRow.household.member_count} members</p>
            </div>
            {selectedRow.checkIn && (
              <>
                <div className="mb-4">
                  <label className="text-sm font-medium text-muted-foreground block mb-1">Status</label>
                  <select value={modalStatus} onChange={e => setModalStatus(e.target.value as CheckInStatus)} className="border border-border rounded-md px-3 py-1.5 text-sm w-full">
                    <option value="unresolved">Unresolved</option>
                    <option value="visited">Visited</option>
                    <option value="resolved">Resolved</option>
                  </select>
                </div>
                <div className="mb-4"><p className="text-xs text-muted-foreground">Submitted by: {selectedRow.submitted_by}</p></div>
                {selectedRow.answers.length > 0 && (
                  <div className="mb-4">
                    <p className="text-xs font-medium text-muted-foreground mb-1">Answers</p>
                    <ul className="list-none p-0 m-0">
                      {selectedRow.answers.map(a => {
                        const q = data.questions.find(q => q.id === a.question_id)
                        return (
                          <li key={a.id} className="text-sm py-1 border-b border-border last:border-0">
                            {q?.question_text ?? 'Unknown'}: <span className={a.answer === 'yes' ? 'text-[#d83a34] font-medium' : 'text-muted-foreground'}>{a.answer}</span>
                          </li>
                        )
                      })}
                    </ul>
                  </div>
                )}
                <div className="flex gap-2">
                  <Button onClick={handleSaveStatus}>Save</Button>
                  <Button variant="ghost" onClick={() => setSelectedRow(null)}>Cancel</Button>
                </div>
              </>
            )}
            {!selectedRow.checkIn && <p className="text-sm text-muted-foreground">No check-in submitted yet.</p>}
          </div>
        </div>
      )}
    </div>
  )
}

export default function App() {
  const store = useHandaStore()
  const [view, setView] = useState<'official' | 'resident'>('official')

  return (
    <div className="min-h-screen bg-background">
      <nav className="sticky top-0 z-40 bg-background border-b border-border px-6 py-2 flex items-center gap-4">
        <span className="text-sm font-bold text-[#0646f4]">HANDA</span>
        <div className="flex gap-1 text-sm">
          <Button variant={view === 'official' ? 'default' : 'ghost'} size="sm" onClick={() => setView('official')}>Team Console</Button>
          <Button variant={view === 'resident' ? 'default' : 'ghost'} size="sm" onClick={() => setView('resident')}>Resident Flow</Button>
        </div>
      </nav>
      {view === 'official'
        ? <OfficialConsole {...store} />
        : <ResidentFlow data={store.data} submitCheckIn={store.submitCheckIn} />}
    </div>
  )
}
