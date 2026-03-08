"use client"

import { useCallback, useEffect, useState } from "react"
import { getAllProfileData } from "@/services/profile-data.service"
import type { ProfileDataResponse } from "@/types"

export function useProfileData() {
  const [data, setData] = useState<ProfileDataResponse[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    const result = await getAllProfileData()
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
