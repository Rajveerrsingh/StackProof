import { Link, NavLink, Outlet } from 'react-router-dom'
import { useAuth } from '../auth'
import { DEMO_MODE, loadDemoApi } from '../api'
import { Loading } from './States'

export function Layout() {
  const { user, ready, logout } = useAuth()
  const logHref = user ? '/projects/new' : '/login?next=%2Fprojects%2Fnew'

  return (
    <div className="shell">
      <a className="skip" href="#main">
        Skip to content
      </a>
      <header className="topbar">
        <Link to="/" className="brand">
          <span className="brand-mark" aria-hidden="true" />
          StackProof
        </Link>
        <nav className="nav" aria-label="Primary">
          <NavLink to="/" end>
            Board
          </NavLink>
          {user ? (
            <NavLink to={`/u/${user.username}`}>{user.name.split(' ')[0]}</NavLink>
          ) : (
            <NavLink to="/login">Sign in</NavLink>
          )}
          {user && (
            <button type="button" className="text-btn" onClick={logout}>
              Sign out
            </button>
          )}
          <Link className="btn" to={logHref}>
            Log a project
          </Link>
        </nav>
      </header>
      {DEMO_MODE && (
        <div className="demo-banner" role="note">
          <p>
            <strong>Demo mode.</strong> No server here: the API’s validation and services run in your browser and save
            to localStorage. Sessions are not signed JWTs in this mode.{' '}
            <a href="https://github.com/Rajveerrsingh/StackProof#run-it">Run it locally</a> for the Express API.
          </p>
          <button
            type="button"
            className="text-btn"
            onClick={async () => {
              const demo = await loadDemoApi()
              await demo.resetDemo()
              logout()
              window.location.reload()
            }}
          >
            Reset demo data
          </button>
        </div>
      )}
      <main id="main">{ready ? <Outlet /> : <Loading label="Checking your session" />}</main>
      <footer className="site-foot">
        <p>Hours, features, and users are self-reported. The formula sits on every profile.</p>
        <Link to="/u/sam">Sample profile</Link>
        <p>
          Built by <a href="https://github.com/Rajveerrsingh">Rajveer Singh</a> ·{' '}
          <a href="https://github.com/Rajveerrsingh/StackProof">Source</a>
        </p>
      </footer>
    </div>
  )
}
