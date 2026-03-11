import { apiRequest, type ApiResult } from "./api-client"
import type {
  AppointmentCreate,
  AppointmentResponse,
  AppointmentUpdate,
} from "@/types"

export interface AppointmentParams {
  application_id?: number
  start?: string
  end?: string
}

function buildQuery(params?: AppointmentParams): string {
  if (!params) return ""
  const qs = new URLSearchParams()
  if (params.application_id !== undefined) qs.set("application_id", String(params.application_id))
  if (params.start) qs.set("start", params.start)
  if (params.end) qs.set("end", params.end)
  const str = qs.toString()
  return str ? `?${str}` : ""
}

export function getAppointments(params?: AppointmentParams): Promise<ApiResult<AppointmentResponse[]>> {
  return apiRequest<AppointmentResponse[]>(`/api/appointments/${buildQuery(params)}`)
}

export function getAppointment(id: number): Promise<ApiResult<AppointmentResponse>> {
  return apiRequest<AppointmentResponse>(`/api/appointments/${id}`)
}

export function createAppointment(data: AppointmentCreate): Promise<ApiResult<AppointmentResponse>> {
  return apiRequest<AppointmentResponse>("/api/appointments/", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })
}

export function updateAppointment(id: number, data: AppointmentUpdate): Promise<ApiResult<AppointmentResponse>> {
  return apiRequest<AppointmentResponse>(`/api/appointments/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })
}

export function deleteAppointment(id: number): Promise<ApiResult<null>> {
  return apiRequest<null>(`/api/appointments/${id}`, { method: "DELETE" })
}
