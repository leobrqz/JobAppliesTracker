"use client"

import { usePreference } from "@/hooks/usePreference"

export type DashboardWidgets = {
  showSummary: boolean
  showCalendarStrip: boolean
  showStatusDistribution: boolean
  showRecentApplications: boolean
  showPlatformRanking: boolean
  showWeeklyHeatmap: boolean
}

export const defaultDashboardWidgets: DashboardWidgets = {
  showSummary: true,
  showCalendarStrip: true,
  showStatusDistribution: true,
  showRecentApplications: true,
  showPlatformRanking: true,
  showWeeklyHeatmap: true,
}

export function useDashboardWidgets() {
  return usePreference<DashboardWidgets>("dashboard.widgets", defaultDashboardWidgets)
}

