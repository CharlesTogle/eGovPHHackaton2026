export type ShellProps = {
  official: { name: string; uniqid: string; role: string; barangay_code: string } | null
  sidebarTab: 'dashboard' | 'campaigns'
  onNavigate: (tab: 'dashboard' | 'campaigns') => void
  onLogout: () => void
  children: React.ReactNode
}

export function Shell({ official, sidebarTab, onNavigate, onLogout, children }: ShellProps) {
  return (
    <div className="w-full" style={{ fontFamily: 'Arial, Helvetica, sans-serif' }}>
      <header className="glass-topbar flex items-center justify-between gap-4 py-[14px] px-4 md:px-7 min-h-[60px] border-b" style={{ background: '#fff', borderColor: 'var(--line)' }}>
        <div className="flex items-center gap-3">
          <img src="public/egovph-logo.png" alt="eGovPH" className="h-8 md:h-9 w-auto" />
          <div>
            <strong style={{ display: 'block', fontSize: '18px', color: 'var(--ink)' }}>HANDA</strong>
            <span className="hidden md:inline" style={{ color: 'var(--muted-text)', fontSize: '14px' }}>Barangay Dashboard</span>
          </div>
        </div>
        {official && (
          <div className="hidden md:flex items-center gap-3">
            <div className="flex items-center gap-2 text-sm">
              <span style={{ fontWeight: 700, color: 'var(--ink)' }}>{official.name}</span>
              <span style={{ color: 'var(--muted-text)', fontSize: '12px' }}>{official.uniqid}</span>
              <span className="status-chip" style={{ background: '#e9efff', color: 'var(--blue-2)' }}>{official.role}</span>
              <span className="status-chip hidden lg:inline-flex" style={{ background: '#e9efff', color: 'var(--blue-2)' }}>{official.barangay_code}</span>
            </div>
            <button className="pill-btn ghost" onClick={onLogout}>Sign out</button>
          </div>
        )}
        {official && (
          <div className="md:hidden flex items-center gap-2">
            <span style={{ fontWeight: 700, color: 'var(--ink)', fontSize: '13px' }}>{official.name.split(' ')[0]}</span>
            <button className="pill-btn ghost" style={{ fontSize: '12px', padding: '6px 10px' }} onClick={onLogout}>Sign out</button>
          </div>
        )}
      </header>

      <div className="dashboard-layout">
        <aside className="dashboard-sidebar hidden md:block">
          <div className="flex flex-col gap-1">
            <button className={`side-link ${sidebarTab === 'dashboard' ? 'active' : ''}`} onClick={() => onNavigate('dashboard')}>Dashboard</button>
            <button className={`side-link ${sidebarTab === 'campaigns' ? 'active' : ''}`} onClick={() => onNavigate('campaigns')}>Assessments</button>
          </div>
        </aside>
        <div className="dashboard-main">
          {children}
        </div>
      </div>
    </div>
  )
}
