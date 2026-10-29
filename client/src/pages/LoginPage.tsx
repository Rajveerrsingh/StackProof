import { useEffect, useState, type FormEvent } from 'react'
import { Link, Navigate, useSearchParams } from 'react-router-dom'
import { ApiError } from '../api'
import { useAuth } from '../auth'
import { safeNext } from '../lib/format'

export function LoginPage() {
  const { user, login } = useAuth()
  const [params] = useSearchParams()
  const next = safeNext(params.get('next'))
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [pending, setPending] = useState(false)

  useEffect(() => {
    document.title = 'Sign in · StackProof'
  }, [])

  if (user) return <Navigate to={next} replace />

  async function onSubmit(event: FormEvent) {
    event.preventDefault()
    setPending(true)
    setError('')
    try {
      await login(email, password)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not sign in')
    } finally {
      setPending(false)
    }
  }

  return (
    <div className="auth-split">
      <section className="auth-copy">
        <p className="kicker">StackProof</p>
        <h1>Sign in. Your cards are waiting.</h1>
        <p className="dek">The demo profile is already on the board. Same password works for both seeded accounts.</p>
        <button
          type="button"
          className="demo-card"
          onClick={() => {
            setEmail('rajveer@stackproof.dev')
            setPassword('demo1234')
          }}
        >
          <span>Demo login</span>
          <strong>rajveer@stackproof.dev</strong>
          <code>demo1234</code>
        </button>
        <p className="fine">
          Or look around first. <Link to="/u/rajveer">Rajveer’s profile</Link> is public.
        </p>
      </section>
      <form className="panel" onSubmit={onSubmit}>
        <h2>Welcome back</h2>
        <label>
          Email
          <input
            type="email"
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />
        </label>
        <label>
          Password
          <input
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />
        </label>
        {error && (
          <p className="field-error" role="alert">
            {error}
          </p>
        )}
        <button className="btn" type="submit" disabled={pending}>
          {pending ? 'Signing in…' : 'Sign in'}
        </button>
        <p className="fine">
          New here? <Link to="/register">Create an account</Link>
        </p>
      </form>
    </div>
  )
}
