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
import { Button } from "@workspace/ui/components/button"
import { Card, CardContent, CardHeader, CardTitle } from "@workspace/ui/components/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@workspace/ui/components/dialog"
import { Input } from "@workspace/ui/components/input"
import { Label } from "@workspace/ui/components/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@workspace/ui/components/select"
import { Skeleton } from "@workspace/ui/components/skeleton"
import { useProfileData } from "@/hooks/useProfileData"
import { createProfileData, deleteProfileData, updateProfileData } from "@/services/profile-data.service"
import type { ProfileDataResponse } from "@/types"

const TYPE_OPTIONS = ["text", "link", "email"]

interface EntryFormState {
  label: string
  value: string
  type: string
}

const DEFAULT_FORM: EntryFormState = { label: "", value: "", type: "text" }

export function ProfileDataSection() {
  const { data, isLoading, error, refetch } = useProfileData()
  const [formOpen, setFormOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<ProfileDataResponse | null>(null)
  const [form, setForm] = useState<EntryFormState>(DEFAULT_FORM)

  function openCreate() {
    setEditTarget(null)
    setForm(DEFAULT_FORM)
    setFormOpen(true)
  }

  function openEdit(entry: ProfileDataResponse) {
    setEditTarget(entry)
    setForm({ label: entry.label, value: entry.value, type: entry.type })
    setFormOpen(true)
  }

  function closeForm() {
    setFormOpen(false)
    setEditTarget(null)
  }

  async function handleSave() {
    if (!form.label.trim() || !form.value.trim()) {
      toast.error("Label and value are required")
      return
    }

    if (editTarget) {
      const result = await updateProfileData(editTarget.id, {
        label: form.label.trim(),
        value: form.value.trim(),
        type: form.type,
      })
      if (result.error) { toast.error(result.error); return }
      toast.success("Entry updated")
    } else {
      const result = await createProfileData({
        label: form.label.trim(),
        value: form.value.trim(),
        type: form.type,
      })
      if (result.error) { toast.error(result.error); return }
      toast.success("Entry created")
    }

    closeForm()
    refetch()
  }

  async function handleCopy(value: string) {
    try {
      await navigator.clipboard.writeText(value)
      toast.success("Copied to clipboard")
    } catch {
      toast.error("Failed to copy")
    }
  }

  async function handleDelete(id: number) {
    const result = await deleteProfileData(id)
    if (result.error) toast.error(result.error)
    else { toast.success("Entry deleted"); refetch() }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">Profile Data</CardTitle>
          <Button size="sm" onClick={openCreate}>Add Entry</Button>
        </div>
      </CardHeader>

      <CardContent>
        {isLoading ? (
          <div className="space-y-2">
            {[0, 1, 2].map((i) => <Skeleton key={i} className="h-10 w-full" />)}
          </div>
        ) : error ? (
          <p className="text-sm text-destructive">Failed to load profile data: {error}</p>
        ) : data.length === 0 ? (
          <p className="text-sm text-muted-foreground">No profile data entries yet.</p>
        ) : (
          <ul className="space-y-2">
            {data.map((entry) => (
              <li key={entry.id} className="flex items-center justify-between gap-4 rounded-md border p-3">
                <div className="min-w-0">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    {entry.label}
                  </p>
                  <p className="truncate text-sm">{entry.value}</p>
                </div>
                <div className="flex shrink-0 items-center gap-1">
                  <Button variant="ghost" size="sm" onClick={() => handleCopy(entry.value)}>
                    Copy
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => openEdit(entry)}>
                    Edit
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive">
                        Delete
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete entry?</AlertDialogTitle>
                        <AlertDialogDescription>
                          &quot;{entry.label}&quot; will be permanently deleted.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDelete(entry.id)}
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

      <Dialog open={formOpen} onOpenChange={(open) => { if (!open) closeForm() }}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>{editTarget ? "Edit Entry" : "New Entry"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1">
              <Label htmlFor="pd-label">Label</Label>
              <Input
                id="pd-label"
                value={form.label}
                onChange={(e) => setForm((f) => ({ ...f, label: e.target.value }))}
                placeholder="e.g. GitHub"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="pd-value">Value</Label>
              <Input
                id="pd-value"
                value={form.value}
                onChange={(e) => setForm((f) => ({ ...f, value: e.target.value }))}
                placeholder="e.g. https://github.com/…"
              />
            </div>
            <div className="space-y-1">
              <Label>Type</Label>
              <Select value={form.type} onValueChange={(v) => setForm((f) => ({ ...f, type: v }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TYPE_OPTIONS.map((t) => (
                    <SelectItem key={t} value={t}>{t}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end gap-2 pt-1">
              <Button variant="outline" onClick={closeForm}>Cancel</Button>
              <Button onClick={handleSave}>{editTarget ? "Save" : "Create"}</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  )
}
