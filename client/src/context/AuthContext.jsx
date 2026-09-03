import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { useAuth as useClerkAuth } from '@clerk/clerk-react'
import { userApi, setClerkTokenGetter } from '@/lib/api'

// Clerk owns identity (is this a valid, logged-in person). This context
// layers FinAssist's own profile data (income, expenses, goals context —
// things Clerk has no concept of) on top, fetched from our own backend
// once Clerk confirms the person is signed in. Pages keep using `useAuth()`
// exactly as before; only what's inside changed.
const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const { isLoaded, isSignedIn, getToken } = useClerkAuth()
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  // Give api.js a way to fetch a fresh Clerk session token on every request.
  useEffect(() => {
    setClerkTokenGetter(isSignedIn ? getToken : null)
  }, [isSignedIn, getToken])

  const loadProfile = useCallback(async () => {
    try {
      const profile = await userApi.me()
      setUser(profile)
    } catch {
      setUser(null)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (!isLoaded) return
    if (isSignedIn) {
      loadProfile()
    } else {
      setUser(null)
      setLoading(false)
    }
  }, [isLoaded, isSignedIn, loadProfile])

  const refreshUser = () => loadProfile()

  return (
    <AuthContext.Provider value={{ user, loading, isAuthenticated: !!isSignedIn, refreshUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
