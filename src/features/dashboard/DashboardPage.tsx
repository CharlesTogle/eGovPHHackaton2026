import { useSession } from "@/features/auth"

export function DashboardPage() {
  const { session, logout } = useSession()
  if (!session) return null

  return (
    <div className="min-h-dvh" style={{ background: "var(--egov-soft)" }}>
      <header
        className="flex items-center justify-between px-6 py-4"
        style={{
          background: "rgba(255,255,255,0.82)",
          borderBottom: "1px solid var(--egov-line)",
        }}
      >
        <div className="flex items-center gap-3">
          <img src="/egovph-logo.png" alt="eGovPH" className="h-8" />
          <div>
            <h1 className="text-sm font-bold" style={{ color: "var(--egov-ink)" }}>
              HANDA — Dashboard
            </h1>
            <p className="text-xs" style={{ color: "var(--egov-muted)" }}>
              Barangay {session.profile.barangay}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs" style={{ color: "var(--egov-muted)" }}>
            {session.profile.first_name} {session.profile.last_name}
          </span>
          <span
            className="text-xs px-2 py-0.5 rounded-full font-medium"
            style={{ background: "var(--egov-blue)", color: "#fff" }}
          >
            Official
          </span>
          <button
            type="button"
            onClick={logout}
            className="text-xs px-3 py-1.5 rounded-full"
            style={{ border: "1px solid var(--egov-line)", color: "var(--egov-muted)" }}
          >
            Sign out
          </button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto p-6">
        <div className="grid grid-cols-3 gap-4 mb-6">
          {[
            { label: "Active campaigns", value: "—" },
            { label: "Affected households", value: "—" },
            { label: "Non-respondents", value: "—" },
          ].map((m) => (
            <div
              key={m.label}
              className="p-4"
              style={{
                background: "var(--card)",
                borderRadius: "var(--egov-radius)",
                border: "1px solid var(--egov-line)",
              }}
            >
              <p className="text-xs" style={{ color: "var(--egov-muted)" }}>
                {m.label}
              </p>
              <p className="text-2xl font-bold mt-1" style={{ color: "var(--egov-ink)" }}>
                {m.value}
              </p>
            </div>
          ))}
        </div>

        <div
          className="p-6 text-center"
          style={{
            background: "var(--card)",
            borderRadius: "var(--egov-radius)",
            border: "1px solid var(--egov-line)",
          }}
        >
          <p className="text-sm" style={{ color: "var(--egov-muted)" }}>
            Campaign builder and dashboard aggregator — next slice.
          </p>
        </div>
      </main>
    </div>
  )
}
