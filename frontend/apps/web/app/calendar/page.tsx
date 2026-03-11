"use client"

import "temporal-polyfill/global"
import { useEffect, useMemo, useState } from "react"
import { useCalendarApp, ScheduleXCalendar } from "@schedule-x/react"
import { createViewMonthGrid, createViewMonthAgenda } from "@schedule-x/calendar"
import { createEventsServicePlugin } from "@schedule-x/events-service"
import "@schedule-x/theme-default/dist/index.css"
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
import { AppointmentDialog } from "@/components/AppointmentDialog"
import { useAppointments } from "@/hooks/useAppointments"
import { useApplications } from "@/hooks/useApplications"
import { deleteAppointment, getAppointment } from "@/services/appointments.service"
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

function getMonthRange(date: Date): { start: string; end: string } {
  const y = date.getFullYear()
  const m = date.getMonth()
  const first = new Date(y, m, 1)
  const last = new Date(y, m + 1, 0, 23, 59, 59)
  return { start: first.toISOString(), end: last.toISOString() }
}

function formatDate(iso: string): string {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  }).format(new Date(iso))
}

function formatTime(iso: string): string {
  return new Intl.DateTimeFormat("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso))
}

function formatTimeRange(startsAt: string, endsAt: string | null): string {
  const start = formatTime(startsAt)
  if (!endsAt) return start
  return `${start} – ${formatTime(endsAt)}`
}

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(() => new Date())
  const range = useMemo(() => getMonthRange(currentDate), [currentDate])
  const { data: appointments, refetch } = useAppointments(range)
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

  const calendar = useCalendarApp({
    views: [createViewMonthGrid(), createViewMonthAgenda()],
    calendars: CALENDAR_COLORS,
    timezone: getLocalTZ(),
    dayBoundaries: { start: "06:00", end: "22:00" },
    events: [],
    plugins: [eventsService],
    callbacks: {
      onEventClick(calendarEvent) {
        handleEventClick(calendarEvent.id as string)
      },
      onRangeUpdate(newRange) {
        const start = newRange.start as unknown as Temporal.ZonedDateTime
        const mid = start.add({ days: 15 })
        setCurrentDate(new Date(mid.year, mid.month - 1, 1))
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

  function handleEdit(appointment: AppointmentResponse) {
    setSelectedAppointment(appointment)
    setDialogOpen(true)
  }

  function openCreate() {
    setSelectedAppointment(null)
    setDialogOpen(true)
  }

  async function handleDelete(id: number) {
    const result = await deleteAppointment(id)
    if (result.error !== null) {
      toast.error(result.error)
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
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Calendar</h1>
        <Button onClick={openCreate}>New Appointment</Button>
      </div>

      <div className="sx-calendar-page-wrapper" style={{ isolation: "isolate" }}>
        <ScheduleXCalendar calendarApp={calendar} />
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
                          {formatDate(appt.starts_at)}
                        </TableCell>
                        <TableCell className="whitespace-nowrap text-muted-foreground">
                          {formatTimeRange(appt.starts_at, appt.ends_at)}
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
