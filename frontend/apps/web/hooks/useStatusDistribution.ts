"use client"

import { useEffect, useState } from "react"
import { getStatusDistribution } from "@/services/dashboard.service"
import type { StatusDistributionItem } from "@/types"

export function useStatusDistribution() {
  const [data, setData] = useState<StatusDistributionItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    getStatusDistribution().then((result) => {
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
