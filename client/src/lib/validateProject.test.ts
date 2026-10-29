import { describe, expect, test } from 'vitest'
import { emptyProjectForm, toProjectPayload, validateProject } from './validateProject'

describe('validateProject', () => {
  test('asks for a real summary and at least one tool', () => {
    const errors = validateProject({ ...emptyProjectForm(), title: 'A', summary: 'too short' })
    expect(errors.title).toBeTruthy()
    expect(errors.summary).toBeTruthy()
    expect(errors.tools).toBeTruthy()
    expect(errors.stack).toBeTruthy()
  })

  test('rejects a difficulty outside 1 to 10', () => {
    const errors = validateProject({
      ...emptyProjectForm(),
      title: 'Night Bus',
      summary: 'A tiny page that tells me the last bus.',
      tools: ['Cursor'],
      stack: ['React'],
      difficulty: 11,
    })
    expect(errors.difficulty).toMatch(/1 to 10/)
  })

  test('turns a valid form into the API payload', () => {
    const form = {
      ...emptyProjectForm(),
      title: 'Night Bus',
      summary: 'A tiny page that tells me the last bus.',
      tools: ['Cursor'],
      stack: ['React', 'TypeScript'],
      hoursSaved: '3',
      featuresShipped: '3',
      users: '2',
      difficulty: 4,
      coverage: 5,
      githubUrl: 'https://github.com/rajveer-singh-dev/night-bus',
      shippedAt: '2026-08-01',
    }
    expect(validateProject(form)).toEqual({})
    expect(toProjectPayload(form).outcomes).toEqual({
      hoursSaved: 3,
      featuresShipped: 3,
      users: 2,
    })
  })
})
