export type Outcomes = {
  hoursSaved: number
  featuresShipped: number
  users: number
}

export type Breakdown = {
  skill: number
  features: number
  hours: number
  users: number
  github: number
  tools: number
}

export type Owner = {
  id: string
  username: string
  name: string
  proofScore: number
}

export type Project = {
  id: string
  title: string
  summary: string
  story: string
  tools: string[]
  stack: string[]
  outcomes: Outcomes
  difficulty: number
  coverage: number
  githubUrl: string
  shippedAt: string
  createdAt: string
  updatedAt: string
  ownerId: string
  proof: number
  xp: number
  breakdown: Breakdown
  owner: Owner | null
}

export type User = {
  id: string
  username: string
  email: string
  name: string
  headline: string
  location: string
  bio: string
  createdAt: string
}

export type ToolBar = {
  tool: string
  count: number
  share: number
}

export type ScoreParts = {
  quality: number
  volume: number
  range: number
  depth: number
}

export type Profile = {
  id: string
  username: string
  name: string
  headline: string
  location: string
  bio: string
  createdAt: string
  proofScore: number
  totalXp: number
  parts: ScoreParts
  stats: {
    projects: number
    hoursSaved: number
    featuresShipped: number
    users: number
    avgDifficulty: number
    avgCoverage: number
  }
  tools: ToolBar[]
  projects: Project[]
}

export type Formula = {
  project: string
  xp: string
  developer: string
}

export type ProjectInput = {
  title: string
  summary: string
  story: string
  tools: string[]
  stack: string[]
  outcomes: Outcomes
  difficulty: number
  coverage: number
  githubUrl: string
  shippedAt: string
}
