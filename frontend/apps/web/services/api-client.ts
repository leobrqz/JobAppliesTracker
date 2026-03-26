const BASE_URL = process.env.NEXT_PUBLIC_API_URL

if (!BASE_URL) {
  throw new Error("NEXT_PUBLIC_API_URL is required (set it in frontend/apps/web/.env.local or via Docker Compose).")
}

export type ApiResult<T> = { data: T; error: null } | { data: null; error: string }

let getValidAccessToken: ((forceRefresh?: boolean) => Promise<string | null>) | null = null
let hardSignOutAndRedirect: (() => Promise<void>) | null = null

if (typeof window !== "undefined") {
  void import("@/lib/supabase/auth-session").then((mod) => {
    getValidAccessToken = mod.getValidAccessToken
    hardSignOutAndRedirect = mod.hardSignOutAndRedirect
  })
}

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
        .map((item: unknown) => {
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
  const executeRequest = async (token: string | null) => {
    const headers = new Headers(options?.headers)
    if (token) {
      headers.set("Authorization", `Bearer ${token}`)
    }
    return fetch(`${BASE_URL}${path}`, {
      ...options,
      headers,
    })
  }

  try {
    const initialToken = getValidAccessToken ? await getValidAccessToken(false) : null
    let response = await executeRequest(initialToken)

    if (response.status === 401 && getValidAccessToken) {
      const refreshedToken = await getValidAccessToken(true)
      if (refreshedToken) {
        response = await executeRequest(refreshedToken)
      }
      if (response.status === 401) {
        if (hardSignOutAndRedirect) {
          void hardSignOutAndRedirect()
        }
        return { data: null, error: "Authentication required" }
      }
    }

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
