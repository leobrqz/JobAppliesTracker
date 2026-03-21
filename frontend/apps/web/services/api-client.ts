const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000"

export type ApiResult<T> = { data: T; error: null } | { data: null; error: string }

function normalizeErrorMessage(status: number, body: unknown): string {
  if (body && typeof body === "object") {
    const anyBody = body as any
    if (typeof anyBody.detail === "string") {
      const ref = anyBody.ref
      if (typeof ref === "string" && ref.length > 0) {
        return `${anyBody.detail} Reference: ${ref}`
      }
      return anyBody.detail
    }
    if (Array.isArray(anyBody.detail)) {
      const messages = anyBody.detail
        .map((item) => {
          if (item && typeof item === "object" && typeof (item as any).msg === "string") {
            return (item as any).msg
          }
          return ""
        })
        .filter(Boolean)
      if (messages.length > 0) {
        return messages.join("; ")
      }
    }
    if (typeof anyBody.message === "string") {
      return anyBody.message
    }
    if (typeof anyBody.error === "string") {
      return anyBody.error
    }
  }
  return `Error ${status}`
}

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
      try {
        const body = await response.json()
        const message = normalizeErrorMessage(response.status, body)
        return { data: null, error: message }
      } catch {
        return { data: null, error: `Error ${response.status}` }
      }
    }

    const data = await response.json()
    return { data, error: null }
  } catch {
    return { data: null, error: "Network error" }
  }
}
