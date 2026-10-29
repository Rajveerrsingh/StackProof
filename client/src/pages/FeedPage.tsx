import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api'
import { useAuth } from '../auth'
import { ProjectCard } from '../components/ProjectCard'
import { ProofSeal } from '../components/ProofSeal'
import { EmptyState, ErrorState } from '../components/States'
import { formatInt } from '../lib/format'
import type { Profile, Project } from '../types'

type FeedResponse = { projects: Project[]; tools: string[] }

export function FeedPage() {
  const { user } = useAuth()
  const [projects, setProjects] = useState<Project[]>([])
  const [tools, setTools] = useState<string[]>([])
  const [q, setQ] = useState('')
  const [tool, setTool] = useState('')
  const [debounced, setDebounced] = useState('')
  const [error, setError] = useState('')
  const [loaded, setLoaded] = useState(false)
  const [tick, setTick] = useState(0)
  const [mine, setMine] = useState<Profile | null>(null)

  useEffect(() => {
    document.title = 'Board · StackProof'
  }, [])

  useEffect(() => {
    const timer = window.setTimeout(() => setDebounced(q), 180)
    return () => window.clearTimeout(timer)
  }, [q])

  useEffect(() => {
    let cancelled = false
    const params = new URLSearchParams()
    if (debounced.trim()) params.set('q', debounced.trim())
    if (tool) params.set('tool', tool)

    api<FeedResponse>(`/api/projects?${params.toString()}`)
      .then((data) => {
        if (cancelled) return
        setProjects(data.projects)
        setTools(data.tools)
        setError('')
      })
      .catch((err: Error) => {
        if (!cancelled) setError(err.message)
      })
      .finally(() => {
        if (!cancelled) setLoaded(true)
      })

    return () => {
      cancelled = true
    }
  }, [debounced, tool, tick])

  useEffect(() => {
    if (!user) return
    let cancelled = false
    const username = user.username
    api<{ profile: Profile }>(`/api/u/${username}`)
      .then((data) => {
        if (!cancelled) setMine(data.profile)
      })
      .catch(() => {
        if (!cancelled) setMine(null)
      })
    return () => {
      cancelled = true
    }
  }, [user])

  const yourProfile = user && mine?.username === user.username ? mine : null

  const filtering = Boolean(debounced.trim() || tool)

  return (
    <div className="page">
      <section className="lede">
        <p className="kicker">A board for shipped work</p>
        <h1>Proof, not a skills list.</h1>
        <p className="dek">
          Log the project, the tools you actually used, and a number you can defend in an interview. The proof score is
          math, and the math is written down.
        </p>
      </section>

      {yourProfile && user && (
        <Link className="you" to={`/u/${user.username}`}>
          <ProofSeal value={yourProfile.proofScore} size="sm" />
          <div>
            <p className="kicker">Your proof score</p>
            <strong>{user.name}</strong>
            <span>
              {formatInt(yourProfile.totalXp)} xp · {yourProfile.stats.projects} projects
            </span>
          </div>
        </Link>
      )}

      <div className="filters">
        <label className="search">
          <span className="sr">Search projects</span>
          <input
            value={q}
            onChange={(event) => setQ(event.target.value)}
            placeholder="Search title, stack, tool"
          />
        </label>
        <div className="filter-tools" role="group" aria-label="Filter by tool">
          <button type="button" className={tool === '' ? 'chip on' : 'chip'} aria-pressed={tool === ''} onClick={() => setTool('')}>
            All
          </button>
          {tools.map((name) => (
            <button
              key={name}
              type="button"
              className={tool === name ? 'chip on' : 'chip'}
              aria-pressed={tool === name}
              onClick={() => setTool(name)}
            >
              {name}
            </button>
          ))}
        </div>
      </div>

      {!loaded && !error && <p className="loading-line">Pulling the board…</p>}
      {error && <ErrorState message={error} onRetry={() => setTick((n) => n + 1)} />}

      {loaded && !error && projects.length === 0 && (
        <EmptyState
          title={filtering ? 'Nothing matches' : 'The board is empty'}
          body={
            filtering
              ? 'Try another tool, or clear the search.'
              : 'Log a project and it will land here with a proof score.'
          }
        />
      )}

      {projects.length > 0 && (
        <div className="feed-grid">
          {projects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      )}
    </div>
  )
}
