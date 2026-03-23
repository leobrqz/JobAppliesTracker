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
import { useProfileProjects } from "@/hooks/useProfileProjects"
import {
  createProfileProject,
  createProfileProjectBullet,
  deleteProfileProject,
  deleteProfileProjectBullet,
  reorderProfileProjectBullets,
  reorderProfileProjects,
  updateProfileProject,
  updateProfileProjectBullet,
} from "@/services/profile-projects.service"
import type { ProjectBulletResponse, ProjectEntryResponse } from "@/types"
import { buildReorderPayload, copyText, formatDate, moveItem } from "./profile-section-utils"

const EMPTY_FORM = { name: "", role: "", url: "", repository_url: "", start_date: "", end_date: "", description: "" }

export function ProjectsSection() {
  const { data, isLoading, error, refetch } = useProfileProjects()
  const [entryOpen, setEntryOpen] = useState(false)
  const [entryForm, setEntryForm] = useState(EMPTY_FORM)
  const [editEntry, setEditEntry] = useState<ProjectEntryResponse | null>(null)
  const [bulletOpen, setBulletOpen] = useState(false)
  const [bulletValue, setBulletValue] = useState("")
  const [bulletEntryId, setBulletEntryId] = useState<number | null>(null)
  const [editBullet, setEditBullet] = useState<ProjectBulletResponse | null>(null)
  const entries = useMemo(() => [...data].sort((a, b) => a.display_order - b.display_order), [data])

  async function saveEntry() {
    if (!entryForm.name.trim()) return toast.error("Project name is required")
    const payload = {
      name: entryForm.name.trim(),
      role: entryForm.role || null,
      url: entryForm.url || null,
      repository_url: entryForm.repository_url || null,
      start_date: entryForm.start_date || null,
      end_date: entryForm.end_date || null,
      description: entryForm.description || null,
    }
    const result = editEntry
      ? await updateProfileProject(editEntry.id, payload)
      : await createProfileProject({ ...payload, is_current: false, bullets: [] })
    if (result.error) return toast.error(result.error)
    toast.success(editEntry ? "Project updated" : "Project added")
    setEntryOpen(false)
    refetch()
  }

  async function saveBullet() {
    if (!bulletEntryId || !bulletValue.trim()) return toast.error("Bullet content is required")
    const result = editBullet
      ? await updateProfileProjectBullet(editBullet.id, { content: bulletValue.trim() })
      : await createProfileProjectBullet(bulletEntryId, { content: bulletValue.trim() })
    if (result.error) return toast.error(result.error)
    toast.success(editBullet ? "Bullet updated" : "Bullet added")
    setBulletOpen(false)
    refetch()
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between gap-2">
          <div className="flex flex-col gap-1">
            <CardTitle className="text-base">Projects</CardTitle>
            <CardDescription>Track project experience and reusable descriptions.</CardDescription>
          </div>
          <Button size="sm" onClick={() => { setEditEntry(null); setEntryForm(EMPTY_FORM); setEntryOpen(true) }}>Add Project</Button>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {isLoading ? (
          <Skeleton className="h-24 w-full" />
        ) : error ? (
          <p className="text-sm text-destructive">Failed to load projects: {error}</p>
        ) : entries.length === 0 ? (
          <p className="text-sm text-muted-foreground">No projects yet.</p>
        ) : entries.map((entry, index) => (
          <div key={entry.id} className="flex flex-col gap-3 rounded-md border p-3">
            <div className="flex items-start justify-between gap-2">
              <div className="flex flex-col gap-1">
                <p className="text-sm font-medium">{entry.name}</p>
                <p className="text-xs text-muted-foreground">{entry.role ?? "No role"} | {formatDate(entry.start_date)} - {entry.end_date ? formatDate(entry.end_date) : "Present"}</p>
                {entry.description && <p className="text-sm text-muted-foreground">{entry.description}</p>}
              </div>
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="sm" onClick={async () => { const next = moveItem(entries, index, index - 1); const r = await reorderProfileProjects(buildReorderPayload(next)); if (r.error) toast.error(r.error); else refetch() }} disabled={index === 0}>Up</Button>
                <Button variant="ghost" size="sm" onClick={async () => { const next = moveItem(entries, index, index + 1); const r = await reorderProfileProjects(buildReorderPayload(next)); if (r.error) toast.error(r.error); else refetch() }} disabled={index === entries.length - 1}>Down</Button>
                <Button variant="ghost" size="sm" onClick={async () => { const ok = await copyText(`${entry.name}\n${entry.description ?? ""}\n${entry.bullets.map((b) => `- ${b.content}`).join("\n")}`.trim()); if (ok) toast.success("Project copied"); else toast.error("Failed to copy") }}>Copy</Button>
                <Button variant="ghost" size="sm" onClick={() => { setEditEntry(entry); setEntryForm({ name: entry.name, role: entry.role ?? "", url: entry.url ?? "", repository_url: entry.repository_url ?? "", start_date: entry.start_date ?? "", end_date: entry.end_date ?? "", description: entry.description ?? "" }); setEntryOpen(true) }}>Edit</Button>
                <Button variant="ghost" size="sm" onClick={async () => { const r = await deleteProfileProject(entry.id); if (r.error) toast.error(r.error); else { toast.success("Project deleted"); refetch() } }}>Delete</Button>
              </div>
            </div>
            <Separator />
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <p className="text-xs font-medium uppercase text-muted-foreground">Bullets</p>
                <Button variant="outline" size="sm" onClick={() => { setEditBullet(null); setBulletEntryId(entry.id); setBulletValue(""); setBulletOpen(true) }}>Add Bullet</Button>
              </div>
              {entry.bullets.map((bullet, bulletIndex) => (
                <div key={bullet.id} className="flex items-center gap-1 rounded-md border px-2 py-1">
                  <p className="flex-1 text-sm">{bullet.content}</p>
                  <Button variant="ghost" size="sm" onClick={async () => { const list = [...entry.bullets].sort((a, b) => a.display_order - b.display_order); const next = moveItem(list, bulletIndex, bulletIndex - 1); const r = await reorderProfileProjectBullets(entry.id, buildReorderPayload(next)); if (r.error) toast.error(r.error); else refetch() }} disabled={bulletIndex === 0}>Up</Button>
                  <Button variant="ghost" size="sm" onClick={async () => { const list = [...entry.bullets].sort((a, b) => a.display_order - b.display_order); const next = moveItem(list, bulletIndex, bulletIndex + 1); const r = await reorderProfileProjectBullets(entry.id, buildReorderPayload(next)); if (r.error) toast.error(r.error); else refetch() }} disabled={bulletIndex === entry.bullets.length - 1}>Down</Button>
                  <Button variant="ghost" size="sm" onClick={() => { setEditBullet(bullet); setBulletEntryId(entry.id); setBulletValue(bullet.content); setBulletOpen(true) }}>Edit</Button>
                  <Button variant="ghost" size="sm" onClick={async () => { const r = await deleteProfileProjectBullet(bullet.id); if (r.error) toast.error(r.error); else { toast.success("Bullet deleted"); refetch() } }}>Delete</Button>
                </div>
              ))}
            </div>
          </div>
        ))}
      </CardContent>
      <Dialog open={entryOpen} onOpenChange={setEntryOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editEntry ? "Edit Project" : "Add Project"}</DialogTitle></DialogHeader>
          <FieldGroup>
            <Field><FieldLabel htmlFor="project-name">Name</FieldLabel><Input id="project-name" value={entryForm.name} onChange={(e) => setEntryForm((s) => ({ ...s, name: e.target.value }))} /></Field>
            <Field><FieldLabel htmlFor="project-role">Role</FieldLabel><Input id="project-role" value={entryForm.role} onChange={(e) => setEntryForm((s) => ({ ...s, role: e.target.value }))} /></Field>
            <Field><FieldLabel htmlFor="project-url">Project URL</FieldLabel><Input id="project-url" value={entryForm.url} onChange={(e) => setEntryForm((s) => ({ ...s, url: e.target.value }))} /></Field>
            <Field><FieldLabel htmlFor="project-repo">Repository URL</FieldLabel><Input id="project-repo" value={entryForm.repository_url} onChange={(e) => setEntryForm((s) => ({ ...s, repository_url: e.target.value }))} /></Field>
            <Field><FieldLabel htmlFor="project-start">Start Date</FieldLabel><Input id="project-start" type="date" value={entryForm.start_date} onChange={(e) => setEntryForm((s) => ({ ...s, start_date: e.target.value }))} /></Field>
            <Field><FieldLabel htmlFor="project-end">End Date</FieldLabel><Input id="project-end" type="date" value={entryForm.end_date} onChange={(e) => setEntryForm((s) => ({ ...s, end_date: e.target.value }))} /></Field>
            <Field><FieldLabel htmlFor="project-description">Description</FieldLabel><Textarea id="project-description" value={entryForm.description} onChange={(e) => setEntryForm((s) => ({ ...s, description: e.target.value }))} /></Field>
          </FieldGroup>
          <DialogFooter><Button variant="outline" onClick={() => setEntryOpen(false)}>Cancel</Button><Button onClick={saveEntry}>{editEntry ? "Save" : "Add"}</Button></DialogFooter>
        </DialogContent>
      </Dialog>
      <Dialog open={bulletOpen} onOpenChange={setBulletOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editBullet ? "Edit Bullet" : "Add Bullet"}</DialogTitle></DialogHeader>
          <FieldGroup>
            <Field><FieldLabel htmlFor="project-bullet">Bullet</FieldLabel><Textarea id="project-bullet" value={bulletValue} onChange={(e) => setBulletValue(e.target.value)} /></Field>
          </FieldGroup>
          <DialogFooter><Button variant="outline" onClick={() => setBulletOpen(false)}>Cancel</Button><Button onClick={saveBullet}>{editBullet ? "Save" : "Add"}</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  )
}
