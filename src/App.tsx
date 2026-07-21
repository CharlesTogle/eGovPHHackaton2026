import { useHandaStore } from './shared'

function App() {
  const store = useHandaStore()
  const activeCampaign = store.data.campaigns.find(c => c.status === 'active')

  return (
    <div className="mx-auto max-w-[960px] p-6 font-sans">
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-[#0646f4]">HANDA</h1>
        <span className="text-sm text-muted-foreground">Disaster Check-in System</span>
      </header>

      <div className="border border-border rounded-xl p-4 mb-4">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-foreground mb-2">Active Campaign</h2>
        {activeCampaign ? (
          <div>
            <p className="text-sm"><strong>{activeCampaign.name}</strong></p>
            <p className="text-sm text-muted-foreground">{activeCampaign.disaster_type} — {activeCampaign.disaster_date}</p>
            <p className="text-xs text-muted-foreground">Status: {activeCampaign.status}</p>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">No active campaign</p>
        )}
      </div>

      <div className="border border-border rounded-xl p-4">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-foreground mb-2">Campaigns ({store.data.campaigns.length})</h2>
        <ul className="list-none p-0 m-0">
          {store.data.campaigns.map(c => (
            <li key={c.id} className="text-sm py-1">
              {c.name} —{' '}
              <span className="inline-block px-2 py-0.5 rounded-full text-xs font-medium bg-[#eff6ff] text-[#0646f4]">{c.status}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

export default App
