"use client"

import { useMemo, useState } from "react"
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@workspace/ui/components/card"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@workspace/ui/components/dialog"
import { Field, FieldGroup, FieldLabel } from "@workspace/ui/components/field"
import { Input } from "@workspace/ui/components/input"
import { Separator } from "@workspace/ui/components/separator"
import { Skeleton } from "@workspace/ui/components/skeleton"
import { Textarea } from "@workspace/ui/components/textarea"
import { useProfileExperience } from "@/hooks/useProfileExperience"
import {
  createProfileExperience,
  createProfileExperienceBullet,
  deleteProfileExperience,
  deleteProfileExperienceBullet,
  reorderProfileExperience,
  reorderProfileExperienceBullets,
  updateProfileExperience,
  updateProfileExperienceBullet,
} from "@/services/profile-experience.service"
import type { ExperienceBulletResponse, ExperienceEntryResponse } from "@/types"
import { buildReorderPayload, copyText, formatDate, moveItem } from "./profile-section-utils"

const EMPTY_FORM = {
  job_title: "",
  company: "",
  start_date: "",
  end_date: "",
  seniority: "",
  summary: "",
}

export function ExperienceSection() {
  const { data, isLoading, error, refetch } = useProfileExperience()
  const [entryOpen, setEntryOpen] = useState(false)
  const [editEntry, setEditEntry] = useState<ExperienceEntryResponse | null>(null)
  const [entryForm, setEntryForm] = useState(EMPTY_FORM)
  const [bulletOpen, setBulletOpen] = useState(false)
  const [bulletValue, setBulletValue] = useState("")
  const [bulletTargetEntry, setBulletTargetEntry] = useState<number | null>(null)
  const [editBullet, setEditBullet] = useState<ExperienceBulletResponse | null>(null)

  const entries = useMemo(() => [...data].sort((a, b) => a.display_order - b.display_order), [data])

  function openCreateEntry() {
    setEditEntry(null)
    setEntryForm(EMPTY_FORM)
    setEntryOpen(true)
  }

  function openEditEntry(entry: ExperienceEntryResponse) {
    setEditEntry(entry)
    setEntryForm({
      job_title: entry.job_title,
      company: entry.company,
      start_date: entry.start_date ?? "",
      end_date: entry.end_date ?? "",
      seniority: entry.seniority ?? "",
      summary: entry.summary ?? "",
    })
    setEntryOpen(true)
  }

  async function saveEntry() {
    if (!entryForm.job_title.trim() || !entryForm.company.trim()) {
      toast.error("Job title and company are required")
      return
    }
    const payload = {
      job_title: entryForm.job_title.trim(),
      company: entryForm.company.trim(),
      start_date: entryForm.start_date || null,
      end_date: entryForm.end_date || null,
      seniority: entryForm.seniority || null,
      summary: entryForm.summary || null,
    }
    const result = editEntry
      ? await updateProfileExperience(editEntry.id, payload)
      : await createProfileExperience({ ...payload, is_current: false, bullets: [] })
    if (result.error) {
      toast.error(result.error)
      return
    }
    toast.success(editEntry ? "Experience updated" : "Experience added")
    setEntryOpen(false)
    refetch()
  }

  async function handleDeleteEntry(id: number) {
    const result = await deleteProfileExperience(id)
    if (result.error) toast.error(result.error)
    else {
      toast.success("Experience deleted")
      refetch()
    }
  }

  async function moveEntry(id: number, direction: -1 | 1) {
    const index = entries.findIndex((item) => item.id === id)
    const nextEntries = moveItem(entries, index, index + direction)
    if (nextEntries === entries) return
    const result = await reorderProfileExperience(buildReorderPayload(nextEntries))
    if (result.error) toast.error(result.error)
    else refetch()
  }

  function openCreateBullet(entryId: number) {
    setBulletTargetEntry(entryId)
    setEditBullet(null)
    setBulletValue("")
    setBulletOpen(true)
  }

  function openEditBullet(entryId: number, bullet: ExperienceBulletResponse) {
    setBulletTargetEntry(entryId)
    setEditBullet(bullet)
    setBulletValue(bullet.content)
    setBulletOpen(true)
  }

  async function saveBullet() {
    if (!bulletTargetEntry || !bulletValue.trim()) {
      toast.error("Bullet content is required")
      return
    }
    const result = editBullet
      ? await updateProfileExperienceBullet(editBullet.id, { content: bulletValue.trim() })
      : await createProfileExperienceBullet(bulletTargetEntry, { content: bulletValue.trim() })
    if (result.error) {
      toast.error(result.error)
      return
    }
    toast.success(editBullet ? "Bullet updated" : "Bullet added")
    setBulletOpen(false)
    refetch()
  }

  async function handleDeleteBullet(id: number) {
    const result = await deleteProfileExperienceBullet(id)
    if (result.error) toast.error(result.error)
    else {
      toast.success("Bullet deleted")
      refetch()
    }
  }

  async function moveBullet(entry: ExperienceEntryResponse, bulletId: number, direction: -1 | 1) {
    const bullets = [...entry.bullets].sort((a, b) => a.display_order - b.display_order)
    const index = bullets.findIndex((item) => item.id === bulletId)
    const nextBullets = moveItem(bullets, index, index + direction)
    const result = await reorderProfileExperienceBullets(entry.id, buildReorderPayload(nextBullets))
    if (result.error) toast.error(result.error)
    else refetch()
  }

  async function copyEntry(entry: ExperienceEntryResponse) {
    const bulletLines = entry.bullets.map((item) => `- ${item.content}`).join("\n")
    const block = `${entry.job_title} | ${entry.company}\n${formatDate(entry.start_date)} - ${formatDate(entry.end_date)}\n${entry.summary ?? ""}\n${bulletLines}`.trim()
    const ok = await copyText(block)
    if (ok) toast.success("Experience copied")
    else toast.error("Failed to copy")
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between gap-2">
          <div className="flex flex-col gap-1">
            <CardTitle className="text-base">Experience</CardTitle>
            <CardDescription>Manage employment history entries and bullet points.</CardDescription>
          </div>
          <Button size="sm" onClick={openCreateEntry}>Add Experience</Button>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {isLoading ? (
          <div className="flex flex-col gap-2">
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
          </div>
        ) : error ? (
          <p className="text-sm text-destructive">Failed to load experience: {error}</p>
        ) : entries.length === 0 ? (
          <p className="text-sm text-muted-foreground">No experience entries yet.</p>
        ) : (
          entries.map((entry, index) => (
            <div key={entry.id} className="flex flex-col gap-3 rounded-md border p-3">
              <div className="flex items-start justify-between gap-2">
                <div className="flex flex-col gap-1">
                  <p className="text-sm font-medium">{entry.job_title} at {entry.company}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatDate(entry.start_date)} - {entry.end_date ? formatDate(entry.end_date) : "Present"}
                  </p>
                  {entry.summary && <p className="text-sm text-muted-foreground">{entry.summary}</p>}
                </div>
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="sm" onClick={() => moveEntry(entry.id, -1)} disabled={index === 0}>Up</Button>
                  <Button variant="ghost" size="sm" onClick={() => moveEntry(entry.id, 1)} disabled={index === entries.length - 1}>Down</Button>
                  <Button variant="ghost" size="sm" onClick={() => copyEntry(entry)}>Copy</Button>
                  <Button variant="ghost" size="sm" onClick={() => openEditEntry(entry)}>Edit</Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive">Delete</Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete experience entry?</AlertDialogTitle>
                        <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDeleteEntry(entry.id)}>Delete</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
              <Separator />
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-medium uppercase text-muted-foreground">Bullets</p>
                  <Button variant="outline" size="sm" onClick={() => openCreateBullet(entry.id)}>Add Bullet</Button>
                </div>
                {entry.bullets.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No bullets yet.</p>
                ) : (
                  entry.bullets.map((bullet, bulletIndex) => (
                    <div key={bullet.id} className="flex items-center gap-2 rounded-md border px-2 py-1">
                      <p className="flex-1 text-sm">{bullet.content}</p>
                      <Button variant="ghost" size="sm" onClick={() => moveBullet(entry, bullet.id, -1)} disabled={bulletIndex === 0}>Up</Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => moveBullet(entry, bullet.id, 1)}
                        disabled={bulletIndex === entry.bullets.length - 1}
                      >
                        Down
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => openEditBullet(entry.id, bullet)}>Edit</Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDeleteBullet(bullet.id)}>Delete</Button>
                    </div>
                  ))
                )}
              </div>
            </div>
          ))
        )}
      </CardContent>

      <Dialog open={entryOpen} onOpenChange={setEntryOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editEntry ? "Edit Experience" : "Add Experience"}</DialogTitle>
          </DialogHeader>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="exp-job-title">Job Title</FieldLabel>
              <Input id="exp-job-title" value={entryForm.job_title} onChange={(e) => setEntryForm((s) => ({ ...s, job_title: e.target.value }))} />
            </Field>
            <Field>
              <FieldLabel htmlFor="exp-company">Company</FieldLabel>
              <Input id="exp-company" value={entryForm.company} onChange={(e) => setEntryForm((s) => ({ ...s, company: e.target.value }))} />
            </Field>
            <Field>
              <FieldLabel htmlFor="exp-start-date">Start Date</FieldLabel>
              <Input id="exp-start-date" type="date" value={entryForm.start_date} onChange={(e) => setEntryForm((s) => ({ ...s, start_date: e.target.value }))} />
            </Field>
            <Field>
              <FieldLabel htmlFor="exp-end-date">End Date</FieldLabel>
              <Input id="exp-end-date" type="date" value={entryForm.end_date} onChange={(e) => setEntryForm((s) => ({ ...s, end_date: e.target.value }))} />
            </Field>
            <Field>
              <FieldLabel htmlFor="exp-seniority">Seniority</FieldLabel>
              <Input id="exp-seniority" value={entryForm.seniority} onChange={(e) => setEntryForm((s) => ({ ...s, seniority: e.target.value }))} />
            </Field>
            <Field>
              <FieldLabel htmlFor="exp-summary">Summary</FieldLabel>
              <Textarea id="exp-summary" value={entryForm.summary} onChange={(e) => setEntryForm((s) => ({ ...s, summary: e.target.value }))} />
            </Field>
          </FieldGroup>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEntryOpen(false)}>Cancel</Button>
            <Button onClick={saveEntry}>{editEntry ? "Save" : "Add"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={bulletOpen} onOpenChange={setBulletOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editBullet ? "Edit Bullet" : "Add Bullet"}</DialogTitle>
          </DialogHeader>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="exp-bullet">Bullet</FieldLabel>
              <Textarea id="exp-bullet" value={bulletValue} onChange={(e) => setBulletValue(e.target.value)} />
            </Field>
          </FieldGroup>
          <DialogFooter>
            <Button variant="outline" onClick={() => setBulletOpen(false)}>Cancel</Button>
            <Button onClick={saveBullet}>{editBullet ? "Save" : "Add"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  )
}
