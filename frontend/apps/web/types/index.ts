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

export type ExperienceEntryCreate = components["schemas"]["ExperienceEntryCreate"]
export type ExperienceEntryUpdate = components["schemas"]["ExperienceEntryUpdate"]
export type ExperienceEntryResponse = components["schemas"]["ExperienceEntryResponse"]
export type ExperienceBulletCreate = components["schemas"]["ExperienceBulletCreate"]
export type ExperienceBulletUpdate = components["schemas"]["ExperienceBulletUpdate"]
export type ExperienceBulletResponse = components["schemas"]["ExperienceBulletResponse"]
export type ExperienceReorderItem = components["schemas"]["ExperienceReorderItem"]

export type EducationEntryCreate = components["schemas"]["EducationEntryCreate"]
export type EducationEntryUpdate = components["schemas"]["EducationEntryUpdate"]
export type EducationEntryResponse = components["schemas"]["EducationEntryResponse"]
export type EducationHighlightCreate = components["schemas"]["EducationHighlightCreate"]
export type EducationHighlightUpdate = components["schemas"]["EducationHighlightUpdate"]
export type EducationHighlightResponse = components["schemas"]["EducationHighlightResponse"]
export type EducationReorderItem = components["schemas"]["EducationReorderItem"]

export type ProjectEntryCreate = components["schemas"]["ProjectEntryCreate"]
export type ProjectEntryUpdate = components["schemas"]["ProjectEntryUpdate"]
export type ProjectEntryResponse = components["schemas"]["ProjectEntryResponse"]
export type ProjectBulletCreate = components["schemas"]["ProjectBulletCreate"]
export type ProjectBulletUpdate = components["schemas"]["ProjectBulletUpdate"]
export type ProjectBulletResponse = components["schemas"]["ProjectBulletResponse"]
export type ProjectReorderItem = components["schemas"]["ProjectReorderItem"]

export type SkillGroupCreate = components["schemas"]["SkillGroupCreate"]
export type SkillGroupUpdate = components["schemas"]["SkillGroupUpdate"]
export type SkillGroupResponse = components["schemas"]["SkillGroupResponse"]
export type SkillItemCreate = components["schemas"]["SkillItemCreate"]
export type SkillItemUpdate = components["schemas"]["SkillItemUpdate"]
export type SkillItemResponse = components["schemas"]["SkillItemResponse"]
export type SkillReorderItem = components["schemas"]["SkillReorderItem"]

export type CertificationEntryCreate = components["schemas"]["CertificationEntryCreate"]
export type CertificationEntryUpdate = components["schemas"]["CertificationEntryUpdate"]
export type CertificationEntryResponse = components["schemas"]["CertificationEntryResponse"]
export type CertificationReorderItem = components["schemas"]["CertificationReorderItem"]

export type CourseEntryCreate = components["schemas"]["CourseEntryCreate"]
export type CourseEntryUpdate = components["schemas"]["CourseEntryUpdate"]
export type CourseEntryResponse = components["schemas"]["CourseEntryResponse"]
export type CourseReorderItem = components["schemas"]["CourseReorderItem"]

export type ProfileAboutMeUpdate = components["schemas"]["ProfileAboutMeUpdate"]
export type ProfileAboutMeResponse = components["schemas"]["ProfileAboutMeResponse"]

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
