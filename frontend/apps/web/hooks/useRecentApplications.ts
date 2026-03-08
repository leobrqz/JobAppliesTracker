"use client"

import { useEffect, useState } from "react"
import { getRecentApplications } from "@/services/dashboard.service"
import type { RecentApplicationItem } from "@/types"

export function useRecentApplications() {
  const [data, setData] = useState<RecentApplicationItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    getRecentApplications().then((result) => {
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
