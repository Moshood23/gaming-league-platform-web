export class ApiError extends Error {
  readonly status: number

  constructor(status: number, message: string) {
    super(message)
    this.status = status
  }
}

/** Calls the backend on the same origin, sending the login cookie with every request. */
export async function apiFetch(path: string, init?: RequestInit): Promise<Response> {
  const response = await fetch(path, { credentials: 'same-origin', ...init })
  if (!response.ok) {
    throw new ApiError(response.status, `Request to ${path} failed with status ${response.status}`)
  }
  return response
}
