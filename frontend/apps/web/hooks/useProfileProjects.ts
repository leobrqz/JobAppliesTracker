"use client"

import { useCallback, useEffect, useState } from "react"
import { getAllProfileProjects } from "@/services/profile-projects.service"
import type { ProjectEntryResponse } from "@/types"

export function useProfileProjects() {
  const [data, setData] = useState<ProjectEntryResponse[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    const result = await getAllProfileProjects()
    if (result.error !== null) {
      setError(result.error)
    } else {
      setData(result.data)
    }
    setIsLoading(false)
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  return { data, isLoading, error, refetch: fetchData }
}
