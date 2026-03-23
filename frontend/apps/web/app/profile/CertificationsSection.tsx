"use client"

import { useMemo, useRef, useState } from "react"
import { toast } from "sonner"
import { Button } from "@workspace/ui/components/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@workspace/ui/components/card"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@workspace/ui/components/dialog"
import { Field, FieldGroup, FieldLabel } from "@workspace/ui/components/field"
import { Input } from "@workspace/ui/components/input"
import { Skeleton } from "@workspace/ui/components/skeleton"
import { Textarea } from "@workspace/ui/components/textarea"
import { useProfileCertifications } from "@/hooks/useProfileCertifications"
import {
  createProfileCertification,
  deleteProfileCertification,
  deleteProfileCertificationAttachment,
  downloadProfileCertificationAttachment,
  reorderProfileCertifications,
  updateProfileCertification,
  uploadProfileCertificationAttachment,
} from "@/services/profile-certifications.service"
import type { CertificationEntryResponse } from "@/types"
import { buildReorderPayload, moveItem } from "./profile-section-utils"

const EMPTY = { name: "", issuer: "", issued_on: "", expires_on: "", credential_id: "", verification_link: "", notes: "" }

export function CertificationsSection() {
  const { data, isLoading, error, refetch } = useProfileCertifications()
  const [open, setOpen] = useState(false)
  const [edit, setEdit] = useState<CertificationEntryResponse | null>(null)
  const [form, setForm] = useState(EMPTY)
  const [selectedAttachment, setSelectedAttachment] = useState<File | null>(null)
  const items = useMemo(() => [...data].sort((a, b) => a.display_order - b.display_order), [data])

  async function save() {
    if (!form.name.trim() || !form.issuer.trim()) return toast.error("Name and issuer are required")
    const payload = {
      name: form.name.trim(),
      issuer: form.issuer.trim(),
      issued_on: form.issued_on || null,
      expires_on: form.expires_on || null,
      credential_id: form.credential_id || null,
      verification_link: form.verification_link || null,
      notes: form.notes || null,
    }
    const result = edit ? await updateProfileCertification(edit.id, payload) : await createProfileCertification(payload)
    if (result.error) return toast.error(result.error)
    if (selectedAttachment && result.data) {
      const formData = new FormData()
      formData.append("file", selectedAttachment)
      const uploadResult = await uploadProfileCertificationAttachment(result.data.id, formData)
      if (uploadResult.error) {
        toast.error(uploadResult.error)
        return
      }
    }
    toast.success(edit ? "Certification updated" : "Certification added")
    setOpen(false)
    setSelectedAttachment(null)
    refetch()
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between gap-2">
          <div className="flex flex-col gap-1">
            <CardTitle className="text-base">Certifications</CardTitle>
            <CardDescription>Track certifications, verification links, and attachments.</CardDescription>
          </div>
          <Button size="sm" onClick={() => { setEdit(null); setForm(EMPTY); setSelectedAttachment(null); setOpen(true) }}>Add Certification</Button>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {isLoading ? <Skeleton className="h-24 w-full" /> : error ? (
          <p className="text-sm text-destructive">Failed to load certifications: {error}</p>
        ) : items.length === 0 ? (
          <p className="text-sm text-muted-foreground">No certifications yet.</p>
        ) : items.map((item, idx) => (
          <div key={item.id} className="flex flex-col gap-2 rounded-md border p-3">
            <div className="flex items-start justify-between gap-2">
              <div className="flex flex-col gap-1">
                <p className="text-sm font-medium">{item.name} - {item.issuer}</p>
                {item.verification_link && <a className="text-xs text-primary underline" href={item.verification_link} target="_blank" rel="noreferrer">Verification link</a>}
                {item.notes && <p className="text-sm text-muted-foreground">{item.notes}</p>}
              </div>
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="sm" disabled={idx === 0} onClick={async () => { const r = await reorderProfileCertifications(buildReorderPayload(moveItem(items, idx, idx - 1))); if (r.error) toast.error(r.error); else refetch() }}>Up</Button>
                <Button variant="ghost" size="sm" disabled={idx === items.length - 1} onClick={async () => { const r = await reorderProfileCertifications(buildReorderPayload(moveItem(items, idx, idx + 1))); if (r.error) toast.error(r.error); else refetch() }}>Down</Button>
                <Button variant="ghost" size="sm" onClick={() => { setEdit(item); setForm({ name: item.name, issuer: item.issuer, issued_on: item.issued_on ?? "", expires_on: item.expires_on ?? "", credential_id: item.credential_id ?? "", verification_link: item.verification_link ?? "", notes: item.notes ?? "" }); setOpen(true) }}>Edit</Button>
                <Button variant="ghost" size="sm" onClick={async () => { const r = await deleteProfileCertification(item.id); if (r.error) toast.error(r.error); else { toast.success("Certification deleted"); refetch() } }}>Delete</Button>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {item.attachment_file_name && (
                <>
                  <Button variant="ghost" size="sm" onClick={() => downloadProfileCertificationAttachment(item.id, item.attachment_file_name!)}>Download</Button>
                  <Button variant="ghost" size="sm" onClick={async () => { const r = await deleteProfileCertificationAttachment(item.id); if (r.error) toast.error(r.error); else { toast.success("Attachment removed"); refetch() } }}>Remove Attachment</Button>
                </>
              )}
            </div>
          </div>
        ))}
      </CardContent>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{edit ? "Edit Certification" : "Add Certification"}</DialogTitle></DialogHeader>
          <FieldGroup>
            <Field><FieldLabel htmlFor="cert-name">Name</FieldLabel><Input id="cert-name" value={form.name} onChange={(e) => setForm((s) => ({ ...s, name: e.target.value }))} /></Field>
            <Field><FieldLabel htmlFor="cert-issuer">Issuer</FieldLabel><Input id="cert-issuer" value={form.issuer} onChange={(e) => setForm((s) => ({ ...s, issuer: e.target.value }))} /></Field>
            <Field><FieldLabel htmlFor="cert-issued">Issued On</FieldLabel><Input id="cert-issued" type="date" value={form.issued_on} onChange={(e) => setForm((s) => ({ ...s, issued_on: e.target.value }))} /></Field>
            <Field><FieldLabel htmlFor="cert-expires">Expires On</FieldLabel><Input id="cert-expires" type="date" value={form.expires_on} onChange={(e) => setForm((s) => ({ ...s, expires_on: e.target.value }))} /></Field>
            <Field><FieldLabel htmlFor="cert-credential">Credential ID</FieldLabel><Input id="cert-credential" value={form.credential_id} onChange={(e) => setForm((s) => ({ ...s, credential_id: e.target.value }))} /></Field>
            <Field><FieldLabel htmlFor="cert-link">Verification Link</FieldLabel><Input id="cert-link" value={form.verification_link} onChange={(e) => setForm((s) => ({ ...s, verification_link: e.target.value }))} /></Field>
            <Field><FieldLabel htmlFor="cert-notes">Notes</FieldLabel><Textarea id="cert-notes" value={form.notes} onChange={(e) => setForm((s) => ({ ...s, notes: e.target.value }))} /></Field>
            <Field>
              <FieldLabel htmlFor="cert-create-attachment">Attachment (PDF/PNG/JPEG)</FieldLabel>
              <Input
                id="cert-create-attachment"
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
