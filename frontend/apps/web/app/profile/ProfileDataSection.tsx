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
import { Separator } from "@workspace/ui/components/separator"
import { Skeleton } from "@workspace/ui/components/skeleton"
import { useProfileData } from "@/hooks/useProfileData"
import { createProfileData, deleteProfileData, updateProfileData } from "@/services/profile-data.service"
import type { ProfileDataResponse } from "@/types"

const TYPE_OPTIONS = ["text", "link", "email"]

interface PresetField {
  label: string
  type: string
  placeholder: string
}

const PRESET_FIELDS: PresetField[] = [
  { label: "Full Name", type: "text", placeholder: "Your full name" },
  { label: "Phone", type: "text", placeholder: "+1 234 567 8900" },
  { label: "Email", type: "email", placeholder: "you@example.com" },
  { label: "LinkedIn", type: "link", placeholder: "https://linkedin.com/in/your-handle" },
  { label: "GitHub", type: "link", placeholder: "https://github.com/your-handle" },
  { label: "Portfolio", type: "link", placeholder: "https://yoursite.com" },
]

const PRESET_LABELS = new Set(PRESET_FIELDS.map((f) => f.label))

interface EntryFormState {
  label: string
  value: string
  type: string
  labelLocked: boolean
}

const DEFAULT_FORM: EntryFormState = { label: "", value: "", type: "text", labelLocked: false }

function EntryRow({
  entry,
  onEdit,
  onCopy,
  onDelete,
}: {
  entry: ProfileDataResponse
  onEdit: () => void
  onCopy: () => void
  onDelete: () => void
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-2">
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm">{entry.value}</p>
      </div>
      <div className="flex shrink-0 items-center gap-1">
        <Button variant="ghost" size="sm" onClick={onCopy}>Copy</Button>
        <Button variant="ghost" size="sm" onClick={onEdit}>Edit</Button>
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
                onClick={onDelete}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  )
}

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

  function openPresetFill(preset: PresetField) {
    setEditTarget(null)
    setForm({ label: preset.label, value: "", type: preset.type, labelLocked: true })
    setFormOpen(true)
  }

  function openEdit(entry: ProfileDataResponse) {
    setEditTarget(entry)
    setForm({
      label: entry.label,
      value: entry.value,
      type: entry.type,
      labelLocked: PRESET_LABELS.has(entry.label),
    })
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
      toast.success("Entry saved")
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

  const dataMap = new Map(data.map((e) => [e.label, e]))
  const presetEntries = PRESET_FIELDS.map((f) => ({ preset: f, entry: dataMap.get(f.label) ?? null }))
  const customEntries = data.filter((e) => !PRESET_LABELS.has(e.label))

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">Profile Data</CardTitle>
          <Button size="sm" variant="outline" onClick={openCreate}>Add Custom</Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-1">
        {isLoading ? (
          <div className="space-y-2">
            {[0, 1, 2, 3, 4, 5].map((i) => <Skeleton key={i} className="h-10 w-full" />)}
          </div>
        ) : error ? (
          <p className="text-sm text-destructive">Failed to load profile data: {error}</p>
        ) : (
          <>
            {presetEntries.map(({ preset, entry }) => (
              <div key={preset.label}>
                <div className="flex items-center justify-between gap-2">
                  <span className="w-28 shrink-0 text-xs font-medium text-muted-foreground">
                    {preset.label}
                  </span>
                  {entry ? (
                    <EntryRow
                      entry={entry}
                      onEdit={() => openEdit(entry)}
                      onCopy={() => handleCopy(entry.value)}
                      onDelete={() => handleDelete(entry.id)}
                    />
                  ) : (
                    <div className="flex flex-1 items-center justify-between py-2">
                      <span className="text-sm text-muted-foreground italic">Not set</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openPresetFill(preset)}
                      >
                        Add
                      </Button>
                    </div>
                  )}
                </div>
                <Separator className="my-1" />
              </div>
            ))}

            {customEntries.length > 0 && (
              <div className="pt-2">
                <p className="mb-2 text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Custom
                </p>
                <ul className="space-y-1">
                  {customEntries.map((entry) => (
                    <li key={entry.id} className="rounded-md border px-3">
                      <div className="flex items-center gap-2">
                        <span className="w-28 shrink-0 text-xs font-medium text-muted-foreground">
                          {entry.label}
                        </span>
                        <EntryRow
                          entry={entry}
                          onEdit={() => openEdit(entry)}
                          onCopy={() => handleCopy(entry.value)}
                          onDelete={() => handleDelete(entry.id)}
                        />
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </>
        )}
      </CardContent>

      <Dialog open={formOpen} onOpenChange={(open) => { if (!open) closeForm() }}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>
              {editTarget ? `Edit — ${form.label}` : form.labelLocked ? `Add — ${form.label}` : "New Custom Entry"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            {!form.labelLocked && (
              <div className="space-y-1">
                <Label htmlFor="pd-label">Label</Label>
                <Input
                  id="pd-label"
                  value={form.label}
                  onChange={(e) => setForm((f) => ({ ...f, label: e.target.value }))}
                  placeholder="e.g. Twitter"
                />
              </div>
            )}
            <div className="space-y-1">
              <Label htmlFor="pd-value">Value</Label>
              <Input
                id="pd-value"
                value={form.value}
                onChange={(e) => setForm((f) => ({ ...f, value: e.target.value }))}
                placeholder={
                  PRESET_FIELDS.find((f) => f.label === form.label)?.placeholder ?? "Value…"
                }
                autoFocus
              />
            </div>
            {!form.labelLocked && (
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
            )}
            <div className="flex justify-end gap-2 pt-1">
              <Button variant="outline" onClick={closeForm}>Cancel</Button>
              <Button onClick={handleSave}>{editTarget ? "Save" : "Add"}</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  )
}
