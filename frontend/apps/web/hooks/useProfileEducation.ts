"use client"

import { useCallback, useEffect, useState } from "react"
import { getAllProfileEducation } from "@/services/profile-education.service"
import type { EducationEntryResponse } from "@/types"

export function useProfileEducation() {
  const [data, setData] = useState<EducationEntryResponse[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    const result = await getAllProfileEducation()
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
