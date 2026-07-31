type CampaignDefaults = {
  subject?: string
  message?: string
  reportType?: string
  regionCode?: string
  provinceCode?: string
  municipalityCode?: string
  barangayCode?: string
}

type UserProfile = {
  first_name: string
  last_name: string
  mobile: string | null
  email: string | null
}

type DisasterReportFormProps = {
  isOpen: boolean
  onClose: () => void
  disasterName?: string
  campaignDefaults: CampaignDefaults | null
  userProfile: UserProfile
}

export function DisasterReportForm({ isOpen, onClose, disasterName, campaignDefaults, userProfile }: DisasterReportFormProps) {
  if (!isOpen) return null

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(event) => event.stopPropagation()}>
        <p className="resident-mobile-eyebrow">eReport Demo</p>
        <h2>{disasterName ?? "Disaster Report"}</h2>
        <p>
          Prefilled for {userProfile.first_name} {userProfile.last_name}. Full live eReport submission is not wired in this build.
        </p>
        <pre className="mt-3 p-3 bg-slate-900 text-emerald-400 rounded-xl text-xs font-mono overflow-x-auto">
          <code>{JSON.stringify(campaignDefaults, null, 2)}</code>
        </pre>
        <div className="resident-confirmation-actions mt-4">
          <button type="button" className="big-btn primary" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  )
}
