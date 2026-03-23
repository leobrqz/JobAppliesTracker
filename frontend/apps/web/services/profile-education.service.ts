import { apiRequest, type ApiResult } from "./api-client"
import type {
  EducationEntryCreate,
  EducationEntryResponse,
  EducationEntryUpdate,
  EducationHighlightCreate,
  EducationHighlightResponse,
  EducationHighlightUpdate,
  EducationReorderItem,
} from "@/types"

export function getAllProfileEducation(): Promise<ApiResult<EducationEntryResponse[]>> {
  return apiRequest<EducationEntryResponse[]>("/api/profile-education/")
}

export function createProfileEducation(data: EducationEntryCreate): Promise<ApiResult<EducationEntryResponse>> {
  return apiRequest<EducationEntryResponse>("/api/profile-education/", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })
}

export function updateProfileEducation(
  id: number,
  data: EducationEntryUpdate,
): Promise<ApiResult<EducationEntryResponse>> {
  return apiRequest<EducationEntryResponse>(`/api/profile-education/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })
}

export function deleteProfileEducation(id: number): Promise<ApiResult<null>> {
  return apiRequest<null>(`/api/profile-education/${id}`, { method: "DELETE" })
}

export function reorderProfileEducation(items: EducationReorderItem[]): Promise<ApiResult<EducationEntryResponse[]>> {
  return apiRequest<EducationEntryResponse[]>("/api/profile-education/reorder", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(items),
  })
}

export function createProfileEducationHighlight(
  entryId: number,
  data: EducationHighlightCreate,
): Promise<ApiResult<EducationHighlightResponse>> {
  return apiRequest<EducationHighlightResponse>(`/api/profile-education/${entryId}/highlights`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })
}

export function updateProfileEducationHighlight(
  highlightId: number,
  data: EducationHighlightUpdate,
): Promise<ApiResult<EducationHighlightResponse>> {
  return apiRequest<EducationHighlightResponse>(`/api/profile-education/highlights/${highlightId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })
}

export function deleteProfileEducationHighlight(highlightId: number): Promise<ApiResult<null>> {
  return apiRequest<null>(`/api/profile-education/highlights/${highlightId}`, { method: "DELETE" })
}

export function reorderProfileEducationHighlights(
  entryId: number,
  items: EducationReorderItem[],
): Promise<ApiResult<EducationHighlightResponse[]>> {
  return apiRequest<EducationHighlightResponse[]>(`/api/profile-education/${entryId}/highlights/reorder`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(items),
  })
}
