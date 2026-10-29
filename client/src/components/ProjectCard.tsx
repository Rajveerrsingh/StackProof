import { Link } from 'react-router-dom'
import { formatInt, formatMonth } from '../lib/format'
import type { Project } from '../types'
import { ProofSeal } from './ProofSeal'
import { ToolChips } from './ToolChips'

export function ProjectCard({ project }: { project: Project }) {
  return (
    <article className="card">
      <div className="card-top">
        <time dateTime={project.shippedAt}>{formatMonth(project.shippedAt)}</time>
        <span className="xp">{formatInt(project.xp)} XP</span>
      </div>
      <div className="card-art">
        <h2>
          <Link to={`/projects/${project.id}`}>{project.title}</Link>
        </h2>
        <ProofSeal value={project.proof} size="sm" />
      </div>
      <p className="summary">{project.summary}</p>
      <ToolChips tools={project.tools} />
      <p className="stack-line">{project.stack.join(' · ')}</p>
      <dl className="metrics">
        <div>
          <dt>Hours saved</dt>
          <dd>{formatInt(project.outcomes.hoursSaved)}</dd>
        </div>
        <div>
          <dt>Features</dt>
          <dd>{formatInt(project.outcomes.featuresShipped)}</dd>
        </div>
        <div>
          <dt>Users</dt>
          <dd>{formatInt(project.outcomes.users)}</dd>
        </div>
      </dl>
      <footer className="card-foot">
        {project.owner ? (
          <Link className="owner-link" to={`/u/${project.owner.username}`}>
            {project.owner.name}
          </Link>
        ) : (
          <span />
        )}
        <span className="card-rarity">Shipped</span>
      </footer>
    </article>
  )
}
