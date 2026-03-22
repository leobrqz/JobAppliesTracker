"use client"

import "temporal-polyfill/global"

import { useEffect, useMemo, useState } from "react"
import { useCalendarApp, ScheduleXCalendar } from "@schedule-x/react"
import { createViewMonthGrid, createViewMonthAgenda } from "@schedule-x/calendar"
import { createEventsServicePlugin } from "@schedule-x/events-service"
import "@schedule-x/theme-shadcn"
import { useTheme } from "next-themes"
import { toast } from "sonner"
import { ExternalLink, Pencil, Trash2 } from "lucide-react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@workspace/ui/components/alert-dialog"
import { Badge } from "@workspace/ui/components/badge"
import { Button } from "@workspace/ui/components/button"
import { Card, CardContent, CardHeader, CardTitle } from "@workspace/ui/components/card"
import { Separator } from "@workspace/ui/components/separator"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@workspace/ui/components/table"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@workspace/ui/components/tooltip"
import { createAppointmentScheduleXCustomComponents } from "@/components/schedule-x/appointment-event-views"
import { AppointmentDialog } from "@/components/AppointmentDialog"
import { useAppointments } from "@/hooks/useAppointments"
import { useApplications } from "@/hooks/useApplications"
import {
  APPOINTMENT_CALENDAR_COLORS,
  appointmentsToScheduleXEvents,
  getMonthRange,
  resolveTimeZone,
} from "@/lib/appointment-calendar"
import { formatDate, formatTimeRange, scheduleXTimeAxisFormatOptions, type TimeFormat } from "@/lib/display"
import { usePreference } from "@/hooks/usePreference"
import { deleteAppointment, getAppointment } from "@/services/appointments.service"
import type { AppointmentResponse } from "@/types"

type AppointmentEventsService = ReturnType<typeof createEventsServicePlugin>

type CalendarPageScheduleXProps = {
  timeZoneId: string
  locale: string
  timeFormat: TimeFormat
  isDark: boolean
  resolvedTheme: string | undefined
  eventsService: AppointmentEventsService
  onEventClick: (eventId: string) => void
  onCalendarRangeMonthChange: (monthStart: Date) => void
}

