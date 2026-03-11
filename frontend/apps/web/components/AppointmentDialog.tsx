"use client"

import { useEffect } from "react"
import { useForm } from "react-hook-form"
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
import { Button } from "@workspace/ui/components/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@workspace/ui/components/dialog"
import { Input } from "@workspace/ui/components/input"
import { Label } from "@workspace/ui/components/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@workspace/ui/components/select"
import { Textarea } from "@workspace/ui/components/textarea"
import { createAppointment, updateAppointment, deleteAppointment } from "@/services/appointments.service"
import type { AppointmentResponse } from "@/types"

const APPOINTMENT_TYPES = ["interview", "assessment", "project", "meeting", "other"]
const APPOINTMENT_PLATFORMS = ["Teams", "Google Meet", "Zoom", "Phone", "In-person", "Other"]

const NONE_SENTINEL = "__none__"

interface Props {
  applicationId?: number
  appointment?: AppointmentResponse | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

interface FormValues {
  title: string
  type: string
  date: string
  startTime: string
  endTime: string
  platform: string
  meeting_url: string
  notes: string
}

function toLocalDatetime(iso: string): { date: string; time: string } {
  const d = new Date(iso)
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, "0")
  const day = String(d.getDate()).padStart(2, "0")
  const hours = String(d.getHours()).padStart(2, "0")
  const minutes = String(d.getMinutes()).padStart(2, "0")
  return { date: `${year}-${month}-${day}`, time: `${hours}:${minutes}` }
}

function buildISODatetime(date: string, time: string): string {
  return `${date}T${time}:00`
}

export function AppointmentDialog({ applicationId, appointment, open, onOpenChange, onSuccess }: Props) {
  const isEdit = appointment != null

  const { register, handleSubmit, reset, setValue, watch, formState: { isSubmitting } } = useForm<FormValues>({
    defaultValues: {
      title: "",
      type: "",
      date: new Date().toISOString().slice(0, 10),
      startTime: "09:00",
      endTime: "",
      platform: "",
      meeting_url: "",
      notes: "",
    },
  })

  useEffect(() => {
    if (!open) return
    if (appointment) {
      const start = toLocalDatetime(appointment.starts_at)
      const end = appointment.ends_at ? toLocalDatetime(appointment.ends_at) : { date: "", time: "" }
      reset({
        title: appointment.title,
        type: appointment.type,
        date: start.date,
        startTime: start.time,
        endTime: end.time,
        platform: appointment.platform ?? "",
        meeting_url: appointment.meeting_url ?? "",
        notes: appointment.notes ?? "",
      })
    } else {
      reset({
        title: "",
        type: "",
        date: new Date().toISOString().slice(0, 10),
        startTime: "09:00",
        endTime: "",
        platform: "",
        meeting_url: "",
        notes: "",
      })
    }
  }, [open, appointment, reset])

  const typeValue = watch("type")
  const platformValue = watch("platform")

  async function onSubmit(values: FormValues) {
    if (!values.title.trim()) {
      toast.error("Title is required")
      return
    }
    if (!values.type) {
      toast.error("Type is required")
      return
    }

    const starts_at = buildISODatetime(values.date, values.startTime)
    const ends_at = values.endTime ? buildISODatetime(values.date, values.endTime) : undefined

    if (isEdit && appointment) {
      const result = await updateAppointment(appointment.id, {
        title: values.title.trim(),
        type: values.type,
        starts_at,
        ends_at: ends_at ?? null,
        platform: values.platform || null,
        meeting_url: values.meeting_url.trim() || null,
        notes: values.notes.trim() || null,
      })
      if (result.error !== null) {
        toast.error(result.error)
      } else {
        toast.success("Appointment updated")
        onSuccess()
        onOpenChange(false)
      }
    } else {
      const result = await createAppointment({
        application_id: applicationId ?? null,
        title: values.title.trim(),
        type: values.type,
        starts_at,
        ends_at: ends_at ?? null,
        platform: values.platform || null,
        meeting_url: values.meeting_url.trim() || null,
        notes: values.notes.trim() || null,
      })
      if (result.error !== null) {
        toast.error(result.error)
      } else {
        toast.success("Appointment created")
        onSuccess()
        onOpenChange(false)
      }
    }
  }

  async function handleDelete() {
    if (!appointment) return
    const result = await deleteAppointment(appointment.id)
    if (result.error !== null) {
      toast.error(result.error)
    } else {
      toast.success("Appointment deleted")
      onSuccess()
      onOpenChange(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Appointment" : "New Appointment"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1">
            <Label htmlFor="appt-title">Title</Label>
            <Input id="appt-title" placeholder="e.g. Technical interview — Round 2" {...register("title")} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label>Type</Label>
              <Select value={typeValue} onValueChange={(v) => setValue("type", v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select type…" />
                </SelectTrigger>
                <SelectContent>
                  {APPOINTMENT_TYPES.map((t) => (
                    <SelectItem key={t} value={t}>{t}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label>Platform</Label>
              <Select
                value={platformValue || NONE_SENTINEL}
                onValueChange={(v) => setValue("platform", v === NONE_SENTINEL ? "" : v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Optional" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={NONE_SENTINEL}>None</SelectItem>
                  {APPOINTMENT_PLATFORMS.map((p) => (
                    <SelectItem key={p} value={p}>{p}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1">
              <Label htmlFor="appt-date">Date</Label>
              <Input id="appt-date" type="date" {...register("date")} />
            </div>
            <div className="space-y-1">
              <Label htmlFor="appt-start">Start time</Label>
              <Input id="appt-start" type="time" {...register("startTime")} />
            </div>
            <div className="space-y-1">
              <Label htmlFor="appt-end">End time</Label>
              <Input id="appt-end" type="time" {...register("endTime")} />
            </div>
          </div>

          <div className="space-y-1">
            <Label htmlFor="appt-url">Meeting URL</Label>
            <Input id="appt-url" type="url" placeholder="https://..." {...register("meeting_url")} />
          </div>

          <div className="space-y-1">
            <Label htmlFor="appt-notes">Notes</Label>
            <Textarea id="appt-notes" placeholder="Additional notes…" rows={2} {...register("notes")} />
          </div>

          <div className="flex items-center gap-2">
            <Button type="submit" disabled={isSubmitting} className="flex-1">
              {isSubmitting ? "Saving…" : isEdit ? "Save Changes" : "Create"}
            </Button>
            {isEdit && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button type="button" variant="destructive">Delete</Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete appointment?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. The appointment will be permanently deleted.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
