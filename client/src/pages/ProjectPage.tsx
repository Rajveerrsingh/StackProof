import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { api } from '../api'
import { useAuth } from '../auth'
import { ProofSeal } from '../components/ProofSeal'
import { ErrorState, Loading } from '../components/States'
import { ToolChips } from '../components/ToolChips'
import { formatInt, formatMonth } from '../lib/format'
import type { Project } from '../types'

const BREAKDOWN: { key: keyof Project['breakdown']; label: string; note: string }[] = [
  { key: 'skill', label: 'Skill', note: 'Difficulty × 4 + coverage × 3' },
  { key: 'features', label: 'Features', note: 'One point each, capped at 12' },
  { key: 'hours', label: 'Hours', note: '0.1 per hour, capped at 50 hours' },
  { key: 'users', label: 'Users', note: 'log10(users + 1) × 4, capped at 6' },
  { key: 'github', label: 'GitHub', note: '5 points if there is a link' },
  { key: 'tools', label: 'Tools', note: '2 points each, capped at 3 tools' },
]

export function ProjectPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [view, setView] = useState<{ id: string; project: Project | null; error: string } | null>(null)
  const [confirming, setConfirming] = useState(false)
  const [tick, setTick] = useState(0)

  useEffect(() => {
    if (!id) return
    let cancelled = false
    api<{ project: Project }>(`/api/projects/${id}`)
      .then((data) => {
        if (cancelled) return
        setView({ id, project: data.project, error: '' })
        document.title = `${data.project.title} · StackProof`
      })
      .catch((err: Error) => {
        if (!cancelled) setView({ id, project: null, error: err.message })
      })
    return () => {
      cancelled = true
    }
  }, [id, tick])

  const project = view && view.id === id ? view.project : null
  const error = view && view.id === id ? view.error : ''
  const loaded = (view && view.id === id) || !id

  async function remove() {
    if (!project) return
    await api(`/api/projects/${project.id}`, { method: 'DELETE' })
    navigate('/')
  }

  if (!loaded && !error) return <Loading label="Opening the project" />
  if (error) return <ErrorState message={error} onRetry={() => setTick((n) => n + 1)} />
  if (!project) return <ErrorState message="No project with that id" />

  const mine = user?.id === project.ownerId

  return (
    <article className="detail">
      <p className="kicker">
        <time dateTime={project.shippedAt}>{formatMonth(project.shippedAt)}</time>
        {project.owner && (
          <>
            {' '}
            · <Link to={`/u/${project.owner.username}`}>{project.owner.name}</Link>
          </>
        )}
      </p>
      <div className="detail-head">
        <h1>{project.title}</h1>
        <ProofSeal value={project.proof} size="lg" />
      </div>
      <p className="dek">{project.summary}</p>
      <ToolChips tools={project.tools} />
      <p className="stack-line">{project.stack.join(' · ')}</p>

      <dl className="outcomes-band">
        <div>
          <dt>Hours saved</dt>
          <dd>{formatInt(project.outcomes.hoursSaved)}</dd>
        </div>
        <div>
          <dt>Features shipped</dt>
          <dd>{formatInt(project.outcomes.featuresShipped)}</dd>
        </div>
        <div>
          <dt>Users</dt>
          <dd>{formatInt(project.outcomes.users)}</dd>
        </div>
      </dl>

      <div className="meters">
        <Meter label="Difficulty" value={project.difficulty} />
        <Meter label="Test coverage" value={project.coverage} />
      </div>

      {project.story && (
        <section className="prose">
          <h2>What shipped</h2>
          <p>{project.story}</p>
        </section>
      )}

      <section className="prose">
        <h2>How this proof was scored</h2>
        <p className="fine">
          Project proof is the card number, from 0 to 100. This one is worth {formatInt(project.xp)} xp.
        </p>
        <ul className="breakdown">
          {BREAKDOWN.map((row) => (
            <li key={row.key}>
              <span>{row.label}</span>
              <strong>{project.breakdown[row.key]}</strong>
              <em>{row.note}</em>
            </li>
          ))}
        </ul>
      </section>

      <div className="action-row">
        {project.githubUrl && (
          <a className="btn" href={project.githubUrl} target="_blank" rel="noreferrer">
            View on GitHub
          </a>
        )}
        {mine && (
          <Link className="btn ghost" to={`/projects/${project.id}/edit`}>
            Edit
          </Link>
        )}
        {mine && !confirming && (
          <button type="button" className="text-btn danger" onClick={() => setConfirming(true)}>
            Delete
          </button>
        )}
        {mine && confirming && (
          <>
            <button type="button" className="btn danger" onClick={() => void remove()}>
              Confirm delete
            </button>
            <button type="button" className="text-btn" onClick={() => setConfirming(false)}>
              Keep it
            </button>
          </>
        )}
      </div>
    </article>
  )
}

function Meter({ label, value }: { label: string; value: number }) {
  return (
    <div className="meter">
      <div className="meter-label">
        <span>{label}</span>
        <strong>
          {value}
          <span>/10</span>
        </strong>
      </div>
      <div className="meter-track" aria-hidden="true">
        <div className="meter-fill" style={{ width: `${value * 10}%` }} />
      </div>
    </div>
  )
}
