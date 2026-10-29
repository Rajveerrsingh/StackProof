import { useEffect, useState, type FormEvent } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { api, ApiError, type FieldDetail } from '../api'
import { useAuth } from '../auth'
import { TagField } from '../components/TagField'
import { ErrorState, Loading } from '../components/States'
import { STACK_SUGGESTIONS, TOOL_SUGGESTIONS } from '../lib/tools'
import {
  emptyProjectForm,
  toProjectPayload,
  validateProject,
  type FieldErrors,
  type ProjectForm,
} from '../lib/validateProject'
import type { Project } from '../types'

function fromProject(project: Project): ProjectForm {
  return {
    title: project.title,
    summary: project.summary,
    story: project.story,
    tools: project.tools,
    stack: project.stack,
    hoursSaved: String(project.outcomes.hoursSaved),
    featuresShipped: String(project.outcomes.featuresShipped),
    users: String(project.outcomes.users),
    difficulty: project.difficulty,
    coverage: project.coverage,
    githubUrl: project.githubUrl,
    shippedAt: project.shippedAt.slice(0, 10),
  }
}

function serverErrors(details: FieldDetail[] | undefined): FieldErrors {
  const next: FieldErrors = {}
  for (const detail of details ?? []) {
    const key = detail.path.replace('outcomes.', '') as keyof ProjectForm
    next[key] = detail.message
  }
  return next
}

