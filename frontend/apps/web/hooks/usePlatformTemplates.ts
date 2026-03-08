"use client"

import { useCallback, useEffect, useState } from "react"
import { getPlatformTemplates } from "@/services/platform-templates.service"
import type { PlatformTemplateResponse } from "@/types"

export function usePlatformTemplates() {
  const [data, setData] = useState<PlatformTemplateResponse[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    const result = await getPlatformTemplates()
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
