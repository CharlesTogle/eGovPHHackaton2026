import { useSession } from "@/features/auth"

export function CheckInPage() {
  const { session, logout } = useSession()
  if (!session) return null

  return (
    <div className="min-h-dvh flex flex-col items-center justify-center px-4" style={{ background: "var(--egov-soft)" }}>
      <div
        className="w-full max-w-sm flex flex-col items-center gap-4 p-8"
        style={{
          background: "var(--card)",
          borderRadius: "var(--egov-radius)",
          boxShadow: "0 18px 50px rgba(25, 57, 116, 0.08)",
          border: "1px solid rgba(255,255,255,0.78)",
        }}
      >
        <img src="/egovph-logo.png" alt="eGovPH" className="w-32" />

        <div className="text-center">
          <h1 className="text-sm font-bold" style={{ color: "var(--egov-ink)" }}>
            Hi, {session.profile.first_name}
          </h1>
          <p className="text-xs mt-1" style={{ color: "var(--egov-muted)" }}>
            Barangay {session.profile.barangay}
          </p>
        </div>

        <div
          className="w-full p-4 text-center"
          style={{
            background: "var(--egov-soft)",
            borderRadius: "calc(var(--egov-radius) * 0.5)",
          }}
        >
          <p className="text-xs font-semibold" style={{ color: "var(--egov-blue)" }}>
            HANDA check-in
          </p>
          <p className="text-xs mt-1" style={{ color: "var(--egov-muted)" }}>
            Check-in flow — next slice.
          </p>
        </div>

        <button
          type="button"
          onClick={logout}
          className="w-full py-2.5 text-xs font-medium"
          style={{
            border: "1px solid var(--egov-line)",
            borderRadius: "calc(var(--egov-radius) * 0.5)",
            color: "var(--egov-muted)",
          }}
        >
          Sign out
        </button>
      </div>
    </div>
  )
}
