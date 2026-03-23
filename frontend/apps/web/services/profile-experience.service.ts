import { apiRequest, type ApiResult } from "./api-client"
import type {
  ExperienceBulletCreate,
  ExperienceBulletResponse,
  ExperienceBulletUpdate,
  ExperienceEntryCreate,
  ExperienceEntryResponse,
  ExperienceEntryUpdate,
  ExperienceReorderItem,
} from "@/types"

export function getAllProfileExperience(): Promise<ApiResult<ExperienceEntryResponse[]>> {
  return apiRequest<ExperienceEntryResponse[]>("/api/profile-experience/")
}

export function createProfileExperience(data: ExperienceEntryCreate): Promise<ApiResult<ExperienceEntryResponse>> {
  return apiRequest<ExperienceEntryResponse>("/api/profile-experience/", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })
}

export function updateProfileExperience(
  id: number,
  data: ExperienceEntryUpdate,
): Promise<ApiResult<ExperienceEntryResponse>> {
  return apiRequest<ExperienceEntryResponse>(`/api/profile-experience/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })
}

export function deleteProfileExperience(id: number): Promise<ApiResult<null>> {
  return apiRequest<null>(`/api/profile-experience/${id}`, { method: "DELETE" })
}

export function reorderProfileExperience(items: ExperienceReorderItem[]): Promise<ApiResult<ExperienceEntryResponse[]>> {
  return apiRequest<ExperienceEntryResponse[]>("/api/profile-experience/reorder", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(items),
  })
}

export function createProfileExperienceBullet(
  entryId: number,
  data: ExperienceBulletCreate,
): Promise<ApiResult<ExperienceBulletResponse>> {
  return apiRequest<ExperienceBulletResponse>(`/api/profile-experience/${entryId}/bullets`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })
}

export function updateProfileExperienceBullet(
  bulletId: number,
  data: ExperienceBulletUpdate,
): Promise<ApiResult<ExperienceBulletResponse>> {
  return apiRequest<ExperienceBulletResponse>(`/api/profile-experience/bullets/${bulletId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })
}

export function deleteProfileExperienceBullet(bulletId: number): Promise<ApiResult<null>> {
  return apiRequest<null>(`/api/profile-experience/bullets/${bulletId}`, { method: "DELETE" })
}

export function reorderProfileExperienceBullets(
  entryId: number,
  items: ExperienceReorderItem[],
): Promise<ApiResult<ExperienceBulletResponse[]>> {
  return apiRequest<ExperienceBulletResponse[]>(`/api/profile-experience/${entryId}/bullets/reorder`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(items),
  })
}
