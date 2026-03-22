import "temporal-polyfill/global"

import type { AppointmentResponse } from "@/types"

export const APPOINTMENT_CALENDAR_COLORS = {
  interview: {
    colorName: "interview",
    lightColors: { main: "#4f46e5", container: "#e0e7ff", onContainer: "#3730a3" },
    darkColors: { main: "#818cf8", container: "#312e81", onContainer: "#c7d2fe" },
  },
  assessment: {
    colorName: "assessment",
    lightColors: { main: "#d97706", container: "#fef3c7", onContainer: "#92400e" },
    darkColors: { main: "#fbbf24", container: "#78350f", onContainer: "#fde68a" },
  },
  project: {
    colorName: "project",
    lightColors: { main: "#0d9488", container: "#ccfbf1", onContainer: "#115e59" },
    darkColors: { main: "#2dd4bf", container: "#134e4a", onContainer: "#99f6e4" },
  },
  meeting: {
    colorName: "meeting",
    lightColors: { main: "#7c3aed", container: "#ede9fe", onContainer: "#5b21b6" },
    darkColors: { main: "#a78bfa", container: "#4c1d95", onContainer: "#ddd6fe" },
  },
  other: {
    colorName: "other",
    lightColors: { main: "#64748b", container: "#f1f5f9", onContainer: "#334155" },
    darkColors: { main: "#94a3b8", container: "#1e293b", onContainer: "#cbd5e1" },
  },
} as const

export function resolveTimeZone(pref: string | undefined): string {
  if (pref && pref !== "auto") return pref
  return Temporal.Now.timeZoneId()
}

export function isoToZonedDateTime(iso: string, timeZoneId: string): Temporal.ZonedDateTime {
  let cleaned = iso
  if (cleaned.endsWith("Z")) cleaned = cleaned.slice(0, -1)
  const plusIdx = cleaned.indexOf("+")
  if (plusIdx !== -1) cleaned = cleaned.slice(0, plusIdx)
  return Temporal.PlainDateTime.from(cleaned).toZonedDateTime(timeZoneId)
}

export function appointmentsToScheduleXEvents(
  appointments: AppointmentResponse[],
  timeZoneId: string,
) {
  return appointments.map((a) => ({
    id: String(a.id),
    title: a.title,
    start: isoToZonedDateTime(a.starts_at, timeZoneId),
    end: a.ends_at
      ? isoToZonedDateTime(a.ends_at, timeZoneId)
      : isoToZonedDateTime(a.starts_at, timeZoneId).add({ hours: 1 }),
    calendarId: APPOINTMENT_CALENDAR_COLORS[a.type as keyof typeof APPOINTMENT_CALENDAR_COLORS]
      ? a.type
      : "other",
  }))
}

export function formatLocalDateTime(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")
  const hours = String(date.getHours()).padStart(2, "0")
  const minutes = String(date.getMinutes()).padStart(2, "0")
  const seconds = String(date.getSeconds()).padStart(2, "0")
  return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`
}

export function getMonthRange(date: Date): { start: string; end: string } {
  const y = date.getFullYear()
  const m = date.getMonth()
  const first = new Date(y, m, 1, 0, 0, 0, 0)
  const last = new Date(y, m + 1, 0, 23, 59, 59, 999)
  return { start: formatLocalDateTime(first), end: formatLocalDateTime(last) }
}
