"use client"

import { useMemo, useState } from "react"
import { toast } from "sonner"
import { Button } from "@workspace/ui/components/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@workspace/ui/components/card"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@workspace/ui/components/dialog"
import { Field, FieldGroup, FieldLabel } from "@workspace/ui/components/field"
import { Input } from "@workspace/ui/components/input"
import { Skeleton } from "@workspace/ui/components/skeleton"
import { Textarea } from "@workspace/ui/components/textarea"
import { useProfileCourses } from "@/hooks/useProfileCourses"
import {
  createProfileCourse,
  deleteProfileCourse,
  deleteProfileCourseAttachment,
  downloadProfileCourseAttachment,
  reorderProfileCourses,
  updateProfileCourse,
  uploadProfileCourseAttachment,
} from "@/services/profile-courses.service"
import type { CourseEntryResponse } from "@/types"
import { buildReorderPayload, moveItem } from "./profile-section-utils"

const EMPTY = { title: "", provider: "", completed_on: "", duration_hours: "", verification_link: "", notes: "" }

export function CoursesSection() {
  const { data, isLoading, error, refetch } = useProfileCourses()
  const [open, setOpen] = useState(false)
  const [edit, setEdit] = useState<CourseEntryResponse | null>(null)
  const [form, setForm] = useState(EMPTY)
  const [selectedAttachment, setSelectedAttachment] = useState<File | null>(null)
  const items = useMemo(() => [...data].sort((a, b) => a.display_order - b.display_order), [data])

  async function save() {
    if (!form.title.trim() || !form.provider.trim()) return toast.error("Title and provider are required")
    const payload = {
      title: form.title.trim(),
      provider: form.provider.trim(),
      completed_on: form.completed_on || null,
      duration_hours: form.duration_hours ? Number(form.duration_hours) : null,
      verification_link: form.verification_link || null,
      notes: form.notes || null,
    }
    const result = edit ? await updateProfileCourse(edit.id, payload) : await createProfileCourse(payload)
    if (result.error) return toast.error(result.error)
    if (selectedAttachment && result.data) {
      const formData = new FormData()
      formData.append("file", selectedAttachment)
      const uploadResult = await uploadProfileCourseAttachment(result.data.id, formData)
      if (uploadResult.error) {
        toast.error(uploadResult.error)
        return
      }
    }
    toast.success(edit ? "Course updated" : "Course added")
    setOpen(false)
    setSelectedAttachment(null)
    refetch()
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between gap-2">
          <div className="flex flex-col gap-1">
            <CardTitle className="text-base">Courses</CardTitle>
            <CardDescription>Track courses, verification links, and attachments.</CardDescription>
          </div>
          <Button size="sm" onClick={() => { setEdit(null); setForm(EMPTY); setSelectedAttachment(null); setOpen(true) }}>Add Course</Button>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {isLoading ? <Skeleton className="h-24 w-full" /> : error ? (
          <p className="text-sm text-destructive">Failed to load courses: {error}</p>
        ) : items.length === 0 ? (
          <p className="text-sm text-muted-foreground">No courses yet.</p>
        ) : items.map((item, idx) => (
          <div key={item.id} className="flex flex-col gap-2 rounded-md border p-3">
            <div className="flex items-start justify-between gap-2">
              <div className="flex flex-col gap-1">
                <p className="text-sm font-medium">{item.title} - {item.provider}</p>
                {item.verification_link && <a className="text-xs text-primary underline" href={item.verification_link} target="_blank" rel="noreferrer">Verification link</a>}
                {item.notes && <p className="text-sm text-muted-foreground">{item.notes}</p>}
              </div>
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="sm" disabled={idx === 0} onClick={async () => { const r = await reorderProfileCourses(buildReorderPayload(moveItem(items, idx, idx - 1))); if (r.error) toast.error(r.error); else refetch() }}>Up</Button>
                <Button variant="ghost" size="sm" disabled={idx === items.length - 1} onClick={async () => { const r = await reorderProfileCourses(buildReorderPayload(moveItem(items, idx, idx + 1))); if (r.error) toast.error(r.error); else refetch() }}>Down</Button>
                <Button variant="ghost" size="sm" onClick={() => { setEdit(item); setForm({ title: item.title, provider: item.provider, completed_on: item.completed_on ?? "", duration_hours: item.duration_hours ? String(item.duration_hours) : "", verification_link: item.verification_link ?? "", notes: item.notes ?? "" }); setOpen(true) }}>Edit</Button>
                <Button variant="ghost" size="sm" onClick={async () => { const r = await deleteProfileCourse(item.id); if (r.error) toast.error(r.error); else { toast.success("Course deleted"); refetch() } }}>Delete</Button>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {item.attachment_file_name && (
                <>
                  <Button variant="ghost" size="sm" onClick={() => downloadProfileCourseAttachment(item.id, item.attachment_file_name!)}>Download</Button>
                  <Button variant="ghost" size="sm" onClick={async () => { const r = await deleteProfileCourseAttachment(item.id); if (r.error) toast.error(r.error); else { toast.success("Attachment removed"); refetch() } }}>Remove Attachment</Button>
                </>
              )}
            </div>
          </div>
        ))}
      </CardContent>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{edit ? "Edit Course" : "Add Course"}</DialogTitle></DialogHeader>
          <FieldGroup>
            <Field><FieldLabel htmlFor="course-title">Title</FieldLabel><Input id="course-title" value={form.title} onChange={(e) => setForm((s) => ({ ...s, title: e.target.value }))} /></Field>
            <Field><FieldLabel htmlFor="course-provider">Provider</FieldLabel><Input id="course-provider" value={form.provider} onChange={(e) => setForm((s) => ({ ...s, provider: e.target.value }))} /></Field>
            <Field><FieldLabel htmlFor="course-completed">Completed On</FieldLabel><Input id="course-completed" type="date" value={form.completed_on} onChange={(e) => setForm((s) => ({ ...s, completed_on: e.target.value }))} /></Field>
            <Field><FieldLabel htmlFor="course-duration">Duration (hours)</FieldLabel><Input id="course-duration" type="number" value={form.duration_hours} onChange={(e) => setForm((s) => ({ ...s, duration_hours: e.target.value }))} /></Field>
            <Field><FieldLabel htmlFor="course-link">Verification Link</FieldLabel><Input id="course-link" value={form.verification_link} onChange={(e) => setForm((s) => ({ ...s, verification_link: e.target.value }))} /></Field>
            <Field><FieldLabel htmlFor="course-notes">Notes</FieldLabel><Textarea id="course-notes" value={form.notes} onChange={(e) => setForm((s) => ({ ...s, notes: e.target.value }))} /></Field>
            <Field>
              <FieldLabel htmlFor="course-create-attachment">Attachment (PDF/PNG/JPEG)</FieldLabel>
              <Input
                id="course-create-attachment"
                type="file"
                accept=".pdf,.png,.jpg,.jpeg"
                onChange={(e) => setSelectedAttachment(e.target.files?.[0] ?? null)}
              />
            </Field>
          </FieldGroup>
          <DialogFooter><Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button><Button onClick={save}>{edit ? "Save" : "Add"}</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  )
}
