import { useState } from 'react'
import { useHandaStore } from './shared'
import { Button } from '@/components/ui/button'

function App() {
  const store = useHandaStore()
  const { official, loginOfficial, logoutOfficial, data, createCampaign, addQuestion, removeQuestion } = store

  const [name, setName] = useState('')
  const [disasterType, setDisasterType] = useState('Typhoon')
  const [disasterDate, setDisasterDate] = useState('')
  const [newQ, setNewQ] = useState('')
  const [newCat, setNewCat] = useState('')
  const [editingCampaignId, setEditingCampaignId] = useState<string | null>(null)

  const draftCampaigns = data.campaigns.filter(c => c.status === 'draft')
  const activeCampaign = data.campaigns.find(c => c.status === 'active')

  function handleCreateCampaign(e: React.FormEvent) {
    e.preventDefault()
    if (!name || !disasterDate) return
    const c = createCampaign({ name, disaster_type: disasterType, disaster_date: disasterDate })
    if (c) {
      setEditingCampaignId(c.id)
      setName('')
      setDisasterDate('')
    }
  }

  function handleAddQuestion(e: React.FormEvent) {
    e.preventDefault()
    if (!editingCampaignId || !newQ || !newCat) return
    addQuestion(editingCampaignId, newQ, newCat)
    setNewQ('')
    setNewCat('')
  }

  if (!official) {
    return (
      <div className="mx-auto max-w-[960px] p-6 font-sans">
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
    <div className="mx-auto max-w-[960px] p-6 font-sans">
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
          <h2 className="text-sm font-semibold uppercase tracking-wide text-foreground mb-2">Active Campaign</h2>
          <p className="text-sm"><strong>{activeCampaign.name}</strong> — {activeCampaign.disaster_type}, {activeCampaign.disaster_date}</p>
          <span className="inline-block mt-1 bg-[#eff6ff] text-[#0646f4] px-2 py-0.5 rounded-full text-xs font-medium">Active</span>
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
              <option>Typhoon</option>
              <option>Flood</option>
              <option>Fire</option>
              <option>Earthquake</option>
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor="campaign-date" className="text-sm font-medium text-muted-foreground">Disaster date</label>
            <input id="campaign-date" type="date" value={disasterDate} onChange={e => setDisasterDate(e.target.value)} className="border border-border rounded-md px-3 py-1.5 text-sm" />
          </div>
          <div>
            <Button type="submit">Save draft</Button>
          </div>
        </form>
      </div>

      {editingCampaignId && (
        <div className="border border-border rounded-xl p-4 mb-4">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-foreground mb-3">Question Set</h2>
          <ul className="list-none p-0 m-0 mb-3">
            {data.questions
              .filter(q => q.campaign_id === editingCampaignId)
              .sort((a, b) => a.display_order - b.display_order)
              .map(q => (
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
            <div>
              <Button type="submit" variant="ghost">Add question</Button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}

export default App