function CalendarPageScheduleX({
  timeZoneId,
  locale,
  timeFormat,
  isDark,
  resolvedTheme,
  eventsService,
  onEventClick,
  onCalendarRangeMonthChange,
}: CalendarPageScheduleXProps) {
  const customComponents = useMemo(
    () => createAppointmentScheduleXCustomComponents(locale, timeFormat),
    [locale, timeFormat],
  )

  const calendar = useCalendarApp({
    theme: "shadcn",
    isDark,
    locale,
    views: [createViewMonthGrid(), createViewMonthAgenda()],
    calendars: APPOINTMENT_CALENDAR_COLORS,
    timezone: timeZoneId,
    dayBoundaries: { start: "06:00", end: "22:00" },
    weekOptions: {
      timeAxisFormatOptions: scheduleXTimeAxisFormatOptions(timeFormat),
    },
    events: [],
    plugins: [eventsService],
    callbacks: {
      onEventClick(calendarEvent: { id: unknown }) {
        onEventClick(String(calendarEvent.id))
      },
      onRangeUpdate(newRange) {
        const start = newRange.start as unknown as Temporal.ZonedDateTime
        const mid = start.add({ days: 15 })
        onCalendarRangeMonthChange(new Date(mid.year, mid.month - 1, 1))
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

export default function CalendarPage() {
  const { resolvedTheme } = useTheme()
  const [timeZonePref] = usePreference<string>("display.timeZone", "auto")
  const [locale] = usePreference<string>("display.locale", "en-US")
  const [timeFormat] = usePreference<TimeFormat>("display.timeFormat", "12h")
  const timeZoneId = resolveTimeZone(timeZonePref)
  const [currentDate, setCurrentDate] = useState(() => new Date())
  const range = useMemo(() => getMonthRange(currentDate), [currentDate])
  const { data: appointments, refetch, setData } = useAppointments(range)
  const { data: applications } = useApplications()

  const appLookup = useMemo(() => {
    const map = new Map<number, string>()
    for (const app of applications) {
      const label = app.company ? `${app.job_title} — ${app.company}` : app.job_title
      map.set(app.id, label)
    }
    return map
  }, [applications])

  const [dialogOpen, setDialogOpen] = useState(false)
  const [selectedAppointment, setSelectedAppointment] = useState<AppointmentResponse | null>(null)

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

  function handleEdit(appointment: AppointmentResponse) {
    setSelectedAppointment(appointment)
    setDialogOpen(true)
  }

  function openCreate() {
    setSelectedAppointment(null)
    setDialogOpen(true)
  }

  async function handleDelete(id: number) {
    setData((current) => current.filter((appt) => appt.id !== id))
    const result = await deleteAppointment(id)
    if (result.error !== null) {
      toast.error(result.error)
      refetch()
    } else {
      toast.success("Appointment deleted")
      refetch()
    }
  }

  function handleSuccess() {
    refetch()
  }

  const sortedAppointments = useMemo(
    () => [...appointments].sort((a, b) => a.starts_at.localeCompare(b.starts_at)),
    [appointments],
  )

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold">Calendar</h1>
        <div className="flex justify-end">
          <Button onClick={openCreate}>New Appointment</Button>
        </div>
      </div>

      <div className="sx-calendar-page-wrapper" style={{ isolation: "isolate" }}>
        <CalendarPageScheduleX
          key={`${locale}-${timeFormat}-${timeZoneId}`}
          timeZoneId={timeZoneId}
          locale={locale}
          timeFormat={timeFormat}
          isDark={isDark}
          resolvedTheme={resolvedTheme}
          eventsService={eventsService}
          onEventClick={handleEventClick}
          onCalendarRangeMonthChange={setCurrentDate}
        />
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div className="flex items-center gap-2">
            <CardTitle className="text-base font-medium">Appointments</CardTitle>
            <Badge variant="secondary">{sortedAppointments.length}</Badge>
          </div>
        </CardHeader>
        <Separator />
        <CardContent className="pt-4">
          {sortedAppointments.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              No appointments this month.
            </p>
          ) : (
            <TooltipProvider>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Time</TableHead>
                      <TableHead>Title</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Platform</TableHead>
                      <TableHead>Application</TableHead>
                      <TableHead className="w-[120px] text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sortedAppointments.map((appt) => (
                      <TableRow key={appt.id}>
                        <TableCell className="whitespace-nowrap">
                          {formatDate(appt.starts_at, locale)}
                        </TableCell>
                        <TableCell className="whitespace-nowrap text-muted-foreground">
                          {formatTimeRange(appt.starts_at, appt.ends_at, locale, timeFormat)}
                        </TableCell>
                        <TableCell className="font-medium">{appt.title}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="capitalize">
                            {appt.type}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {appt.platform ?? "—"}
                        </TableCell>
                        <TableCell>
                          {appt.application_id != null ? (
                            <span className="text-sm">
                              {appLookup.get(appt.application_id) ?? `#${appt.application_id}`}
                            </span>
                          ) : (
                            <span className="text-sm text-muted-foreground">Standalone</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            {appt.meeting_url && (
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button variant="ghost" size="sm" asChild>
                                    <a
                                      href={appt.meeting_url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                    >
                                      <ExternalLink data-icon="inline-start" />
                                    </a>
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>Open meeting link</TooltipContent>
                              </Tooltip>
                            )}
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleEdit(appt)}
                                >
                                  <Pencil data-icon="inline-start" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Edit</TooltipContent>
                            </Tooltip>
                            <AlertDialog>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <AlertDialogTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="text-destructive hover:text-destructive"
                                    >
                                      <Trash2 data-icon="inline-start" />
                                    </Button>
                                  </AlertDialogTrigger>
                                </TooltipTrigger>
                                <TooltipContent>Delete</TooltipContent>
                              </Tooltip>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Delete appointment?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    This action cannot be undone. &quot;{appt.title}&quot; will be
                                    permanently deleted.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => handleDelete(appt.id)}>
                                    Delete
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </TooltipProvider>
          )}
        </CardContent>
      </Card>

      <AppointmentDialog
        appointment={selectedAppointment}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSuccess={handleSuccess}
      />
    </div>
  )
}
