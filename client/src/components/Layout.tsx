import { Link, NavLink, Outlet } from 'react-router-dom'
import { useAuth } from '../auth'
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
      <main id="main">{ready ? <Outlet /> : <Loading label="Checking your session" />}</main>
      <footer className="site-foot">
        <p>Hours, features, and users are self-reported. The formula sits on every profile.</p>
        <Link to="/u/rajveer">Rajveer’s public profile</Link>
      </footer>
    </div>
  )
}
