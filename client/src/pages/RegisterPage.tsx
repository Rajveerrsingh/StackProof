import { useEffect, useState, type FormEvent } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { ApiError } from '../api'
import { useAuth } from '../auth'

export function RegisterPage() {
  const { user, register } = useAuth()
  const [name, setName] = useState('')
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [location, setLocation] = useState('')
  const [error, setError] = useState('')
  const [pending, setPending] = useState(false)

  useEffect(() => {
    document.title = 'Create account · StackProof'
  }, [])

  if (user) return <Navigate to="/" replace />

  async function onSubmit(event: FormEvent) {
    event.preventDefault()
    setPending(true)
    setError('')
    try {
      await register({ name, username, email, password, location })
    } catch (err) {
      if (err instanceof ApiError) {
        const detail = err.details?.[0]?.message
        setError(detail || err.message)
      } else {
        setError('Could not create the account')
      }
    } finally {
      setPending(false)
    }
  }

  return (
    <div className="auth-split">
      <section className="auth-copy">
        <p className="kicker">New developer</p>
        <h1>Start a public proof page.</h1>
        <p className="dek">
          Your profile lives at /u/your-name. Projects you log show up on the board with a proof score.
        </p>
      </section>
      <form className="panel" onSubmit={onSubmit}>
        <h2>Create account</h2>
        <label>
          Name
          <input value={name} onChange={(event) => setName(event.target.value)} autoComplete="name" required />
        </label>
        <label>
          Username
          <input
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            autoComplete="username"
            placeholder="rajveer"
            required
          />
        </label>
        <label>
          Email
          <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" required />
        </label>
        <label>
          Password
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            autoComplete="new-password"
            minLength={8}
            required
          />
        </label>
        <label>
          Location <span className="optional">optional</span>
          <input value={location} onChange={(event) => setLocation(event.target.value)} placeholder="Canada" />
        </label>
        {error && (
          <p className="field-error" role="alert">
            {error}
          </p>
        )}
        <button className="btn" type="submit" disabled={pending}>
          {pending ? 'Creating…' : 'Create account'}
        </button>
        <p className="fine">
          Already logging work? <Link to="/login">Sign in</Link>
        </p>
      </form>
    </div>
  )
}
