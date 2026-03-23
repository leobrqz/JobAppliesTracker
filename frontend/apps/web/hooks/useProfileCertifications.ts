"use client"

import { useCallback, useEffect, useState } from "react"
import { getProfileCertifications } from "@/services/profile-certifications.service"
import type { CertificationEntryResponse } from "@/types"

export function useProfileCertifications() {
  const [data, setData] = useState<CertificationEntryResponse[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    const result = await getProfileCertifications()
    if (result.error !== null) setError(result.error)
    else setData(result.data)
    setIsLoading(false)
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  return { data, isLoading, error, refetch: fetchData }
}
