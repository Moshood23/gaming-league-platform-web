/** Shape of the backend's error responses (RFC 7807 problem details). */
export interface Problem {
  title?: string
  detail?: string
  code?: string
  errors?: Record<string, string[]>
}

export class ApiError extends Error {
  readonly status: number
  readonly problem: Problem

  constructor(status: number, problem: Problem) {
    super(problem.detail ?? problem.title ?? `Request failed with status ${status}`)
    this.status = status
    this.problem = problem
  }

  /** The first error message for a form field, if the server rejected it. */
  fieldError(field: string): string | undefined {
    return this.problem.errors?.[field]?.[0]
  }
}

/** The server's message for one form field, if the request failed because of it. */
export function fieldError(error: unknown, field: string): string | undefined {
  return error instanceof ApiError ? error.fieldError(field) : undefined
}

const XSRF_COOKIE = 'XSRF-TOKEN'
const XSRF_HEADER = 'X-XSRF-TOKEN'

function readCookie(name: string): string | undefined {
  const entry = document.cookie.split('; ').find((c) => c.startsWith(`${name}=`))
  return entry ? decodeURIComponent(entry.slice(name.length + 1)) : undefined
}

/**
 * Gets a fresh anti-forgery token. The token is tied to the signed-in user,
 * so this runs on start-up and again after logging in or out.
 */
export async function refreshAntiforgery(): Promise<void> {
  await fetch('/api/auth/antiforgery', { credentials: 'same-origin' })
}

/** Calls the backend on the same origin, sending the login cookie and anti-forgery header. */
export async function api<T = void>(path: string, init: RequestInit & { json?: unknown } = {}): Promise<T> {
  const { json, ...rest } = init
  const method = (rest.method ?? 'GET').toUpperCase()
  const headers = new Headers(rest.headers)

  if (json !== undefined) {
    headers.set('Content-Type', 'application/json')
  }
  if (method !== 'GET' && method !== 'HEAD') {
    if (!readCookie(XSRF_COOKIE)) {
      await refreshAntiforgery()
    }
    headers.set(XSRF_HEADER, readCookie(XSRF_COOKIE) ?? '')
  }

  const response = await fetch(path, {
    ...rest,
    method,
    headers,
    credentials: 'same-origin',
    body: json !== undefined ? JSON.stringify(json) : rest.body,
  })

  if (!response.ok) {
    const problem: Problem = response.headers.get('Content-Type')?.includes('json') ? await response.json() : {}
    throw new ApiError(response.status, problem)
  }

  return (response.status === 204 || response.status === 202 ? undefined : await response.json()) as T
}
