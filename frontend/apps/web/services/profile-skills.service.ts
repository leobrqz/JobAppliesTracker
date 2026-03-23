import { apiRequest, type ApiResult } from "./api-client"
import type {
  SkillGroupCreate,
  SkillGroupResponse,
  SkillGroupUpdate,
  SkillItemCreate,
  SkillItemResponse,
  SkillItemUpdate,
  SkillReorderItem,
} from "@/types"

export function getAllProfileSkills(): Promise<ApiResult<SkillGroupResponse[]>> {
  return apiRequest<SkillGroupResponse[]>("/api/profile-skills/")
}

export function createProfileSkillGroup(data: SkillGroupCreate): Promise<ApiResult<SkillGroupResponse>> {
  return apiRequest<SkillGroupResponse>("/api/profile-skills/", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })
}

export function updateProfileSkillGroup(id: number, data: SkillGroupUpdate): Promise<ApiResult<SkillGroupResponse>> {
  return apiRequest<SkillGroupResponse>(`/api/profile-skills/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })
}

export function deleteProfileSkillGroup(id: number): Promise<ApiResult<null>> {
  return apiRequest<null>(`/api/profile-skills/${id}`, { method: "DELETE" })
}

export function reorderProfileSkillGroups(items: SkillReorderItem[]): Promise<ApiResult<SkillGroupResponse[]>> {
  return apiRequest<SkillGroupResponse[]>("/api/profile-skills/reorder", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(items),
  })
}

export function createProfileSkillItem(groupId: number, data: SkillItemCreate): Promise<ApiResult<SkillItemResponse>> {
  return apiRequest<SkillItemResponse>(`/api/profile-skills/${groupId}/items`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })
}

export function updateProfileSkillItem(itemId: number, data: SkillItemUpdate): Promise<ApiResult<SkillItemResponse>> {
  return apiRequest<SkillItemResponse>(`/api/profile-skills/items/${itemId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })
}

export function deleteProfileSkillItem(itemId: number): Promise<ApiResult<null>> {
  return apiRequest<null>(`/api/profile-skills/items/${itemId}`, { method: "DELETE" })
}

export function reorderProfileSkillItems(
  groupId: number,
  items: SkillReorderItem[],
): Promise<ApiResult<SkillItemResponse[]>> {
  return apiRequest<SkillItemResponse[]>(`/api/profile-skills/${groupId}/items/reorder`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(items),
  })
}
