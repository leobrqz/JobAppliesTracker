"use client"

import { useCallback, useEffect, useState } from "react"
import { getAllProfileExperience } from "@/services/profile-experience.service"
import type { ExperienceEntryResponse } from "@/types"

export function useProfileExperience() {
  const [data, setData] = useState<ExperienceEntryResponse[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    const result = await getAllProfileExperience()
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
