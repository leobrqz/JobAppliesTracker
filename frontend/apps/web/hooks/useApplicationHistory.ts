"use client"

import { useCallback, useEffect, useState } from "react"
import { getApplicationHistory } from "@/services/applications.service"
import type { ApplicationHistoryResponse } from "@/types"

export function useApplicationHistory(applicationId: number | null) {
  const [data, setData] = useState<ApplicationHistoryResponse[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    if (applicationId === null) return
    setIsLoading(true)
    setError(null)
    const result = await getApplicationHistory(applicationId)
    if (result.error !== null) {
      setError(result.error)
    } else {
      setData(result.data)
    }
    setIsLoading(false)
  }, [applicationId])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  return { data, isLoading, error, refetch: fetchData }
}
