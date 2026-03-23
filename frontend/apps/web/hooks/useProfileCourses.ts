"use client"

import { useCallback, useEffect, useState } from "react"
import { getProfileCourses } from "@/services/profile-courses.service"
import type { CourseEntryResponse } from "@/types"

export function useProfileCourses() {
  const [data, setData] = useState<CourseEntryResponse[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    const result = await getProfileCourses()
    if (result.error !== null) setError(result.error)
    else setData(result.data)
    setIsLoading(false)
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  return { data, isLoading, error, refetch: fetchData }
}
