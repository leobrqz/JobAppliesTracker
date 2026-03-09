import { apiRequest, type ApiResult } from "./api-client"
import type {
  ApplicationCreate,
  ApplicationFilters,
  ApplicationHistoryCreate,
  ApplicationHistoryResponse,
  ApplicationResponse,
  ApplicationUpdate,
} from "@/types"

function buildFiltersQuery(filters?: ApplicationFilters): string {
  const params = new URLSearchParams()
  if (filters?.status) params.set("status", filters.status)
  if (filters?.stage) params.set("stage", filters.stage)
  if (filters?.platform_id !== undefined) params.set("platform_id", String(filters.platform_id))
  if (filters?.company_id !== undefined) params.set("company_id", String(filters.company_id))
  if (filters?.archived !== undefined) params.set("archived", String(filters.archived))
  const qs = params.toString()
  return qs ? `?${qs}` : ""
}

export function getApplications(filters?: ApplicationFilters): Promise<ApiResult<ApplicationResponse[]>> {
  return apiRequest<ApplicationResponse[]>(`/api/applications/${buildFiltersQuery(filters)}`)
}

export function getApplication(id: number): Promise<ApiResult<ApplicationResponse>> {
  return apiRequest<ApplicationResponse>(`/api/applications/${id}`)
}

export function createApplication(data: ApplicationCreate): Promise<ApiResult<ApplicationResponse>> {
  return apiRequest<ApplicationResponse>("/api/applications/", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })
}

export function updateApplication(id: number, data: ApplicationUpdate): Promise<ApiResult<ApplicationResponse>> {
  return apiRequest<ApplicationResponse>(`/api/applications/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })
}

export function deleteApplication(id: number): Promise<ApiResult<null>> {
  return apiRequest<null>(`/api/applications/${id}`, { method: "DELETE" })
}

export function archiveApplication(id: number): Promise<ApiResult<ApplicationResponse>> {
  return apiRequest<ApplicationResponse>(`/api/applications/${id}/archive`, { method: "POST" })
}

export function restoreApplication(id: number): Promise<ApiResult<ApplicationResponse>> {
  return apiRequest<ApplicationResponse>(`/api/applications/${id}/restore`, { method: "POST" })
}

export function getApplicationHistory(applicationId: number): Promise<ApiResult<ApplicationHistoryResponse[]>> {
  return apiRequest<ApplicationHistoryResponse[]>(`/api/applications/${applicationId}/history`)
}

export function advanceStage(
  applicationId: number,
  data: ApplicationHistoryCreate,
): Promise<ApiResult<ApplicationHistoryResponse>> {
  return apiRequest<ApplicationHistoryResponse>(`/api/applications/${applicationId}/history`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })
}

export function deleteHistoryEntry(applicationId: number, historyId: number): Promise<ApiResult<null>> {
  return apiRequest<null>(`/api/applications/${applicationId}/history/${historyId}`, { method: "DELETE" })
}
