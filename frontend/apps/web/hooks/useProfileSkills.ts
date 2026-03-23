"use client"

import { useCallback, useEffect, useState } from "react"
import { getAllProfileSkills } from "@/services/profile-skills.service"
import type { SkillGroupResponse } from "@/types"

export function useProfileSkills() {
  const [data, setData] = useState<SkillGroupResponse[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    const result = await getAllProfileSkills()
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
