import { toolColor } from '../lib/tools'

export function ToolChips({ tools }: { tools: string[] }) {
  return (
    <ul className="tool-row">
      {tools.map((tool) => (
        <li key={tool} className="tool-chip" style={{ ['--dot' as string]: toolColor(tool) }}>
          {tool}
        </li>
      ))}
    </ul>
  )
}
