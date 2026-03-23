"use client"

import { useMemo, useState } from "react"
import { toast } from "sonner"
import { Button } from "@workspace/ui/components/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@workspace/ui/components/card"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@workspace/ui/components/dialog"
import { Field, FieldGroup, FieldLabel } from "@workspace/ui/components/field"
import { Input } from "@workspace/ui/components/input"
import { Separator } from "@workspace/ui/components/separator"
import { Skeleton } from "@workspace/ui/components/skeleton"
import { Textarea } from "@workspace/ui/components/textarea"
import { useProfileEducation } from "@/hooks/useProfileEducation"
import {
  createProfileEducation,
  createProfileEducationHighlight,
  deleteProfileEducation,
  deleteProfileEducationHighlight,
  reorderProfileEducation,
  reorderProfileEducationHighlights,
  updateProfileEducation,
  updateProfileEducationHighlight,
} from "@/services/profile-education.service"
import type { EducationEntryResponse, EducationHighlightResponse } from "@/types"
import { buildReorderPayload, copyText, formatDate, moveItem } from "./profile-section-utils"

const EMPTY_FORM = {
  institution: "",
  degree: "",
  field_of_study: "",
  start_date: "",
  end_date: "",
  description: "",
}

export function EducationSection() {
  const { data, isLoading, error, refetch } = useProfileEducation()
  const [entryOpen, setEntryOpen] = useState(false)
  const [editEntry, setEditEntry] = useState<EducationEntryResponse | null>(null)
  const [entryForm, setEntryForm] = useState(EMPTY_FORM)
  const [highlightOpen, setHighlightOpen] = useState(false)
  const [highlightValue, setHighlightValue] = useState("")
  const [highlightEntryId, setHighlightEntryId] = useState<number | null>(null)
  const [editHighlight, setEditHighlight] = useState<EducationHighlightResponse | null>(null)

  const entries = useMemo(() => [...data].sort((a, b) => a.display_order - b.display_order), [data])

  async function saveEntry() {
    if (!entryForm.institution.trim() || !entryForm.degree.trim()) {
      toast.error("Institution and degree are required")
      return
    }
    const payload = {
      institution: entryForm.institution.trim(),
      degree: entryForm.degree.trim(),
      field_of_study: entryForm.field_of_study || null,
      start_date: entryForm.start_date || null,
      end_date: entryForm.end_date || null,
      description: entryForm.description || null,
    }
    const result = editEntry
      ? await updateProfileEducation(editEntry.id, payload)
      : await createProfileEducation({ ...payload, is_current: false, highlights: [] })
    if (result.error) return toast.error(result.error)
    toast.success(editEntry ? "Education updated" : "Education added")
    setEntryOpen(false)
    refetch()
  }

  async function saveHighlight() {
    if (!highlightEntryId || !highlightValue.trim()) {
      toast.error("Highlight content is required")
      return
    }
    const result = editHighlight
      ? await updateProfileEducationHighlight(editHighlight.id, { content: highlightValue.trim() })
      : await createProfileEducationHighlight(highlightEntryId, { content: highlightValue.trim() })
    if (result.error) return toast.error(result.error)
    toast.success(editHighlight ? "Highlight updated" : "Highlight added")
    setHighlightOpen(false)
    refetch()
  }

  async function moveEntry(id: number, direction: -1 | 1) {
    const idx = entries.findIndex((item) => item.id === id)
    const next = moveItem(entries, idx, idx + direction)
    const result = await reorderProfileEducation(buildReorderPayload(next))
    if (result.error) toast.error(result.error)
    else refetch()
  }

  async function moveHighlight(entry: EducationEntryResponse, id: number, direction: -1 | 1) {
    const list = [...entry.highlights].sort((a, b) => a.display_order - b.display_order)
    const idx = list.findIndex((item) => item.id === id)
    const result = await reorderProfileEducationHighlights(entry.id, buildReorderPayload(moveItem(list, idx, idx + direction)))
    if (result.error) toast.error(result.error)
    else refetch()
  }

  async function copyEntry(entry: EducationEntryResponse) {
    const text = `${entry.degree} | ${entry.institution}\n${formatDate(entry.start_date)} - ${entry.end_date ? formatDate(entry.end_date) : "Present"}\n${entry.description ?? ""}\n${entry.highlights.map((h) => `- ${h.content}`).join("\n")}`.trim()
    const ok = await copyText(text)
    if (ok) toast.success("Education copied")
    else toast.error("Failed to copy")
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between gap-2">
          <div className="flex flex-col gap-1">
            <CardTitle className="text-base">Education</CardTitle>
            <CardDescription>Manage education entries and highlights.</CardDescription>
          </div>
          <Button size="sm" onClick={() => { setEditEntry(null); setEntryForm(EMPTY_FORM); setEntryOpen(true) }}>Add Education</Button>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {isLoading ? (
          <Skeleton className="h-24 w-full" />
        ) : error ? (
          <p className="text-sm text-destructive">Failed to load education: {error}</p>
        ) : entries.length === 0 ? (
          <p className="text-sm text-muted-foreground">No education entries yet.</p>
        ) : (
          entries.map((entry, index) => (
            <div key={entry.id} className="flex flex-col gap-3 rounded-md border p-3">
              <div className="flex items-start justify-between gap-2">
                <div className="flex flex-col gap-1">
                  <p className="text-sm font-medium">{entry.degree} at {entry.institution}</p>
                  <p className="text-xs text-muted-foreground">{formatDate(entry.start_date)} - {entry.end_date ? formatDate(entry.end_date) : "Present"}</p>
                </div>
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="sm" onClick={() => moveEntry(entry.id, -1)} disabled={index === 0}>Up</Button>
                  <Button variant="ghost" size="sm" onClick={() => moveEntry(entry.id, 1)} disabled={index === entries.length - 1}>Down</Button>
                  <Button variant="ghost" size="sm" onClick={() => copyEntry(entry)}>Copy</Button>
                  <Button variant="ghost" size="sm" onClick={() => { setEditEntry(entry); setEntryForm({ institution: entry.institution, degree: entry.degree, field_of_study: entry.field_of_study ?? "", start_date: entry.start_date ?? "", end_date: entry.end_date ?? "", description: entry.description ?? "" }); setEntryOpen(true) }}>Edit</Button>
                  <Button variant="ghost" size="sm" onClick={async () => { const r = await deleteProfileEducation(entry.id); if (r.error) toast.error(r.error); else { toast.success("Education deleted"); refetch() } }}>Delete</Button>
                </div>
              </div>
              <Separator />
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-medium uppercase text-muted-foreground">Highlights</p>
                  <Button variant="outline" size="sm" onClick={() => { setHighlightEntryId(entry.id); setEditHighlight(null); setHighlightValue(""); setHighlightOpen(true) }}>Add Highlight</Button>
                </div>
                {entry.highlights.map((highlight, idx) => (
                  <div key={highlight.id} className="flex items-center gap-1 rounded-md border px-2 py-1">
                    <p className="flex-1 text-sm">{highlight.content}</p>
                    <Button variant="ghost" size="sm" onClick={() => moveHighlight(entry, highlight.id, -1)} disabled={idx === 0}>Up</Button>
                    <Button variant="ghost" size="sm" onClick={() => moveHighlight(entry, highlight.id, 1)} disabled={idx === entry.highlights.length - 1}>Down</Button>
                    <Button variant="ghost" size="sm" onClick={() => { setHighlightEntryId(entry.id); setEditHighlight(highlight); setHighlightValue(highlight.content); setHighlightOpen(true) }}>Edit</Button>
                    <Button variant="ghost" size="sm" onClick={async () => { const r = await deleteProfileEducationHighlight(highlight.id); if (r.error) toast.error(r.error); else { toast.success("Highlight deleted"); refetch() } }}>Delete</Button>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </CardContent>
      <Dialog open={entryOpen} onOpenChange={setEntryOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editEntry ? "Edit Education" : "Add Education"}</DialogTitle></DialogHeader>
          <FieldGroup>
            <Field><FieldLabel htmlFor="edu-institution">Institution</FieldLabel><Input id="edu-institution" value={entryForm.institution} onChange={(e) => setEntryForm((s) => ({ ...s, institution: e.target.value }))} /></Field>
            <Field><FieldLabel htmlFor="edu-degree">Degree</FieldLabel><Input id="edu-degree" value={entryForm.degree} onChange={(e) => setEntryForm((s) => ({ ...s, degree: e.target.value }))} /></Field>
            <Field><FieldLabel htmlFor="edu-field">Field of Study</FieldLabel><Input id="edu-field" value={entryForm.field_of_study} onChange={(e) => setEntryForm((s) => ({ ...s, field_of_study: e.target.value }))} /></Field>
            <Field><FieldLabel htmlFor="edu-start">Start Date</FieldLabel><Input id="edu-start" type="date" value={entryForm.start_date} onChange={(e) => setEntryForm((s) => ({ ...s, start_date: e.target.value }))} /></Field>
            <Field><FieldLabel htmlFor="edu-end">End Date</FieldLabel><Input id="edu-end" type="date" value={entryForm.end_date} onChange={(e) => setEntryForm((s) => ({ ...s, end_date: e.target.value }))} /></Field>
            <Field><FieldLabel htmlFor="edu-description">Description</FieldLabel><Textarea id="edu-description" value={entryForm.description} onChange={(e) => setEntryForm((s) => ({ ...s, description: e.target.value }))} /></Field>
          </FieldGroup>
          <DialogFooter><Button variant="outline" onClick={() => setEntryOpen(false)}>Cancel</Button><Button onClick={saveEntry}>{editEntry ? "Save" : "Add"}</Button></DialogFooter>
        </DialogContent>
      </Dialog>
      <Dialog open={highlightOpen} onOpenChange={setHighlightOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editHighlight ? "Edit Highlight" : "Add Highlight"}</DialogTitle></DialogHeader>
          <FieldGroup>
            <Field><FieldLabel htmlFor="edu-highlight">Highlight</FieldLabel><Textarea id="edu-highlight" value={highlightValue} onChange={(e) => setHighlightValue(e.target.value)} /></Field>
          </FieldGroup>
          <DialogFooter><Button variant="outline" onClick={() => setHighlightOpen(false)}>Cancel</Button><Button onClick={saveHighlight}>{editHighlight ? "Save" : "Add"}</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  )
}
