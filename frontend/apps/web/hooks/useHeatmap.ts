"use client"

import { useEffect, useState } from "react"
import { getHeatmap } from "@/services/dashboard.service"
import type { HeatmapItem } from "@/types"

export function useHeatmap() {
  const [data, setData] = useState<HeatmapItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    getHeatmap().then((result) => {
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
