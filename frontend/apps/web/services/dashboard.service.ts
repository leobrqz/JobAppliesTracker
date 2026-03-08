import { apiRequest, type ApiResult } from "./api-client"
import type {
  DashboardSummary,
  HeatmapItem,
  PlatformRankingItem,
  RecentApplicationItem,
  StatusDistributionItem,
} from "@/types"

export function getDashboardSummary(): Promise<ApiResult<DashboardSummary>> {
  return apiRequest<DashboardSummary>("/api/dashboard/summary")
}

export function getStatusDistribution(): Promise<ApiResult<StatusDistributionItem[]>> {
  return apiRequest<StatusDistributionItem[]>("/api/dashboard/status-distribution")
}

export function getRecentApplications(): Promise<ApiResult<RecentApplicationItem[]>> {
  return apiRequest<RecentApplicationItem[]>("/api/dashboard/recent-applications")
}

export function getPlatformRanking(): Promise<ApiResult<PlatformRankingItem[]>> {
  return apiRequest<PlatformRankingItem[]>("/api/dashboard/platform-ranking")
}

export function getHeatmap(): Promise<ApiResult<HeatmapItem[]>> {
  return apiRequest<HeatmapItem[]>("/api/dashboard/heatmap")
}
