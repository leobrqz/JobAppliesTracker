"use client"

import { useEffect, useState } from "react"
import { getPlatformRanking } from "@/services/dashboard.service"
import type { PlatformRankingItem } from "@/types"

export function usePlatformRanking() {
  const [data, setData] = useState<PlatformRankingItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    getPlatformRanking().then((result) => {
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
