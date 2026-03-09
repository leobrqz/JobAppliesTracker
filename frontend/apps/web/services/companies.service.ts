import { apiRequest, type ApiResult } from "./api-client"
import type { CompanyCreate, CompanyResponse, CompanyUpdate } from "@/types"

export function getCompanies(search?: string): Promise<ApiResult<CompanyResponse[]>> {
  const params = search ? `?search=${encodeURIComponent(search)}` : ""
  return apiRequest<CompanyResponse[]>(`/api/companies/${params}`)
}

export function getCompany(id: number): Promise<ApiResult<CompanyResponse>> {
  return apiRequest<CompanyResponse>(`/api/companies/${id}`)
}

export function createCompany(data: CompanyCreate): Promise<ApiResult<CompanyResponse>> {
  return apiRequest<CompanyResponse>("/api/companies/", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })
}

export function updateCompany(id: number, data: CompanyUpdate): Promise<ApiResult<CompanyResponse>> {
  return apiRequest<CompanyResponse>(`/api/companies/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })
}

export function deleteCompany(id: number): Promise<ApiResult<null>> {
  return apiRequest<null>(`/api/companies/${id}`, { method: "DELETE" })
}
