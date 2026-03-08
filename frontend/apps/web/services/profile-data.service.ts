import { apiRequest, type ApiResult } from "./api-client"
import type { ProfileDataCreate, ProfileDataResponse, ProfileDataUpdate } from "@/types"

export function getAllProfileData(): Promise<ApiResult<ProfileDataResponse[]>> {
  return apiRequest<ProfileDataResponse[]>("/api/profile-data/")
}

export function getProfileData(id: number): Promise<ApiResult<ProfileDataResponse>> {
  return apiRequest<ProfileDataResponse>(`/api/profile-data/${id}`)
}

export function createProfileData(data: ProfileDataCreate): Promise<ApiResult<ProfileDataResponse>> {
  return apiRequest<ProfileDataResponse>("/api/profile-data/", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })
}

export function updateProfileData(id: number, data: ProfileDataUpdate): Promise<ApiResult<ProfileDataResponse>> {
  return apiRequest<ProfileDataResponse>(`/api/profile-data/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })
}

export function deleteProfileData(id: number): Promise<ApiResult<null>> {
  return apiRequest<null>(`/api/profile-data/${id}`, { method: "DELETE" })
}
