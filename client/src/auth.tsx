/* oxlint-disable react/only-export-components -- hook shares the provider's context */
import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { api, setToken } from './api'
import type { User } from './types'

type AuthResult = { token: string; user: User }

type AuthContextValue = {
  user: User | null
  ready: boolean
  login: (email: string, password: string) => Promise<void>
  register: (input: {
    name: string
    username: string
    email: string
    password: string
    location?: string
  }) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    let cancelled = false
    api<{ user: User }>('/api/auth/me')
      .then((data) => {
        if (!cancelled) setUser(data.user)
      })
      .catch(() => {
        setToken(null)
      })
      .finally(() => {
        if (!cancelled) setReady(true)
      })
    return () => {
      cancelled = true
    }
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      ready,
      async login(email, password) {
        const result = await api<AuthResult>('/api/auth/login', {
          method: 'POST',
          body: { email, password },
        })
        setToken(result.token)
        setUser(result.user)
      },
      async register(input) {
        const result = await api<AuthResult>('/api/auth/register', {
          method: 'POST',
          body: input,
        })
        setToken(result.token)
        setUser(result.user)
      },
      logout() {
        setToken(null)
        setUser(null)
      },
    }),
    [user, ready],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
