import type { ProjectInput } from '../types'

export type ProjectForm = {
  title: string
  summary: string
  story: string
  tools: string[]
  stack: string[]
  hoursSaved: string
  featuresShipped: string
  users: string
  difficulty: number
  coverage: number
  githubUrl: string
  shippedAt: string
}

export type FieldErrors = Partial<Record<keyof ProjectForm, string>>

function wholeNumber(value: string, max: number) {
  if (!/^\d+$/.test(value.trim())) return false
  const n = Number(value)
  return n >= 0 && n <= max
}

export function validateProject(input: ProjectForm): FieldErrors {
  const errors: FieldErrors = {}

  if (input.title.trim().length < 2) errors.title = 'Give the project a name'
  else if (input.title.trim().length > 80) errors.title = 'Keep the name under 80 characters'

  if (input.summary.trim().length < 12) errors.summary = 'Say a bit more — at least a sentence'
  else if (input.summary.trim().length > 320) errors.summary = 'Keep the summary under 320 characters'

  if (input.story.trim().length > 4000) errors.story = 'The story is too long'

  if (input.tools.length < 1) errors.tools = 'Add at least one tool'
  else if (input.tools.length > 8) errors.tools = 'Eight tools is the cap'

  if (input.stack.length < 1) errors.stack = 'Add at least one stack tag'
  else if (input.stack.length > 12) errors.stack = 'Twelve tags is the cap'

  if (!wholeNumber(input.hoursSaved, 100000)) errors.hoursSaved = 'Hours should be a whole number'
  if (!wholeNumber(input.featuresShipped, 500)) errors.featuresShipped = 'Features should be a whole number'
  if (!wholeNumber(input.users, 1000000000)) errors.users = 'Users should be a whole number'

  if (!Number.isInteger(input.difficulty) || input.difficulty < 1 || input.difficulty > 10) {
    errors.difficulty = 'Difficulty is from 1 to 10'
  }
  if (!Number.isInteger(input.coverage) || input.coverage < 1 || input.coverage > 10) {
    errors.coverage = 'Coverage is from 1 to 10'
  }

  const link = input.githubUrl.trim()
  if (link && !/^https?:\/\/\S+$/i.test(link)) errors.githubUrl = 'Enter a full http(s) link'

  if (!input.shippedAt || Number.isNaN(Date.parse(input.shippedAt))) errors.shippedAt = 'Enter a ship date'

  return errors
}

export function toProjectPayload(input: ProjectForm): ProjectInput {
  return {
    title: input.title.trim(),
    summary: input.summary.trim(),
    story: input.story.trim(),
    tools: input.tools,
    stack: input.stack,
    outcomes: {
      hoursSaved: Number(input.hoursSaved),
      featuresShipped: Number(input.featuresShipped),
      users: Number(input.users),
    },
    difficulty: input.difficulty,
    coverage: input.coverage,
    githubUrl: input.githubUrl.trim(),
    shippedAt: input.shippedAt,
  }
}

export function emptyProjectForm(): ProjectForm {
  return {
    title: '',
    summary: '',
    story: '',
    tools: [],
    stack: [],
    hoursSaved: '0',
    featuresShipped: '0',
    users: '0',
    difficulty: 5,
    coverage: 5,
    githubUrl: '',
    shippedAt: new Date().toISOString().slice(0, 10),
  }
}
