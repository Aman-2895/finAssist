import { Navigate, Outlet } from 'react-router-dom'
import { useAuth as useClerkAuth } from '@clerk/clerk-react'

export default function ProtectedRoute() {
  const { isLoaded, isSignedIn } = useClerkAuth()

  if (!isLoaded) {
    return (
      <div className="min-h-screen grid place-items-center" style={{ background: 'var(--bg)' }}>
        <div className="flex flex-col items-center gap-3">
          <span
            className="grid place-items-center w-10 h-10 rounded-xl font-display font-bold animate-pulse"
            style={{ background: 'var(--accent)', color: 'var(--accent-ink)' }}
          >
            F
          </span>
          <p className="text-sm text-ink-soft">Loading FinAssist…</p>
        </div>
      </div>
    )
  }

  if (!isSignedIn) return <Navigate to="/login" replace />
  return <Outlet />
}
