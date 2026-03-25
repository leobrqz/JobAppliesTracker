import { apiRequest, type ApiResult } from "./api-client"
import type {
  CertificationEntryCreate,
  CertificationEntryResponse,
  CertificationEntryUpdate,
  CertificationReorderItem,
} from "@/types"

const BASE_URL = process.env.NEXT_PUBLIC_API_URL

if (!BASE_URL) {
  throw new Error("NEXT_PUBLIC_API_URL is required (set it in frontend/apps/web/.env.local or via Docker Compose).")
}

export function getProfileCertifications(): Promise<ApiResult<CertificationEntryResponse[]>> {
  return apiRequest<CertificationEntryResponse[]>("/api/profile-certifications/")
}

export function createProfileCertification(data: CertificationEntryCreate): Promise<ApiResult<CertificationEntryResponse>> {
  return apiRequest<CertificationEntryResponse>("/api/profile-certifications/", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })
}

export function updateProfileCertification(
  id: number,
  data: CertificationEntryUpdate,
): Promise<ApiResult<CertificationEntryResponse>> {
  return apiRequest<CertificationEntryResponse>(`/api/profile-certifications/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })
}

export function deleteProfileCertification(id: number): Promise<ApiResult<null>> {
  return apiRequest<null>(`/api/profile-certifications/${id}`, { method: "DELETE" })
}

export function reorderProfileCertifications(
  items: CertificationReorderItem[],
): Promise<ApiResult<CertificationEntryResponse[]>> {
  return apiRequest<CertificationEntryResponse[]>("/api/profile-certifications/reorder", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(items),
  })
}

export function uploadProfileCertificationAttachment(
  id: number,
  formData: FormData,
): Promise<ApiResult<CertificationEntryResponse>> {
  return apiRequest<CertificationEntryResponse>(`/api/profile-certifications/${id}/attachment`, {
    method: "POST",
    body: formData,
  })
}

export function deleteProfileCertificationAttachment(id: number): Promise<ApiResult<CertificationEntryResponse>> {
  return apiRequest<CertificationEntryResponse>(`/api/profile-certifications/${id}/attachment`, { method: "DELETE" })
}

export function downloadProfileCertificationAttachment(id: number, fileName: string): void {
  const url = `${BASE_URL}/api/profile-certifications/${id}/attachment/download`
  const anchor = document.createElement("a")
  anchor.href = url
  anchor.download = fileName
  document.body.appendChild(anchor)
  anchor.click()
  document.body.removeChild(anchor)
}
