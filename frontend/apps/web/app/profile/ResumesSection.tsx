"use client"

import { useRef, useState } from "react"
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
import { Card, CardContent, CardHeader, CardTitle } from "@workspace/ui/components/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@workspace/ui/components/dialog"
import { Input } from "@workspace/ui/components/input"
import { Label } from "@workspace/ui/components/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@workspace/ui/components/select"
import { Skeleton } from "@workspace/ui/components/skeleton"
import { Textarea } from "@workspace/ui/components/textarea"
import { formatDate } from "@/lib/display"
import { usePreference } from "@/hooks/usePreference"
import { useResumes } from "@/hooks/useResumes"
import {
  archiveResume,
  deleteResume,
  downloadResume,
  restoreResume,
  updateResume,
  uploadResume,
} from "@/services/resumes.service"
import type { ResumeResponse } from "@/types"

export function ResumesSection() {
  const [locale] = usePreference<string>("display.locale", "en-US")
  const [showArchived, setShowArchived] = useState(false)
  const { data, isLoading, error, refetch } = useResumes(showArchived)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [editTarget, setEditTarget] = useState<ResumeResponse | null>(null)
  const [editName, setEditName] = useState("")
  const [editDesc, setEditDesc] = useState("")

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    const formData = new FormData()
    formData.append("file", file)
    formData.append("name", file.name)

    const result = await uploadResume(formData)
    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success("Resume uploaded")
      refetch()
    }
    e.target.value = ""
  }

  function openEdit(resume: ResumeResponse) {
    setEditTarget(resume)
    setEditName(resume.name)
    setEditDesc(resume.description ?? "")
  }

  async function handleEditSave() {
    if (!editTarget) return
    const result = await updateResume(editTarget.id, { name: editName.trim(), description: editDesc.trim() || undefined })
    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success("Resume updated")
      setEditTarget(null)
      refetch()
    }
  }

  async function handleArchive(id: number) {
    const result = await archiveResume(id)
    if (result.error) toast.error(result.error)
    else { toast.success("Resume archived"); refetch() }
  }

  async function handleRestore(id: number) {
    const result = await restoreResume(id)
    if (result.error) toast.error(result.error)
    else { toast.success("Resume restored"); refetch() }
  }

  async function handleDelete(id: number) {
    const result = await deleteResume(id)
    if (result.error) toast.error(result.error)
    else { toast.success("Resume deleted"); refetch() }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">Resumes</CardTitle>
          <div className="flex items-center gap-2">
            <Select
              value={showArchived ? "archived" : "active"}
              onValueChange={(v) => setShowArchived(v === "archived")}
            >
              <SelectTrigger className="w-28 h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="archived">Archived</SelectItem>
              </SelectContent>
            </Select>
            {!showArchived && (
              <>
                <Button size="sm" onClick={() => fileInputRef.current?.click()}>
                  Upload
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.docx"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {isLoading ? (
          <div className="space-y-2">
            {[0, 1].map((i) => <Skeleton key={i} className="h-12 w-full" />)}
          </div>
        ) : error ? (
          <p className="text-sm text-destructive">Failed to load resumes: {error}</p>
        ) : data.length === 0 ? (
          <p className="text-sm text-muted-foreground">No resumes {showArchived ? "archived" : "uploaded"} yet.</p>
        ) : (
          <ul className="space-y-3">
            {data.map((resume) => (
              <li key={resume.id} className="flex items-center justify-between gap-4 rounded-md border p-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{resume.name}</p>
                  {resume.description && (
                    <p className="truncate text-xs text-muted-foreground">{resume.description}</p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    {formatDate(resume.created_at, locale)}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-1">
                  {!showArchived && (
                    <>
                      <Button variant="ghost" size="sm" onClick={() => downloadResume(resume.id, resume.name)}>
                        Download
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => openEdit(resume)}>
                        Edit
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="sm">Archive</Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Archive resume?</AlertDialogTitle>
                            <AlertDialogDescription>
                              &quot;{resume.name}&quot; will be moved to archived resumes.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleArchive(resume.id)}>Archive</AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </>
                  )}
                  {showArchived && (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="sm">Restore</Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Restore resume?</AlertDialogTitle>
                          <AlertDialogDescription>
                            &quot;{resume.name}&quot; will be moved back to active resumes.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleRestore(resume.id)}>Restore</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  )}
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive">
                        Delete
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete resume?</AlertDialogTitle>
                        <AlertDialogDescription>
                          &quot;{resume.name}&quot; will be permanently deleted along with its file.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDelete(resume.id)}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>

      <Dialog open={editTarget !== null} onOpenChange={(open) => { if (!open) setEditTarget(null) }}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Edit Resume</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1">
              <Label htmlFor="edit-name">Name</Label>
              <Input id="edit-name" value={editName} onChange={(e) => setEditName(e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label htmlFor="edit-desc">Description</Label>
              <Textarea
                id="edit-desc"
                value={editDesc}
                onChange={(e) => setEditDesc(e.target.value)}
                rows={3}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setEditTarget(null)}>Cancel</Button>
              <Button onClick={handleEditSave}>Save</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  )
}
