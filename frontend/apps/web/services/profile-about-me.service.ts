import { apiRequest, type ApiResult } from "./api-client"
import type { ProfileAboutMeResponse, ProfileAboutMeUpdate } from "@/types"

export function getProfileAboutMe(): Promise<ApiResult<ProfileAboutMeResponse>> {
  return apiRequest<ProfileAboutMeResponse>("/api/profile-about-me/")
}

export function updateProfileAboutMe(data: ProfileAboutMeUpdate): Promise<ApiResult<ProfileAboutMeResponse>> {
  return apiRequest<ProfileAboutMeResponse>("/api/profile-about-me/", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })
}
