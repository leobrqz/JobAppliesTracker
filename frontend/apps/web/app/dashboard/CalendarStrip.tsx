"use client"

import "temporal-polyfill/global"

import { useEffect, useMemo, useState } from "react"
import { useCalendarApp, ScheduleXCalendar } from "@schedule-x/react"
import { createViewWeek } from "@schedule-x/calendar"
import { createEventsServicePlugin } from "@schedule-x/events-service"
import "@schedule-x/theme-shadcn"
import { useTheme } from "next-themes"
import { Button } from "@workspace/ui/components/button"
import { Card, CardContent, CardHeader, CardTitle } from "@workspace/ui/components/card"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@workspace/ui/components/collapsible"
import { ChevronDown, ChevronUp } from "lucide-react"
import { createAppointmentScheduleXCustomComponents } from "@/components/schedule-x/appointment-event-views"
import { AppointmentDialog } from "@/components/AppointmentDialog"
import { usePreference } from "@/hooks/usePreference"
import { useAppointments } from "@/hooks/useAppointments"
import {
  APPOINTMENT_CALENDAR_COLORS,
  appointmentsToScheduleXEvents,
  resolveTimeZone,
} from "@/lib/appointment-calendar"
import { scheduleXTimeAxisFormatOptions, type TimeFormat } from "@/lib/display"
import { getAppointment } from "@/services/appointments.service"
import type { AppointmentResponse } from "@/types"

type AppointmentEventsService = ReturnType<typeof createEventsServicePlugin>

type CalendarStripScheduleXProps = {
  timeZoneId: string
  locale: string
  timeFormat: TimeFormat
  isDark: boolean
  resolvedTheme: string | undefined
  eventsService: AppointmentEventsService
  onEventClick: (eventId: string) => void
}

function CalendarStripScheduleX({
  timeZoneId,
  locale,
  timeFormat,
  isDark,
  resolvedTheme,
  eventsService,
  onEventClick,
}: CalendarStripScheduleXProps) {
  const customComponents = useMemo(
    () => createAppointmentScheduleXCustomComponents(locale, timeFormat),
    [locale, timeFormat],
  )

  const calendar = useCalendarApp({
    theme: "shadcn",
    isDark,
    locale,
    views: [createViewWeek()],
    calendars: APPOINTMENT_CALENDAR_COLORS,
    timezone: timeZoneId,
    weekOptions: {
      gridHeight: 2000,
      nDays: 7,
      timeAxisFormatOptions: scheduleXTimeAxisFormatOptions(timeFormat),
    },
    events: [],
    plugins: [eventsService],
    callbacks: {
      onEventClick(calendarEvent: { id: unknown }) {
        onEventClick(String(calendarEvent.id))
      },
    },
  })

  useEffect(() => {
    if (!calendar) return
    if (resolvedTheme === "light" || resolvedTheme === "dark") {
      calendar.setTheme(resolvedTheme)
    }
  }, [calendar, resolvedTheme])

  return <ScheduleXCalendar calendarApp={calendar} customComponents={customComponents} />
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
  const { resolvedTheme } = useTheme()
  const [timeZonePref] = usePreference<string>("display.timeZone", "auto")
  const [locale] = usePreference<string>("display.locale", "en-US")
  const [timeFormat] = usePreference<TimeFormat>("display.timeFormat", "12h")
  const timeZoneId = resolveTimeZone(timeZonePref)
  const range = useMemo(() => getWeekRange(), [])
  const { data: appointments, refetch } = useAppointments(range)

  const [open, setOpen] = usePreference<boolean>("dashboard-calendar-strip-expanded", true)

  const [dialogOpen, setDialogOpen] = useState(false)
  const [selectedAppointment, setSelectedAppointment] = useState<AppointmentResponse | null>(null)

  function handleOpenChange(next: boolean) {
    setOpen(next)
  }

  const [eventsService] = useState(() => createEventsServicePlugin())

  const isDark = resolvedTheme === "dark"

  useEffect(() => {
    eventsService.set(appointmentsToScheduleXEvents(appointments, timeZoneId))
  }, [appointments, eventsService, timeZoneId])

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
      <Collapsible open={open} onOpenChange={handleOpenChange}>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div className="flex items-center gap-2">
            <CollapsibleTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                aria-label={open ? "Collapse calendar" : "Expand calendar"}
              >
                {open ? (
                  <ChevronUp data-icon="inline-start" />
                ) : (
                  <ChevronDown data-icon="inline-start" />
                )}
              </Button>
            </CollapsibleTrigger>
            <CardTitle className="text-base font-medium">This Week</CardTitle>
          </div>
          <Button size="sm" onClick={openCreate}>
            New Appointment
          </Button>
        </CardHeader>
        <CollapsibleContent>
          <CardContent>
            <div className="sx-calendar-strip-wrapper" style={{ isolation: "isolate" }}>
              <CalendarStripScheduleX
                key={`${locale}-${timeFormat}-${timeZoneId}`}
                timeZoneId={timeZoneId}
                locale={locale}
                timeFormat={timeFormat}
                isDark={isDark}
                resolvedTheme={resolvedTheme}
                eventsService={eventsService}
                onEventClick={handleEventClick}
              />
            </div>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
      <AppointmentDialog
        appointment={selectedAppointment}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSuccess={handleSuccess}
      />
    </Card>
  )
}
