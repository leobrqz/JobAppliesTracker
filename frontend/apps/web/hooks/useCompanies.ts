"use client"

import { useCallback, useEffect, useState } from "react"
import { getCompanies } from "@/services/companies.service"
import type { CompanyResponse } from "@/types"

export function useCompanies() {
  const [data, setData] = useState<CompanyResponse[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    const result = await getCompanies()
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
