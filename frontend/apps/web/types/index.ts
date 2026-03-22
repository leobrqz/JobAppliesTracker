import type { components } from "./api.generated"

export type ApplicationCreate = components["schemas"]["ApplicationCreate"]
export type ApplicationUpdate = components["schemas"]["ApplicationUpdate"]
export type ApplicationResponse = components["schemas"]["ApplicationResponse"]

export type AppointmentCreate = components["schemas"]["AppointmentCreate"]
export type AppointmentUpdate = components["schemas"]["AppointmentUpdate"]
export type AppointmentResponse = components["schemas"]["AppointmentResponse"]

export type CompanyCreate = components["schemas"]["CompanyCreate"]
export type CompanyUpdate = components["schemas"]["CompanyUpdate"]
export type CompanyResponse = components["schemas"]["CompanyResponse"]

export type ApplicationHistoryCreate = components["schemas"]["ApplicationHistoryCreate"]
export type ApplicationHistoryUpdate = components["schemas"]["ApplicationHistoryUpdate"]
export type ApplicationHistoryResponse = components["schemas"]["ApplicationHistoryResponse"]

export type JobPlatformCreate = components["schemas"]["JobPlatformCreate"]
export type JobPlatformUpdate = components["schemas"]["JobPlatformUpdate"]
export type JobPlatformResponse = components["schemas"]["JobPlatformResponse"]

export type PlatformTemplateResponse = components["schemas"]["PlatformTemplateResponse"]

export type ProfileDataCreate = components["schemas"]["ProfileDataCreate"]
export type ProfileDataUpdate = components["schemas"]["ProfileDataUpdate"]
export type ProfileDataResponse = components["schemas"]["ProfileDataResponse"]

export type ResumeUpdate = components["schemas"]["ResumeUpdate"]
export type ResumeResponse = components["schemas"]["ResumeResponse"]

export type DashboardSummary = components["schemas"]["DashboardSummary"]
export type StageAvg = components["schemas"]["StageAvg"]
export type StatusDistributionItem = components["schemas"]["StatusDistributionItem"]
export type RecentApplicationItem = components["schemas"]["RecentApplicationItem"]
export type PlatformRankingItem = components["schemas"]["PlatformRankingItem"]
export type HeatmapItem = components["schemas"]["HeatmapItem"]

export interface ApplicationFilters {
  status?: string
  stage?: string
  platform_id?: number
  company_id?: number
  archived?: boolean
}
