import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { api } from '../api'
import { ProjectCard } from '../components/ProjectCard'
import { ProofSeal } from '../components/ProofSeal'
import { EmptyState, ErrorState, Loading } from '../components/States'
import { ToolChart } from '../components/ToolChart'
import { formatInt } from '../lib/format'
import type { Formula, Profile } from '../types'

const PARTS: { key: keyof Profile['parts']; label: string; note: string }[] = [
  { key: 'quality', label: 'Quality · 55%', note: 'Average proof across the projects below.' },
  { key: 'volume', label: 'Volume · 20%', note: 'How many shipped. Full marks at four.' },
  { key: 'range', label: 'Range · 15%', note: 'Different tools used. Full marks at four.' },
  { key: 'depth', label: 'Depth · 10%', note: 'Different stack tags. Full marks at eight.' },
]

export function ProfilePage() {
  const { username = '' } = useParams()
  const [view, setView] = useState<{
    username: string
    profile: Profile | null
    formula: Formula | null
    error: string
  } | null>(null)
  const [tick, setTick] = useState(0)

  useEffect(() => {
    let cancelled = false
    api<{ profile: Profile; formula: Formula }>(`/api/u/${encodeURIComponent(username)}`)
      .then((data) => {
        if (cancelled) return
        setView({ username, profile: data.profile, formula: data.formula, error: '' })
        document.title = `${data.profile.name} · StackProof`
      })
      .catch((err: Error) => {
        if (!cancelled) setView({ username, profile: null, formula: null, error: err.message })
      })
    return () => {
      cancelled = true
    }
  }, [username, tick])

  const ready = view?.username === username
  const profile = ready ? view.profile : null
  const formula = ready ? view.formula : null
  const error = ready ? view.error : ''
  const loaded = ready

  if (!loaded && !error) return <Loading label="Opening the profile" />
  if (error) return <ErrorState message={error} onRetry={() => setTick((n) => n + 1)} />
  if (!profile) return <ErrorState message="No developer with that username" />

  return (
    <div className="profile">
      <header className="profile-head">
        <div>
          <p className="kicker">Public profile · /u/{profile.username}</p>
          <h1>{profile.name}</h1>
          {profile.headline && <p className="dek">{profile.headline}</p>}
          <p className="meta-line">
            {profile.location && <span>{profile.location}</span>}
            {profile.location && profile.bio && <span aria-hidden="true"> · </span>}
          </p>
          {profile.bio && <p className="bio">{profile.bio}</p>}
        </div>
        <ProofSeal value={profile.proofScore} size="lg" />
      </header>

      <dl className="stat-row">
        <Stat label="Projects" value={formatInt(profile.stats.projects)} />
        <Stat label="Total xp" value={formatInt(profile.totalXp)} />
        <Stat label="Hours saved" value={formatInt(profile.stats.hoursSaved)} />
        <Stat label="Features" value={formatInt(profile.stats.featuresShipped)} />
        <Stat label="Users" value={formatInt(profile.stats.users)} />
      </dl>

      <section className="profile-grid">
        <div className="panel flat">
          <h2>Tool use</h2>
          <p className="fine">How often each tool shows up across this build history.</p>
          <ToolChart tools={profile.tools} />
        </div>
        <div className="panel flat">
          <h2>Proof score · {profile.proofScore}</h2>
          <p className="fine">One strong repo cannot max this out. Volume fills up at four shipped projects.</p>
          <ul className="parts">
            {PARTS.map((part) => (
              <li key={part.key}>
                <span>{part.label}</span>
                <strong>{profile.parts[part.key]}</strong>
                <em>{part.note}</em>
              </li>
            ))}
          </ul>
          {formula && (
            <details className="formula">
              <summary>The formula</summary>
              <p>{formula.developer}</p>
              <p>{formula.project}</p>
              <p>{formula.xp}</p>
            </details>
          )}
          <p className="fine">
            Averages on this page: difficulty {profile.stats.avgDifficulty}/10, coverage {profile.stats.avgCoverage}/10.
          </p>
        </div>
      </section>

      <section>
        <h2 className="section-title">Build history</h2>
        {profile.projects.length === 0 ? (
          <EmptyState title="No projects yet" body="When this developer logs work, it will show up here." />
        ) : (
          <div className="feed-grid">
            {profile.projects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        )}
      </section>

      <p className="fine">
        <Link to="/">Back to the board</Link>
      </p>
    </div>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="stat">
      <dt>{label}</dt>
      <dd>{value}</dd>
    </div>
  )
}
