import { useState } from "react"
import { useSession } from "./session-context"
import { requestOTP, confirmOTP } from "./otp"
import type { DemoIdentity } from "./egov-sso"

const USE_MOCK = import.meta.env.VITE_EGOV_SSO_USE_MOCK !== "false"

const DEMO_IDENTITIES: { id: DemoIdentity; label: string; role: string; email: string }[] = [
  { id: "josie", label: "Josie Dela Cruz", role: "Resident", email: "josie@yopmail.com" },
  { id: "alexis", label: "Alexis Ramos", role: "Official", email: "alexis.ramos@yopmail.com" },
  { id: "maria", label: "Maria Santos", role: "Resident", email: "maria@yopmail.com" },
  { id: "pedro", label: "Pedro Reyes", role: "Resident", email: "pedro@yopmail.com" },
  { id: "dev", label: "Dev User", role: "Developer", email: "dev@cityapp.ph" },
  { id: "lgu", label: "Alaminos LGU Command", role: "LGU", email: "lgu.command@alaminos.gov.ph" },
]

type Step = "email" | "otp" | "sso"

export function LoginPage() {
  const { login, isLoading, error } = useSession()
  const [step, setStep] = useState<Step>("email")
  const [selected, setSelected] = useState<DemoIdentity>("josie")
  const [email, setEmail] = useState("")
  const [otp, setOtp] = useState("")
  const [otpError, setOtpError] = useState<string | null>(null)

  async function handleSendOTP() {
    setOtpError(null)
    try {
      const targetEmail = USE_MOCK ? DEMO_IDENTITIES.find((d) => d.id === selected)?.email ?? email : email
      if (!targetEmail) {
        setOtpError("Please enter an email address")
        return
      }
      const { already_verified } = await requestOTP(targetEmail)
      if (already_verified) {
        setStep("sso")
        await login(USE_MOCK ? selected : undefined)
        return
      }
      setStep("otp")
    } catch (err) {
      setOtpError(err instanceof Error ? err.message : "Failed to send OTP")
    }
  }

  async function handleConfirmOTP() {
    setOtpError(null)
    try {
      const targetEmail = USE_MOCK ? DEMO_IDENTITIES.find((d) => d.id === selected)?.email ?? email : email
      const verified = await confirmOTP(targetEmail, otp)
      if (!verified) {
        setOtpError("Invalid OTP code")
        return
      }
      setStep("sso")
      await login(USE_MOCK ? selected : undefined)
    } catch (err) {
      setOtpError(err instanceof Error ? err.message : "OTP verification failed")
    }
  }

  return (
    <div className="min-h-dvh flex flex-col items-center justify-center px-4" style={{ background: "var(--egov-soft)" }}>
      <div
        className="w-full max-w-sm flex flex-col items-center gap-6 p-8"
        style={{
          background: "var(--card)",
          borderRadius: "var(--egov-radius)",
          boxShadow: "0 18px 50px rgba(25, 57, 116, 0.08)",
          border: "1px solid rgba(255,255,255,0.78)",
        }}
      >
        <img src="/egovph-logo.png" alt="eGovPH" className="w-40" />

        <div className="text-center">
          <h1 className="text-lg font-bold" style={{ color: "var(--egov-ink)" }}>
            HANDA
          </h1>
          <p className="text-xs mt-1" style={{ color: "var(--egov-muted)" }}>
            Hazard Assessment and Needs Determination
          </p>
        </div>

        {step === "email" && (
          <>
            {USE_MOCK && (
              <div className="w-full">
                <p className="text-xs font-medium mb-2" style={{ color: "var(--egov-muted)" }}>
                  Demo identity
                </p>
                <div className="flex flex-col gap-2">
                  {DEMO_IDENTITIES.map((d) => (
                    <button
                      key={d.id}
                      type="button"
                      onClick={() => setSelected(d.id)}
                      className="w-full text-left px-3 py-2 text-sm transition-colors"
                      style={{
                        borderRadius: "calc(var(--egov-radius) * 0.5)",
                        border: selected === d.id ? "2px solid var(--egov-blue)" : "1px solid var(--egov-line)",
                        background: selected === d.id ? "var(--egov-soft)" : "transparent",
                      }}
                    >
                      <span className="font-medium" style={{ color: "var(--egov-ink)" }}>
                        {d.label}
                      </span>
                      <span
                        className="ml-2 text-xs px-1.5 py-0.5 rounded-full"
                        style={{
                          background: d.role === "Official" || d.role === "LGU" ? "var(--egov-blue)" : "var(--egov-line)",
                          color: d.role === "Official" || d.role === "LGU" ? "#fff" : "var(--egov-muted)",
                        }}
                      >
                        {d.role}
                      </span>
                      <p className="text-xs mt-1" style={{ color: "var(--egov-muted)" }}>
                        {d.email}
                      </p>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {!USE_MOCK && (
              <div className="w-full">
                <label className="text-xs font-medium" style={{ color: "var(--egov-muted)" }}>
                  Email address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full mt-1 px-3 py-2 text-sm"
                  style={{
                    border: "1px solid var(--egov-line)",
                    borderRadius: "calc(var(--egov-radius) * 0.5)",
                  }}
                />
              </div>
            )}

            <button
              type="button"
              onClick={handleSendOTP}
              disabled={isLoading}
              className="w-full py-3 text-sm font-semibold transition-opacity disabled:opacity-60"
              style={{
                background: "var(--egov-blue)",
                color: "#fff",
                borderRadius: "calc(var(--egov-radius) * 0.5)",
              }}
            >
              Send verification code
            </button>
          </>
        )}

        {step === "otp" && (
          <>
            <div className="w-full text-center">
              <p className="text-sm" style={{ color: "var(--egov-ink)" }}>
                Enter the 6-digit code sent to
              </p>
              <p className="text-sm font-semibold mt-1" style={{ color: "var(--egov-blue)" }}>
                {USE_MOCK ? DEMO_IDENTITIES.find((d) => d.id === selected)?.email : email}
              </p>
              {USE_MOCK && (
                <p className="text-xs mt-2" style={{ color: "var(--egov-muted)" }}>
                  Mock mode: use <strong>123456</strong>
                </p>
              )}
            </div>

            <input
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              placeholder="000000"
              maxLength={6}
              className="w-full px-3 py-3 text-center text-2xl font-mono tracking-widest"
              style={{
                border: "2px solid var(--egov-line)",
                borderRadius: "calc(var(--egov-radius) * 0.5)",
              }}
            />

            <button
              type="button"
              onClick={handleConfirmOTP}
              disabled={isLoading || otp.length !== 6}
              className="w-full py-3 text-sm font-semibold transition-opacity disabled:opacity-60"
              style={{
                background: "var(--egov-blue)",
                color: "#fff",
                borderRadius: "calc(var(--egov-radius) * 0.5)",
              }}
            >
              {isLoading ? "Signing in…" : "Verify and sign in"}
            </button>

            <button
              type="button"
              onClick={() => setStep("email")}
              className="text-xs"
              style={{ color: "var(--egov-muted)" }}
            >
              ← Change email
            </button>
          </>
        )}

        {step === "sso" && (
          <div className="text-center">
            <p className="text-sm" style={{ color: "var(--egov-ink)" }}>
              Connecting to eGovPH…
            </p>
          </div>
        )}

        {(otpError || error) && (
          <p className="text-xs text-center" style={{ color: "var(--egov-red)" }}>
            {otpError || error}
          </p>
        )}

        <p className="text-center text-xs" style={{ color: "var(--egov-muted)" }}>
          Verify your email, then sign in with eGovPH credentials.
        </p>
      </div>

      <p className="mt-4 text-xs" style={{ color: "var(--egov-muted)" }}>
        Powered by eGovPH Super App
      </p>
    </div>
  )
}
