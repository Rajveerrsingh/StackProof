export const TOOL_SUGGESTIONS = [
  'Cursor',
  'Claude Code',
  'GitHub Copilot',
  'ChatGPT',
  'VS Code',
  'v0',
  'Windsurf',
]

export const STACK_SUGGESTIONS = [
  'React',
  'TypeScript',
  'Node.js',
  'Express',
  'MongoDB',
  'Vite',
  'Jest',
  'Zod',
  'Socket.IO',
  'CSS',
]

const TOOL_COLORS: Record<string, string> = {
  Cursor: '#dff25a',
  'Claude Code': '#f0a35e',
  'GitHub Copilot': '#9db7ff',
  ChatGPT: '#e4ddd0',
  'VS Code': '#7ecbff',
  v0: '#f4f1e8',
  Windsurf: '#7ee0c6',
  Cody: '#e38bff',
}

export function toolColor(tool: string) {
  return TOOL_COLORS[tool] ?? '#c8c2b4'
}
