import { apiRequest, type ApiResult } from "./api-client"
import type { PlatformTemplateResponse } from "@/types"

export function getPlatformTemplates(): Promise<ApiResult<PlatformTemplateResponse[]>> {
  return apiRequest<PlatformTemplateResponse[]>("/api/platform-templates/")
}
