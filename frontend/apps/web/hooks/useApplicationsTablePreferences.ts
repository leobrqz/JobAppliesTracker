"use client"

import { useMemo } from "react"
import { usePreference } from "@/hooks/usePreference"

export type ApplicationsTablePreferences = {
  showResumeColumn: boolean
  showSalaryColumn: boolean
  showSeniorityColumn: boolean
  showCreatedAtColumn: boolean
  compactDensity: boolean
}

export const defaultApplicationsTablePreferences: ApplicationsTablePreferences = {
  showResumeColumn: false,
  showSalaryColumn: false,
  showSeniorityColumn: false,
  showCreatedAtColumn: false,
  compactDensity: false,
}

const STORAGE_KEY = "applications.tablePreferences"

export function useApplicationsTablePreferences() {
  const [stored, setStored] = usePreference<ApplicationsTablePreferences>(
    STORAGE_KEY,
    defaultApplicationsTablePreferences,
  )
  const prefs = useMemo(
    () => ({ ...defaultApplicationsTablePreferences, ...stored }),
    [stored],
  )
  function setPrefs(next: ApplicationsTablePreferences) {
    setStored(next)
  }
  return [prefs, setPrefs] as const
}
