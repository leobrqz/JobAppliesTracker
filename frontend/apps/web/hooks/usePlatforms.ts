"use client"

import { useCallback, useEffect, useState } from "react"
import { getJobPlatforms } from "@/services/platforms.service"
import type { JobPlatformResponse } from "@/types"

export function usePlatforms() {
  const [data, setData] = useState<JobPlatformResponse[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    const result = await getJobPlatforms()
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
