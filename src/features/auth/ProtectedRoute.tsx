import type { ReactNode } from "react"
import { useSession } from "./session-context"
import { LoginPage } from "./LoginPage"

interface ProtectedRouteProps {
  children: ReactNode
  requiredRole?: "official" | "resident"
}

export function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const { isAuthed, session } = useSession()

  if (!isAuthed) return <LoginPage />

  if (requiredRole && session?.role !== requiredRole) {
    const redirect = session?.role === "official" ? "/dashboard" : "/check-in"
    if (typeof window !== "undefined" && window.location.pathname !== redirect) {
      window.history.replaceState(null, "", redirect)
    }
    return null
  }

  return <>{children}</>
}
