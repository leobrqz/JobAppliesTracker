const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000"

export type ApiResult<T> = { data: T; error: null } | { data: null; error: string }

export async function apiRequest<T>(
  path: string,
  options?: RequestInit,
): Promise<ApiResult<T>> {
  try {
    const response = await fetch(`${BASE_URL}${path}`, options)

    if (response.status === 204) {
      return { data: null as T, error: null }
    }

    if (!response.ok) {
      let message = `Error ${response.status}`
      try {
        const body = await response.json()
        if (typeof body?.detail === "string") {
          message = body.detail
        }
      } catch {
        // ignore parse errors
      }
      return { data: null, error: message }
    }

    const data = await response.json()
    return { data, error: null }
  } catch {
    return { data: null, error: "Network error" }
  }
}
