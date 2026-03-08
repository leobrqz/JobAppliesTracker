"use client"

import { useEffect, useState } from "react"
import { getDashboardSummary } from "@/services/dashboard.service"
import type { DashboardSummary } from "@/types"

export function useDashboardSummary() {
  const [data, setData] = useState<DashboardSummary | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    getDashboardSummary().then((result) => {
      if (result.error !== null) {
        setError(result.error)
      } else {
        setData(result.data)
      }
      setIsLoading(false)
    })
  }, [])

  return { data, isLoading, error }
}
