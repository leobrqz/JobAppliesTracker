"use client"

import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { Button } from "@workspace/ui/components/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@workspace/ui/components/dialog"
import { Input } from "@workspace/ui/components/input"
import { Label } from "@workspace/ui/components/label"
import { Textarea } from "@workspace/ui/components/textarea"
import { createCompany, updateCompany } from "@/services/companies.service"
import type { CompanyCreate, CompanyResponse, CompanyUpdate } from "@/types"

interface FormValues {
  name: string
  website: string
  notes: string
}

interface Props {
  selectedCompany: CompanyResponse | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function CompanyForm({ selectedCompany, open, onOpenChange, onSuccess }: Props) {
  const isEdit = selectedCompany !== null
  const { register, handleSubmit, reset } = useForm<FormValues>()

  useEffect(() => {
    if (open) {
      if (selectedCompany) {
        reset({
          name: selectedCompany.name,
          website: selectedCompany.website ?? "",
          notes: selectedCompany.notes ?? "",
        })
      } else {
        reset({ name: "", website: "", notes: "" })
      }
    }
  }, [open, selectedCompany, reset])

  async function onSubmit(values: FormValues) {
    if (!values.name.trim()) {
      toast.error("Company name is required")
      return
    }

    if (isEdit && selectedCompany) {
      const data: CompanyUpdate = {
        name: values.name.trim(),
        website: values.website.trim() || undefined,
        notes: values.notes.trim() || undefined,
      }
      const result = await updateCompany(selectedCompany.id, data)
      if (result.error) { toast.error(result.error); return }
      toast.success("Company updated")
    } else {
      const data: CompanyCreate = {
        name: values.name.trim(),
        website: values.website.trim() || undefined,
        notes: values.notes.trim() || undefined,
      }
      const result = await createCompany(data)
      if (result.error) { toast.error(result.error); return }
      toast.success("Company created — existing applications with this name have been linked automatically")
    }

    onOpenChange(false)
    onSuccess()
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Company" : "New Company"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <Label htmlFor="co-name">Name *</Label>
            <Input id="co-name" {...register("name")} placeholder="e.g. Acme Corp" />
          </div>

          <div className="flex flex-col gap-1">
            <Label htmlFor="co-website">Website</Label>
            <Input id="co-website" type="url" {...register("website")} placeholder="https://acme.com" />
          </div>

          <div className="flex flex-col gap-1">
            <Label htmlFor="co-notes">Notes</Label>
            <Textarea id="co-notes" {...register("notes")} placeholder="Any notes about this company…" rows={3} />
          </div>

          <div className="flex justify-end gap-2 pt-1">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">{isEdit ? "Save Changes" : "Create Company"}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
