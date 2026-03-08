import { apiRequest, type ApiResult } from "./api-client"
import type { ResumeResponse, ResumeUpdate } from "@/types"

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000"

export function getResumes(archived = false): Promise<ApiResult<ResumeResponse[]>> {
  return apiRequest<ResumeResponse[]>(`/api/resumes/?archived=${archived}`)
}

export function getResume(id: number): Promise<ApiResult<ResumeResponse>> {
  return apiRequest<ResumeResponse>(`/api/resumes/${id}`)
}

export function uploadResume(formData: FormData): Promise<ApiResult<ResumeResponse>> {
  return apiRequest<ResumeResponse>("/api/resumes/", {
    method: "POST",
    body: formData,
  })
}

export function updateResume(id: number, data: ResumeUpdate): Promise<ApiResult<ResumeResponse>> {
  return apiRequest<ResumeResponse>(`/api/resumes/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })
}

export function deleteResume(id: number): Promise<ApiResult<null>> {
  return apiRequest<null>(`/api/resumes/${id}`, { method: "DELETE" })
}

export function archiveResume(id: number): Promise<ApiResult<ResumeResponse>> {
  return apiRequest<ResumeResponse>(`/api/resumes/${id}/archive`, { method: "POST" })
}

export function restoreResume(id: number): Promise<ApiResult<ResumeResponse>> {
  return apiRequest<ResumeResponse>(`/api/resumes/${id}/restore`, { method: "POST" })
}

export function downloadResume(id: number, name: string): void {
  const url = `${BASE_URL}/api/resumes/${id}/download`
  const anchor = document.createElement("a")
  anchor.href = url
  anchor.download = name
  document.body.appendChild(anchor)
  anchor.click()
  document.body.removeChild(anchor)
}
