"use client"

import { useCallback, useEffect, useState } from "react"
import { getResumes } from "@/services/resumes.service"
import type { ResumeResponse } from "@/types"

export function useResumeMap() {
  const [map, setMap] = useState<Record<number, ResumeResponse>>({})
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    const [active, archived] = await Promise.all([getResumes(false), getResumes(true)])
    if (active.error !== null) {
      setError(active.error)
      setMap({})
      setIsLoading(false)
      return
    }
    if (archived.error !== null) {
      setError(archived.error)
      setMap({})
      setIsLoading(false)
      return
    }
    const merged: Record<number, ResumeResponse> = {}
    for (const r of archived.data) {
      merged[r.id] = r
    }
    for (const r of active.data) {
      merged[r.id] = r
    }
    setMap(merged)
    setIsLoading(false)
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  return { map, isLoading, error, refetch: fetchData }
}
