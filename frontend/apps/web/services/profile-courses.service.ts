import { apiRequest, type ApiResult } from "./api-client"
import type { CourseEntryCreate, CourseEntryResponse, CourseEntryUpdate, CourseReorderItem } from "@/types"

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000"

export function getProfileCourses(): Promise<ApiResult<CourseEntryResponse[]>> {
  return apiRequest<CourseEntryResponse[]>("/api/profile-courses/")
}

export function createProfileCourse(data: CourseEntryCreate): Promise<ApiResult<CourseEntryResponse>> {
  return apiRequest<CourseEntryResponse>("/api/profile-courses/", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })
}

export function updateProfileCourse(id: number, data: CourseEntryUpdate): Promise<ApiResult<CourseEntryResponse>> {
  return apiRequest<CourseEntryResponse>(`/api/profile-courses/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })
}

export function deleteProfileCourse(id: number): Promise<ApiResult<null>> {
  return apiRequest<null>(`/api/profile-courses/${id}`, { method: "DELETE" })
}

export function reorderProfileCourses(items: CourseReorderItem[]): Promise<ApiResult<CourseEntryResponse[]>> {
  return apiRequest<CourseEntryResponse[]>("/api/profile-courses/reorder", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(items),
  })
}

export function uploadProfileCourseAttachment(id: number, formData: FormData): Promise<ApiResult<CourseEntryResponse>> {
  return apiRequest<CourseEntryResponse>(`/api/profile-courses/${id}/attachment`, {
    method: "POST",
    body: formData,
  })
}

export function deleteProfileCourseAttachment(id: number): Promise<ApiResult<CourseEntryResponse>> {
  return apiRequest<CourseEntryResponse>(`/api/profile-courses/${id}/attachment`, { method: "DELETE" })
}

export function downloadProfileCourseAttachment(id: number, fileName: string): void {
  const url = `${BASE_URL}/api/profile-courses/${id}/attachment/download`
  const anchor = document.createElement("a")
  anchor.href = url
  anchor.download = fileName
  document.body.appendChild(anchor)
  anchor.click()
  document.body.removeChild(anchor)
}