export function ProjectFormPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const editing = Boolean(id)
  const [form, setForm] = useState<ProjectForm>(emptyProjectForm)
  const [errors, setErrors] = useState<FieldErrors>({})
  const [formError, setFormError] = useState('')
  const [pending, setPending] = useState(false)
  const [loading, setLoading] = useState(editing)
  const [blocked, setBlocked] = useState('')

  useEffect(() => {
    document.title = editing ? 'Edit project · StackProof' : 'Log a project · StackProof'
  }, [editing])

  useEffect(() => {
    if (!id) return
    let cancelled = false
    api<{ project: Project }>(`/api/projects/${id}`)
      .then((data) => {
        if (cancelled) return
        if (user && data.project.ownerId !== user.id) {
          setBlocked('You can only edit your own projects.')
          return
        }
        setForm(fromProject(data.project))
      })
      .catch((err: Error) => {
        if (!cancelled) setBlocked(err.message)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [id, user])

  function set<K extends keyof ProjectForm>(key: K, value: ProjectForm[K]) {
    setForm((current) => ({ ...current, [key]: value }))
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault()
    const next = validateProject(form)
    setErrors(next)
    setFormError('')
    if (Object.keys(next).length > 0) {
      setFormError('Fix the highlighted fields and try again.')
      return
    }

    setPending(true)
    try {
      const body = toProjectPayload(form)
      const result = await api<{ project: Project }>(editing ? `/api/projects/${id}` : '/api/projects', {
        method: editing ? 'PUT' : 'POST',
        body,
      })
      navigate(`/projects/${result.project.id}`)
    } catch (err) {
      if (err instanceof ApiError) {
        setErrors(serverErrors(err.details))
        setFormError(err.message)
      } else {
        setFormError('Could not save the project')
      }
    } finally {
      setPending(false)
    }
  }

  if (loading) return <Loading label="Loading the project" />
  if (blocked) return <ErrorState message={blocked} />

  return (
    <form className="editor" onSubmit={onSubmit} noValidate>
      <p className="kicker">{editing ? 'Edit' : 'New entry'}</p>
      <h1>{editing ? 'Update this card' : 'Log a project'}</h1>
      <p className="dek">Be specific. The score uses the numbers you put here, and a hiring manager might ask about them.</p>

      <fieldset>
        <legend>01 · Basics</legend>
        <label className={errors.title ? 'invalid' : ''}>
          Name
          <input value={form.title} onChange={(event) => set('title', event.target.value)} maxLength={80} />
          {errors.title && <span className="field-error">{errors.title}</span>}
        </label>
        <label className={errors.summary ? 'invalid' : ''}>
          Summary
          <textarea
            value={form.summary}
            onChange={(event) => set('summary', event.target.value)}
            maxLength={320}
            rows={3}
          />
          <span className="hint">{form.summary.trim().length}/320</span>
          {errors.summary && <span className="field-error">{errors.summary}</span>}
        </label>
        <label className={errors.story ? 'invalid' : ''}>
          What shipped
          <textarea value={form.story} onChange={(event) => set('story', event.target.value)} rows={6} />
          {errors.story && <span className="field-error">{errors.story}</span>}
        </label>
        <div className="split">
          <label className={errors.githubUrl ? 'invalid' : ''}>
            GitHub link
            <input
              value={form.githubUrl}
              onChange={(event) => set('githubUrl', event.target.value)}
              placeholder="https://github.com/you/project"
              inputMode="url"
            />
            {errors.githubUrl && <span className="field-error">{errors.githubUrl}</span>}
          </label>
          <label className={errors.shippedAt ? 'invalid' : ''}>
            Ship date
            <input type="date" value={form.shippedAt} onChange={(event) => set('shippedAt', event.target.value)} />
            {errors.shippedAt && <span className="field-error">{errors.shippedAt}</span>}
          </label>
        </div>
      </fieldset>

      <fieldset>
        <legend>02 · Tools and stack</legend>
        <TagField
          label="Tools"
          hint="What you actually used to build it. Cursor, Claude Code, Copilot, or your own."
          suggestions={TOOL_SUGGESTIONS}
          values={form.tools}
          onChange={(tools) => set('tools', tools)}
          error={errors.tools}
          placeholder="Add a tool"
        />
        <TagField
          label="Stack"
          hint="Languages, frameworks, and datastores that are really in the repo."
          suggestions={STACK_SUGGESTIONS}
          values={form.stack}
          onChange={(stack) => set('stack', stack)}
          error={errors.stack}
          placeholder="Add a tag"
        />
      </fieldset>

      <fieldset>
        <legend>03 · Outcomes</legend>
        <div className="split three">
          <NumberField
            label="Hours saved"
            value={form.hoursSaved}
            error={errors.hoursSaved}
            onChange={(value) => set('hoursSaved', value)}
          />
          <NumberField
            label="Features shipped"
            value={form.featuresShipped}
            error={errors.featuresShipped}
            onChange={(value) => set('featuresShipped', value)}
          />
          <NumberField label="Users" value={form.users} error={errors.users} onChange={(value) => set('users', value)} />
        </div>
      </fieldset>

      <fieldset>
        <legend>04 · Scores</legend>
        <RangeField
          label="Difficulty"
          hint="1 is a tutorial follow-along. 10 is the hardest thing you have shipped."
          value={form.difficulty}
          error={errors.difficulty}
          onChange={(value) => set('difficulty', value)}
        />
        <RangeField
          label="Test coverage"
          hint="Your honest read of how much of the behavior is tested, from 1 to 10."
          value={form.coverage}
          error={errors.coverage}
          onChange={(value) => set('coverage', value)}
        />
      </fieldset>

      {formError && (
        <p className="field-error" role="alert">
          {formError}
        </p>
      )}
      <div className="action-row">
        <button className="btn" type="submit" disabled={pending}>
          {pending ? 'Saving…' : editing ? 'Save changes' : 'Publish project'}
        </button>
        <button className="btn ghost" type="button" onClick={() => navigate(-1)}>
          Cancel
        </button>
      </div>
    </form>
  )
}

function NumberField({
  label,
  value,
  error,
  onChange,
}: {
  label: string
  value: string
  error?: string
  onChange: (value: string) => void
}) {
  return (
    <label className={error ? 'invalid' : ''}>
      {label}
      <input inputMode="numeric" value={value} onChange={(event) => onChange(event.target.value)} />
      {error && <span className="field-error">{error}</span>}
    </label>
  )
}

function RangeField({
  label,
  hint,
  value,
  error,
  onChange,
}: {
  label: string
  hint: string
  value: number
  error?: string
  onChange: (value: number) => void
}) {
  return (
    <label className={error ? 'range-field invalid' : 'range-field'}>
      <span className="range-top">
        <span>{label}</span>
        <strong>{value}</strong>
      </span>
      <input
        type="range"
        min={1}
        max={10}
        step={1}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
      />
      <span className="hint">{hint}</span>
      {error && <span className="field-error">{error}</span>}
    </label>
  )
}
