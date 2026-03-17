"use client"

import { useCallback, useEffect, useState } from "react"
import { getApplications } from "@/services/applications.service"
import type { ApplicationFilters, ApplicationResponse } from "@/types"

export function useApplications(filters: ApplicationFilters = {}) {
  const [data, setData] = useState<ApplicationResponse[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    const result = await getApplications(filters)
    if (result.error !== null) {
      setError(result.error)
    } else {
      setData(result.data)
    }
    setIsLoading(false)
  }, [JSON.stringify(filters)]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    fetchData()
  }, [fetchData])

  return { data, isLoading, error, refetch: fetchData, setData }
}
