"use client"

import { useCallback, useEffect, useState } from "react"
import { getAppointments, type AppointmentParams } from "@/services/appointments.service"
import type { AppointmentResponse } from "@/types"

export function useAppointments(params?: AppointmentParams) {
  const [data, setData] = useState<AppointmentResponse[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    const result = await getAppointments(params)
    if (result.error !== null) {
      setError(result.error)
    } else {
      setData(result.data)
    }
    setIsLoading(false)
  }, [JSON.stringify(params)]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    fetchData()
  }, [fetchData])

  return { data, isLoading, error, refetch: fetchData, setData }
}
