import React from 'react'

export type SidebarTab = 'dashboard' | 'campaigns' | 'developers' | 'datasets' | 'apikeys' | 'docs'

export type ShellProps = {
  official: { name: string; uniqid: string; role: string; barangay_code: string } | null
  sidebarTab: SidebarTab
  onNavigate: (tab: any) => void
  onLogout: () => void
  children: React.ReactNode
  role?: 'official' | 'resident' | 'developer' | 'lgu'
}

export function Shell({ official, sidebarTab, onNavigate, onLogout, children, role = 'official' }: ShellProps) {
  const isOfficial = role === 'official'
  const isDeveloper = role === 'developer'
  const isLgu = role === 'lgu'

  return (
    <div className="w-full min-h-screen bg-[var(--soft-bg)] font-sans antialiased text-[var(--ink)]">
      <header className="glass-topbar flex items-center justify-between gap-2 sm:gap-4 py-2.5 px-3 sm:px-6 min-h-[56px] sm:min-h-[60px] max-w-full overflow-hidden">
        <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
          <img src="/egovph-logo.png" alt="eGovPH" className="h-6 sm:h-8 w-auto object-contain shrink-0" />
          <div className="h-3.5 sm:h-5 w-px bg-slate-300/70 shrink-0" />
          <img src="/ehanda-logo.png" alt="eHANDA" className="h-4.5 sm:h-6 w-auto object-contain shrink-0" />
          <span className="hidden lg:inline-block text-xs font-semibold px-2.5 py-0.5 rounded-full bg-[var(--blue-soft)] text-[var(--blue-primary)] border border-[var(--blue-soft)] ml-1">
            {isDeveloper ? 'Developer API Portal' : isLgu ? 'LGU Incident Command' : role === 'resident' ? 'Citizen Portal' : 'Barangay Console'}
          </span>
        </div>

        {official && (
          <div className="flex items-center gap-2 shrink-0">
            <span className="font-bold text-xs sm:text-sm text-slate-900 truncate max-w-[110px] sm:max-w-none">
              {official.name}
            </span>
            <button className="pill-btn ghost text-xs py-1 px-2.5 hover:border-red-500 hover:text-red-600" onClick={onLogout}>
              Sign out
            </button>
          </div>
        )}
      </header>

      <div className="dashboard-layout pt-[60px]">
        {(isOfficial || isLgu || isDeveloper) && (
          <aside className="dashboard-sidebar hidden md:block">
            <div className="flex flex-col gap-1">
              {/* Common / Barangay / LGU links */}
              {(isOfficial || isLgu) && (
                <>
                  <button 
                    className={`side-link ${sidebarTab === 'dashboard' ? 'active' : ''}`} 
                    onClick={() => onNavigate('dashboard')}
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                    </svg>
                    Dashboard
                  </button>
                  
                  {isOfficial && (
                    <button 
                      className={`side-link ${sidebarTab === 'campaigns' ? 'active' : ''}`} 
                      onClick={() => onNavigate('campaigns')}
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                      Assessments
                    </button>
                  )}

                  <button 
                    className={`side-link ${sidebarTab === 'developers' ? 'active' : ''}`} 
                    onClick={() => onNavigate('developers')}
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                    </svg>
                    Developer Apps
                  </button>
                </>
              )}

              {/* Developer specific links */}
              {isDeveloper && (
                <>
                  <button 
                    className={`side-link ${sidebarTab === 'dashboard' ? 'active' : ''}`} 
                    onClick={() => onNavigate('dashboard')}
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    Overview & Credits
                  </button>

                  <button 
                    className={`side-link ${sidebarTab === 'docs' ? 'active' : ''}`} 
                    onClick={() => onNavigate('docs')}
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                    </svg>
                    API Documentation
                  </button>

                  <button 
                    className={`side-link ${sidebarTab === 'datasets' ? 'active' : ''}`} 
                    onClick={() => onNavigate('datasets')}
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
                    </svg>
                    eReport Datasets
                  </button>

                  <button 
                    className={`side-link ${sidebarTab === 'apikeys' ? 'active' : ''}`} 
                    onClick={() => onNavigate('apikeys')}
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                    </svg>
                    API Key Management
                  </button>
                </>
              )}
            </div>
          </aside>
        )}
        
        <main className="dashboard-main">
          {children}
        </main>
      </div>
    </div>
  )
}
