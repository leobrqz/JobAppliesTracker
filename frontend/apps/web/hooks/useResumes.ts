"use client"

import { useCallback, useEffect, useState } from "react"
import { getResumes } from "@/services/resumes.service"
import type { ResumeResponse } from "@/types"

export function useResumes(archived = false) {
  const [data, setData] = useState<ResumeResponse[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    const result = await getResumes(archived)
    if (result.error !== null) {
      setError(result.error)
    } else {
      setData(result.data)
    }
    setIsLoading(false)
  }, [archived])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  return { data, isLoading, error, refetch: fetchData }
}
