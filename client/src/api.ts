const TOKEN_KEY = 'stackproof_token'

export type FieldDetail = { path: string; message: string }

export class ApiError extends Error {
  status: number
  details?: FieldDetail[]

  constructor(status: number, message: string, details?: FieldDetail[]) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.details = details
  }
}

export function getToken() {
  return localStorage.getItem(TOKEN_KEY)
}

export function setToken(token: string | null) {
  if (token) localStorage.setItem(TOKEN_KEY, token)
  else localStorage.removeItem(TOKEN_KEY)
}

// `npm run build:demo` sets VITE_DEMO=1 for GitHub Pages. There is no server
// there, so requests go to the API's own services bundled for the browser
// (server/src/demo/browserApi.js), with data saved in localStorage.
export const DEMO_MODE = import.meta.env.VITE_DEMO === '1'

type DemoApi = {
  handle: (method: string, url: string, body: unknown, token: string | null) => Promise<{ status: number; body: unknown }>
  resetDemo: () => Promise<void>
}

let demoApi: Promise<DemoApi> | null = null

export function loadDemoApi(): Promise<DemoApi> {
  demoApi ??= import(/* @vite-ignore */ `${import.meta.env.BASE_URL}demo-api.js`).then(
    // The bundle is CommonJS wrapped as ESM, so the functions sit on default.
    (mod) => (mod.default ?? mod) as DemoApi,
  )
  return demoApi
}

async function demoFetch(path: string, method: string, body: unknown, token: string | null) {
  const demo = await loadDemoApi()
  const result = await demo.handle(method, path, body, token)
  return {
    status: result.status,
    ok: result.status >= 200 && result.status < 300,
    json: async () => result.body,
  }
}

export async function api<T>(path: string, options: { method?: string; body?: unknown } = {}): Promise<T> {
  const headers: Record<string, string> = {}
  if (options.body !== undefined) headers['Content-Type'] = 'application/json'
  const token = getToken()
  if (token) headers.Authorization = `Bearer ${token}`

  let response: Response
  try {
    response = DEMO_MODE
      ? ((await demoFetch(path, options.method ?? 'GET', options.body, token)) as unknown as Response)
      : await fetch(path, {
          method: options.method ?? 'GET',
          headers,
          body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
        })
  } catch {
    throw new ApiError(0, 'Cannot reach the API. Is the server running?')
  }

  if (response.status === 204) return undefined as T

  const data = (await response.json().catch(() => ({}))) as {
    error?: string
    details?: FieldDetail[]
  }

  if (!response.ok) {
    throw new ApiError(response.status, data.error || 'Something went wrong', data.details)
  }

  return data as T
}
