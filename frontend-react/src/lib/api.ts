/** Dev: use relative `/api` so Vite proxy forwards to Spring. Prod: set VITE_API_BASE (e.g. https://api.example.com). */
export function apiUrl(path: string): string {
  const normalized = path.startsWith('/') ? path : `/${path}`
  const base = (import.meta.env.VITE_API_BASE as string | undefined)?.replace(/\/$/, '') ?? ''
  return base ? `${base}${normalized}` : normalized
}

export function basicAuthHeader(email: string, password: string): HeadersInit {
  const token = typeof btoa !== 'undefined' ? btoa(`${email}:${password}`) : ''
  return { Authorization: `Basic ${token}` }
}

export class ApiError extends Error {
  constructor(
    public status: number,
    public body: string,
  ) {
    super(body || `Request failed with status ${status}`)
    this.name = 'ApiError'
  }
}

export async function apiFetch(path: string, init?: RequestInit): Promise<Response> {
  return fetch(apiUrl(path), init)
}

export async function readErrorBody(res: Response): Promise<string> {
  try {
    const t = await res.text()
    return t || res.statusText
  } catch {
    return res.statusText
  }
}

export async function getJson<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await apiFetch(path, init)
  const text = await res.text()
  if (!res.ok) {
    throw new ApiError(res.status, text || res.statusText)
  }
  if (!text) return undefined as T
  return JSON.parse(text) as T
}

export async function postJson(path: string, body: unknown, init?: RequestInit): Promise<Response> {
  const headers = new Headers(init?.headers)
  headers.set('Content-Type', 'application/json')
  return apiFetch(path, {
    ...init,
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  })
}

export async function postJsonData<T>(path: string, body: unknown, init?: RequestInit): Promise<T> {
  const res = await postJson(path, body, init)
  const text = await readErrorBody(res)
  if (!res.ok) throw new ApiError(res.status, text)
  if (!text) return undefined as T
  return JSON.parse(text) as T
}

export async function postJsonText(path: string, body: unknown, init?: RequestInit): Promise<string> {
  const res = await postJson(path, body, init)
  const text = await readErrorBody(res)
  if (!res.ok) throw new ApiError(res.status, text)
  return text
}

export async function putJsonData<T>(path: string, body: unknown, init?: RequestInit): Promise<T> {
  const headers = new Headers(init?.headers)
  headers.set('Content-Type', 'application/json')
  const res = await apiFetch(path, {
    ...init,
    method: 'PUT',
    headers,
    body: JSON.stringify(body),
  })
  const text = await readErrorBody(res)
  if (!res.ok) throw new ApiError(res.status, text)
  if (!text) return undefined as T
  return JSON.parse(text) as T
}

export async function deleteRequest(path: string, init?: RequestInit): Promise<Response> {
  return apiFetch(path, { ...init, method: 'DELETE' })
}

/** Parse role from "Login successful for user: Name with role: student" */
export function parseRoleFromLoginMessage(message: string): 'student' | 'director' | 'admin' | null {
  const m = message.match(/with role:\s*(\w+)/i)
  if (!m) return null
  const r = m[1].toLowerCase()
  if (r === 'student' || r === 'director' || r === 'admin') return r
  return null
}
