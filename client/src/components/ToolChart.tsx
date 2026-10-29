import type { ToolBar } from '../types'

export function ToolChart({ tools }: { tools: ToolBar[] }) {
  if (tools.length === 0) {
    return <p className="empty-note">No tools logged yet.</p>
  }

  return (
    <ul className="bars" aria-label="Tool usage">
      {tools.map((row) => (
        <li key={row.tool}>
          <span className="bar-label">{row.tool}</span>
          <span className="bar-track" aria-hidden="true">
            <span className="bar-fill" style={{ width: `${row.share}%` }} />
          </span>
          <span className="bar-count">{row.count}</span>
        </li>
      ))}
    </ul>
  )
}
