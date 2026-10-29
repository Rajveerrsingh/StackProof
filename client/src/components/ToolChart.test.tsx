import { render, screen } from '@testing-library/react'
import { describe, expect, test } from 'vitest'
import { ToolChart } from './ToolChart'

describe('ToolChart', () => {
  test('draws a row for each tool', () => {
    render(
      <ToolChart
        tools={[
          { tool: 'GitHub Copilot', count: 4, share: 80 },
          { tool: 'Cursor', count: 3, share: 60 },
          { tool: 'Claude Code', count: 2, share: 40 },
        ]}
      />,
    )

    const list = screen.getByRole('list', { name: 'Tool usage' })
    expect(list).toBeInTheDocument()
    expect(screen.getByText('Cursor')).toBeInTheDocument()
    expect(screen.getByText('GitHub Copilot')).toBeInTheDocument()
    expect(screen.getByText('3')).toBeInTheDocument()
    expect(screen.getByText('2')).toBeInTheDocument()
  })

  test('says so when there is nothing to chart', () => {
    render(<ToolChart tools={[]} />)
    expect(screen.getByText('No tools logged yet.')).toBeInTheDocument()
  })
})
