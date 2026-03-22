"use client"

import { useState } from "react"
import { toast } from "sonner"
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
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@workspace/ui/components/dialog"
import { Separator } from "@workspace/ui/components/separator"
import { AppointmentDialog } from "@/components/AppointmentDialog"
import { useAppointments } from "@/hooks/useAppointments"
import { formatTimeRange, type TimeFormat } from "@/lib/display"
import { usePreference } from "@/hooks/usePreference"
import { deleteAppointment } from "@/services/appointments.service"
import type { AppointmentResponse } from "@/types"

interface Props {
  applicationId: number
  applicationLabel: string
  open: boolean
  onOpenChange: (open: boolean) => void
  onRefresh?: () => void
}

export function AppointmentListDialog({
  applicationId,
  applicationLabel,
  open,
  onOpenChange,
  onRefresh,
}: Props) {
  const [locale] = usePreference<string>("display.locale", "en-US")
  const [timeFormat] = usePreference<TimeFormat>("display.timeFormat", "12h")
  const { data: appointments, isLoading, refetch } = useAppointments(
    open ? { application_id: applicationId } : undefined,
  )

  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [editingAppointment, setEditingAppointment] = useState<AppointmentResponse | null>(null)

  function handleNew() {
    setEditingAppointment(null)
    setEditDialogOpen(true)
  }

  function handleEdit(appt: AppointmentResponse) {
    setEditingAppointment(appt)
    setEditDialogOpen(true)
  }

  async function handleDelete(id: number) {
    const result = await deleteAppointment(id)
    if (result.error !== null) {
      toast.error(result.error)
    } else {
      toast.success("Appointment deleted")
      refetch()
      onRefresh?.()
    }
  }

  function handleEditSuccess() {
    refetch()
    onRefresh?.()
  }

  const sorted = [...appointments].sort((a, b) => a.starts_at.localeCompare(b.starts_at))
  const upcoming = sorted.filter((a) => new Date(a.starts_at) >= new Date())
  const past = sorted.filter((a) => new Date(a.starts_at) < new Date())

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              Appointments
              <Badge variant="secondary">{appointments.length}</Badge>
            </DialogTitle>
            <p className="text-sm text-muted-foreground truncate">{applicationLabel}</p>
          </DialogHeader>

          <div className="max-h-80 overflow-y-auto pr-1">
            {isLoading ? (
              <p className="py-6 text-center text-sm text-muted-foreground">Loading…</p>
            ) : appointments.length === 0 ? (
              <p className="py-6 text-center text-sm text-muted-foreground">
                No appointments yet.
              </p>
            ) : (
              <div className="flex flex-col gap-2">
                {upcoming.length > 0 && (
                  <>
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      Upcoming
                    </p>
                    {upcoming.map((appt) => (
                      <AppointmentCard
                        key={appt.id}
                        appointment={appt}
                        locale={locale}
                        timeFormat={timeFormat}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                      />
                    ))}
                  </>
                )}
                {past.length > 0 && (
                  <>
                    {upcoming.length > 0 && <Separator className="my-1" />}
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      Past
                    </p>
                    {past.map((appt) => (
                      <AppointmentCard
                        key={appt.id}
                        appointment={appt}
                        locale={locale}
                        timeFormat={timeFormat}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                        isPast
                      />
                    ))}
                  </>
                )}
              </div>
            )}
          </div>

          <Separator />

          <Button onClick={handleNew} className="w-full">
            New Appointment
          </Button>
        </DialogContent>
      </Dialog>

      <AppointmentDialog
        applicationId={applicationId}
        appointment={editingAppointment}
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        onSuccess={handleEditSuccess}
      />
    </>
  )
}

function AppointmentCard({
  appointment,
  locale,
  timeFormat,
  onEdit,
  onDelete,
  isPast,
}: {
  appointment: AppointmentResponse
  locale: string
  timeFormat: TimeFormat
  onEdit: (a: AppointmentResponse) => void
  onDelete: (id: number) => void
  isPast?: boolean
}) {
  return (
    <div
      className={`flex items-start justify-between gap-3 rounded-md border p-3 ${isPast ? "opacity-60" : ""}`}
    >
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="text-sm font-medium truncate">{appointment.title}</p>
          <Badge variant="outline" className="shrink-0 capitalize">
            {appointment.type}
          </Badge>
        </div>
        <p className="mt-1 text-xs text-muted-foreground">
          {formatTimeRange(appointment.starts_at, appointment.ends_at, locale, timeFormat)}
        </p>
        {appointment.platform && (
          <p className="text-xs text-muted-foreground">{appointment.platform}</p>
        )}
        {appointment.meeting_url && (
          <a
            href={appointment.meeting_url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-primary underline"
            onClick={(e) => e.stopPropagation()}
          >
            Meeting link
          </a>
        )}
        {appointment.notes && (
          <p className="mt-1 text-xs text-muted-foreground line-clamp-2">
            {appointment.notes}
          </p>
        )}
      </div>

      <div className="flex shrink-0 items-center gap-1">
        <Button variant="ghost" size="sm" onClick={() => onEdit(appointment)}>
          Edit
        </Button>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="text-destructive hover:text-destructive"
            >
              Delete
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete appointment?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. &quot;{appointment.title}&quot; will be permanently
                deleted.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={() => onDelete(appointment.id)}>
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  )
}
