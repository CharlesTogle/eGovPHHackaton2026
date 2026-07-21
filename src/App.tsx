import { useEffect, useState } from "react"
import { SessionProvider, useSession } from "@/features/auth"
import { DashboardPage } from "@/features/dashboard/DashboardPage"
import { CheckInPage } from "@/features/checkin/CheckInPage"
import { LoginPage } from "@/features/auth/LoginPage"

function RouteSwitch() {
  const { isAuthed, session } = useSession()
  const [path, setPath] = useState(window.location.pathname)

  useEffect(() => {
    const onPop = () => setPath(window.location.pathname)
    window.addEventListener("popstate", onPop)
    return () => window.removeEventListener("popstate", onPop)
  }, [])

  if (!isAuthed) return <LoginPage />

  if (path === "/check-in") {
    if (session?.role === "official") {
      window.history.replaceState(null, "", "/dashboard")
      return <DashboardPage />
    }
    return <CheckInPage />
  }

  if (path === "/dashboard") {
    if (session?.role === "resident") {
      window.history.replaceState(null, "", "/check-in")
      return <CheckInPage />
    }
    return <DashboardPage />
  }

  const defaultPath = session?.role === "official" ? "/dashboard" : "/check-in"
  window.history.replaceState(null, "", defaultPath)
  return session?.role === "official" ? <DashboardPage /> : <CheckInPage />
}

function App() {
  return (
    <SessionProvider>
      <RouteSwitch />
    </SessionProvider>
  )
}

export default App
