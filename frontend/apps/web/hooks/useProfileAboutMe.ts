"use client"

import { useCallback, useEffect, useState } from "react"
import { getProfileAboutMe } from "@/services/profile-about-me.service"
import type { ProfileAboutMeResponse } from "@/types"

export function useProfileAboutMe() {
  const [data, setData] = useState<ProfileAboutMeResponse | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    const result = await getProfileAboutMe()
    if (result.error !== null) setError(result.error)
    else setData(result.data)
    setIsLoading(false)
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  return { data, isLoading, error, refetch: fetchData }
}
