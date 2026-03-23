import { apiRequest, type ApiResult } from "./api-client"
import type {
  ProjectBulletCreate,
  ProjectBulletResponse,
  ProjectBulletUpdate,
  ProjectEntryCreate,
  ProjectEntryResponse,
  ProjectEntryUpdate,
  ProjectReorderItem,
} from "@/types"

export function getAllProfileProjects(): Promise<ApiResult<ProjectEntryResponse[]>> {
  return apiRequest<ProjectEntryResponse[]>("/api/profile-projects/")
}

export function createProfileProject(data: ProjectEntryCreate): Promise<ApiResult<ProjectEntryResponse>> {
  return apiRequest<ProjectEntryResponse>("/api/profile-projects/", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })
}

export function updateProfileProject(id: number, data: ProjectEntryUpdate): Promise<ApiResult<ProjectEntryResponse>> {
  return apiRequest<ProjectEntryResponse>(`/api/profile-projects/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })
}

export function deleteProfileProject(id: number): Promise<ApiResult<null>> {
  return apiRequest<null>(`/api/profile-projects/${id}`, { method: "DELETE" })
}

export function reorderProfileProjects(items: ProjectReorderItem[]): Promise<ApiResult<ProjectEntryResponse[]>> {
  return apiRequest<ProjectEntryResponse[]>("/api/profile-projects/reorder", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(items),
  })
}

export function createProfileProjectBullet(
  entryId: number,
  data: ProjectBulletCreate,
): Promise<ApiResult<ProjectBulletResponse>> {
  return apiRequest<ProjectBulletResponse>(`/api/profile-projects/${entryId}/bullets`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })
}

export function updateProfileProjectBullet(
  bulletId: number,
  data: ProjectBulletUpdate,
): Promise<ApiResult<ProjectBulletResponse>> {
  return apiRequest<ProjectBulletResponse>(`/api/profile-projects/bullets/${bulletId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })
}

export function deleteProfileProjectBullet(bulletId: number): Promise<ApiResult<null>> {
  return apiRequest<null>(`/api/profile-projects/bullets/${bulletId}`, { method: "DELETE" })
}

export function reorderProfileProjectBullets(
  entryId: number,
  items: ProjectReorderItem[],
): Promise<ApiResult<ProjectBulletResponse[]>> {
  return apiRequest<ProjectBulletResponse[]>(`/api/profile-projects/${entryId}/bullets/reorder`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(items),
  })
}
