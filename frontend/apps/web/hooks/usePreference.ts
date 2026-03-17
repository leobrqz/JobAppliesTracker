"use client"

import { useEffect, useState } from "react"

export function usePreference<T>(key: string, defaultValue: T) {
  const [value, setValue] = useState<T>(defaultValue)

  useEffect(() => {
    if (typeof window === "undefined") return
    const stored = window.localStorage.getItem(key)
    if (stored !== null) {
      try {
        setValue(JSON.parse(stored) as T)
      } catch {
        // ignore parse errors and keep default
      }
    }
  }, [key])

  function update(next: T) {
    setValue(next)
    if (typeof window !== "undefined") {
      window.localStorage.setItem(key, JSON.stringify(next))
    }
  }

  return [value, update] as const
}

