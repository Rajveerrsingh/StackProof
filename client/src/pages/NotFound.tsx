import { useEffect } from 'react'
import { Link } from 'react-router-dom'

export function NotFound() {
  useEffect(() => {
    document.title = 'Not found · StackProof'
  }, [])

  return (
    <div className="state">
      <p className="kicker">404</p>
      <h1>That page isn’t on the board.</h1>
      <p>The link may be old, or the project was deleted.</p>
      <Link className="btn" to="/">
        Back to the board
      </Link>
    </div>
  )
}
