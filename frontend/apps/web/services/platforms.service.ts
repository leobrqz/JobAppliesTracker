import { apiRequest, type ApiResult } from "./api-client"
import type { JobPlatformCreate, JobPlatformResponse, JobPlatformUpdate } from "@/types"

export function getJobPlatforms(): Promise<ApiResult<JobPlatformResponse[]>> {
  return apiRequest<JobPlatformResponse[]>("/api/job-platforms/")
}

export function getJobPlatform(id: number): Promise<ApiResult<JobPlatformResponse>> {
  return apiRequest<JobPlatformResponse>(`/api/job-platforms/${id}`)
}

export function createJobPlatform(data: JobPlatformCreate): Promise<ApiResult<JobPlatformResponse>> {
  return apiRequest<JobPlatformResponse>("/api/job-platforms/", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })
}

export function updateJobPlatform(id: number, data: JobPlatformUpdate): Promise<ApiResult<JobPlatformResponse>> {
  return apiRequest<JobPlatformResponse>(`/api/job-platforms/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })
}

export function deleteJobPlatform(id: number): Promise<ApiResult<null>> {
  return apiRequest<null>(`/api/job-platforms/${id}`, { method: "DELETE" })
}
