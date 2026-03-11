"use client"

import "temporal-polyfill/global"
import { useEffect, useMemo, useState } from "react"
import { useCalendarApp, ScheduleXCalendar } from "@schedule-x/react"
import { createViewWeek } from "@schedule-x/calendar"
import { createEventsServicePlugin } from "@schedule-x/events-service"
import "@schedule-x/theme-default/dist/index.css"
import { Button } from "@workspace/ui/components/button"
import { Card, CardContent, CardHeader, CardTitle } from "@workspace/ui/components/card"
import { AppointmentDialog } from "@/components/AppointmentDialog"
import { useAppointments } from "@/hooks/useAppointments"
import { getAppointment } from "@/services/appointments.service"
import type { AppointmentResponse } from "@/types"

const CALENDAR_COLORS = {
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
}

function getLocalTZ(): string {
  return Temporal.Now.timeZoneId()
}

function isoToZonedDateTime(iso: string): Temporal.ZonedDateTime {
  let cleaned = iso
  if (cleaned.endsWith("Z")) cleaned = cleaned.slice(0, -1)
  const plusIdx = cleaned.indexOf("+")
  if (plusIdx !== -1) cleaned = cleaned.slice(0, plusIdx)
  return Temporal.PlainDateTime.from(cleaned).toZonedDateTime(getLocalTZ())
}

function toEvents(appointments: AppointmentResponse[]) {
  return appointments.map((a) => ({
    id: String(a.id),
    title: a.title,
    start: isoToZonedDateTime(a.starts_at),
    end: a.ends_at
      ? isoToZonedDateTime(a.ends_at)
      : isoToZonedDateTime(a.starts_at).add({ hours: 1 }),
    calendarId: CALENDAR_COLORS[a.type as keyof typeof CALENDAR_COLORS] ? a.type : "other",
  }))
}

function getWeekRange(): { start: string; end: string } {
  const now = new Date()
  const dayOfWeek = now.getDay()
  const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek
  const monday = new Date(now)
  monday.setDate(now.getDate() + diff)
  monday.setHours(0, 0, 0, 0)
  const sunday = new Date(monday)
  sunday.setDate(monday.getDate() + 6)
  sunday.setHours(23, 59, 59, 999)
  return { start: monday.toISOString(), end: sunday.toISOString() }
}

export function CalendarStrip() {
  const range = useMemo(() => getWeekRange(), [])
  const { data: appointments, refetch } = useAppointments(range)

  const [dialogOpen, setDialogOpen] = useState(false)
  const [selectedAppointment, setSelectedAppointment] = useState<AppointmentResponse | null>(null)

  const [eventsService] = useState(() => createEventsServicePlugin())

  const calendar = useCalendarApp({
    views: [createViewWeek()],
    calendars: CALENDAR_COLORS,
    timezone: getLocalTZ(),
    weekOptions: { gridHeight: 2000, nDays: 7 },
    events: [],
    plugins: [eventsService],
    callbacks: {
      onEventClick(calendarEvent) {
        handleEventClick(calendarEvent.id as string)
      },
    },
  })

  useEffect(() => {
    eventsService.set(toEvents(appointments))
  }, [appointments, eventsService])

  async function handleEventClick(eventId: string) {
    const result = await getAppointment(Number(eventId))
    if (result.error !== null) return
    setSelectedAppointment(result.data)
    setDialogOpen(true)
  }

  function openCreate() {
    setSelectedAppointment(null)
    setDialogOpen(true)
  }

  function handleSuccess() {
    refetch()
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-base font-medium">This Week</CardTitle>
        <Button variant="outline" size="sm" onClick={openCreate}>
          New Appointment
        </Button>
      </CardHeader>
      <CardContent>
        <div className="sx-calendar-strip-wrapper" style={{ isolation: "isolate" }}>
          <ScheduleXCalendar calendarApp={calendar} />
        </div>
      </CardContent>
      <AppointmentDialog
        appointment={selectedAppointment}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSuccess={handleSuccess}
      />
    </Card>
  )
}
