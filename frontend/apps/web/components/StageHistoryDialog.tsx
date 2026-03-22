"use client"

import { useEffect, useState } from "react"
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
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@workspace/ui/components/dialog"
import { Input } from "@workspace/ui/components/input"
import { Label } from "@workspace/ui/components/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@workspace/ui/components/select"
import { Separator } from "@workspace/ui/components/separator"
import { Textarea } from "@workspace/ui/components/textarea"
import { useApplicationHistory } from "@/hooks/useApplicationHistory"
import { advanceStage, deleteHistoryEntry, updateHistoryEntry } from "@/services/applications.service"
import type { ApplicationHistoryResponse } from "@/types"

const STAGE_OPTIONS = ["application", "screening", "interview", "assessment", "offer", "closed"]

interface Props {
  applicationId: number
  open: boolean
  onOpenChange: (open: boolean) => void
  onStageChanged?: () => void
}

function formatDateTime(iso: string): string {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso))
}

export function StageHistoryDialog({ applicationId, open, onOpenChange, onStageChanged }: Props) {
  const { data: history, isLoading, refetch } = useApplicationHistory(open ? applicationId : null)

  const [newStage, setNewStage] = useState("")
  const [newDate, setNewDate] = useState(() => new Date().toISOString().slice(0, 16))
  const [newNotes, setNewNotes] = useState("")
  const [submitting, setSubmitting] = useState(false)

  const [editingEntry, setEditingEntry] = useState<ApplicationHistoryResponse | null>(null)
  const [editStage, setEditStage] = useState("")
  const [editDate, setEditDate] = useState("")
  const [editNotes, setEditNotes] = useState("")
  const [editSubmitting, setEditSubmitting] = useState(false)

  useEffect(() => {
    if (!open) {
      setEditingEntry(null)
    }
  }, [open])

  function openEdit(entry: ApplicationHistoryResponse) {
    setEditingEntry(entry)
    setEditStage(entry.stage)
    setEditDate(new Date(entry.date).toISOString().slice(0, 16))
    setEditNotes(entry.notes ?? "")
  }

  async function handleAddEntry() {
    if (!newStage) {
      toast.error("Stage is required")
      return
    }
    setSubmitting(true)
    const result = await advanceStage(applicationId, {
      stage: newStage,
      date: new Date(newDate).toISOString(),
      notes: newNotes.trim() || undefined,
    })
    setSubmitting(false)
    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success("Stage added")
      setNewStage("")
      setNewDate(new Date().toISOString().slice(0, 16))
      setNewNotes("")
      await refetch()
      onStageChanged?.()
    }
  }

  async function handleDelete(historyId: number) {
    const result = await deleteHistoryEntry(applicationId, historyId)
    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success("Entry deleted")
      await refetch()
      onStageChanged?.()
    }
  }

  async function handleSaveEdit() {
    if (!editingEntry) return
    if (!editStage.trim()) {
      toast.error("Stage is required")
      return
    }
    setEditSubmitting(true)
    const result = await updateHistoryEntry(applicationId, editingEntry.id, {
      stage: editStage.trim(),
      date: new Date(editDate).toISOString(),
      notes: editNotes.trim() === "" ? null : editNotes.trim(),
    })
    setEditSubmitting(false)
    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success("Entry updated")
      setEditingEntry(null)
      await refetch()
      onStageChanged?.()
    }
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Stage History</DialogTitle>
          </DialogHeader>

          <div className="flex max-h-64 flex-col gap-2 overflow-y-auto pr-1">
            {isLoading ? (
              <p className="text-sm text-muted-foreground">Loading…</p>
            ) : history.length === 0 ? (
              <p className="text-sm text-muted-foreground">No history entries.</p>
            ) : (
              history.map((entry) => (
                <div key={entry.id} className="flex items-start justify-between gap-2 rounded-md border p-3">
                  <div className="min-w-0">
                    <p className="text-sm font-medium capitalize">{entry.stage}</p>
                    <p className="text-xs text-muted-foreground">{formatDateTime(entry.date)}</p>
                    {entry.notes && <p className="mt-1 text-xs text-muted-foreground">{entry.notes}</p>}
                  </div>
                  <div className="flex shrink-0 flex-col gap-1">
                    <Button variant="ghost" size="sm" className="h-8" onClick={() => openEdit(entry)}>
                      Edit
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 text-destructive hover:text-destructive">
                          Delete
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete history entry?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This will remove the &quot;{entry.stage}&quot; stage entry. The current stage will be
                            recalculated from remaining entries.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDelete(entry.id)}>Delete</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              ))
            )}
          </div>

          <Separator />

          <div className="space-y-3">
            <p className="text-sm font-medium">Add Stage Entry</p>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor="new-stage">Stage</Label>
                <Select value={newStage} onValueChange={setNewStage}>
                  <SelectTrigger id="new-stage">
                    <SelectValue placeholder="Select stage…" />
                  </SelectTrigger>
                  <SelectContent>
                    {STAGE_OPTIONS.map((s) => (
                      <SelectItem key={s} value={s}>
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label htmlFor="new-date">Date &amp; Time</Label>
                <Input
                  id="new-date"
                  type="datetime-local"
                  value={newDate}
                  onChange={(e) => setNewDate(e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-1">
              <Label htmlFor="new-notes">Notes (optional)</Label>
              <Textarea
                id="new-notes"
                placeholder="Any additional notes…"
                value={newNotes}
                onChange={(e) => setNewNotes(e.target.value)}
                rows={2}
              />
            </div>
            <Button onClick={handleAddEntry} disabled={submitting} className="w-full">
              {submitting ? "Adding…" : "Add Entry"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={editingEntry !== null} onOpenChange={(v) => !v && setEditingEntry(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit history entry</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-3">
            <div className="space-y-1">
              <Label htmlFor="edit-stage">Stage</Label>
              <Select value={editStage} onValueChange={setEditStage}>
                <SelectTrigger id="edit-stage">
                  <SelectValue placeholder="Select stage…" />
                </SelectTrigger>
                <SelectContent>
                  {STAGE_OPTIONS.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label htmlFor="edit-date">Date &amp; Time</Label>
              <Input
                id="edit-date"
                type="datetime-local"
                value={editDate}
                onChange={(e) => setEditDate(e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="edit-notes">Notes</Label>
              <Textarea
                id="edit-notes"
                placeholder="Optional notes…"
                value={editNotes}
                onChange={(e) => setEditNotes(e.target.value)}
                rows={2}
              />
            </div>
          </div>
          <DialogFooter className="flex flex-row flex-wrap gap-2 sm:justify-end">
            <Button type="button" variant="outline" onClick={() => setEditingEntry(null)}>
              Cancel
            </Button>
            <Button type="button" onClick={handleSaveEdit} disabled={editSubmitting}>
              {editSubmitting ? "Saving…" : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
