import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, test } from 'vitest'
import type { Project } from '../types'
import { ProjectCard } from './ProjectCard'

const project: Project = {
  id: 'p1',
  title: 'ShiftSync',
  summary: 'Shift swaps for a small team, because the group chat kept losing Friday.',
  story: 'Staff set hours. A lead approves swaps.',
  tools: ['Cursor', 'Claude Code'],
  stack: ['React', 'TypeScript', 'Express', 'MongoDB'],
  outcomes: { hoursSaved: 36, featuresShipped: 11, users: 9 },
  difficulty: 8,
  coverage: 6,
  githubUrl: 'https://github.com/rajveer-singh-dev/shiftsync',
  shippedAt: '2026-01-18',
  createdAt: '2026-01-18T00:00:00.000Z',
  updatedAt: '2026-01-18T00:00:00.000Z',
  ownerId: 'u1',
  proof: 78,
  xp: 851,
  breakdown: { skill: 50, features: 11, hours: 3.6, users: 4, github: 5, tools: 4 },
  owner: { id: 'u1', username: 'rajveer', name: 'Rajveer Singh', proofScore: 79 },
}

describe('ProjectCard', () => {
  test('shows the title, a tool chip, and the proof score', () => {
    render(
      <MemoryRouter>
        <ProjectCard project={project} />
      </MemoryRouter>,
    )

    expect(screen.getByRole('heading', { name: 'ShiftSync' })).toBeInTheDocument()
    expect(screen.getByText('Claude Code')).toBeInTheDocument()
    expect(screen.getByText('Cursor')).toBeInTheDocument()
    expect(screen.getByLabelText('Proof score 78')).toBeInTheDocument()
    expect(screen.getByText('36')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Rajveer Singh' })).toHaveAttribute('href', '/u/rajveer')
  })
})
