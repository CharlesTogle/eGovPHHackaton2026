import type { ReactNode } from "react"
import { useEffect } from "react"
import { useSession } from "./session-context"
import { LoginPage } from "./LoginPage"

interface ProtectedRouteProps {
  children: ReactNode
  requiredRole?: "official" | "resident"
}

export function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const { isAuthed, session } = useSession()

  useEffect(() => {
    if (isAuthed && requiredRole && session?.role !== requiredRole) {
      const redirect = session?.role === "official" ? "#dashboard" : "#resident"
      if (window.location.hash !== redirect) {
        window.location.hash = redirect
      }
    }
  }, [isAuthed, requiredRole, session?.role])

  if (!isAuthed) return <LoginPage />

  if (requiredRole && session?.role !== requiredRole) {
    return null
  }

  return <>{children}</>
}
