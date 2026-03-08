"use client"

import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { Button } from "@workspace/ui/components/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@workspace/ui/components/dialog"
import { Input } from "@workspace/ui/components/input"
import { Label } from "@workspace/ui/components/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@workspace/ui/components/select"
import { createApplication, updateApplication } from "@/services/applications.service"
import { usePlatforms } from "@/hooks/usePlatforms"
import type { ApplicationCreate, ApplicationResponse, ApplicationUpdate } from "@/types"

const STAGE_SUGGESTIONS = ["application", "screening", "interview", "assessment", "offer", "closed"]
const STATUS_SUGGESTIONS = ["active", "in_progress", "closed", "rejected", "offered"]

interface FormValues {
  platform_id: string
  job_title: string
  company: string
  salary: string
  seniority: string
  contract_type: string
  application_url: string
  current_stage: string
  status: string
  applied_at: string
  resume_id: string
}

interface Props {
  selectedApplication: ApplicationResponse | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function ApplicationForm({ selectedApplication, open, onOpenChange, onSuccess }: Props) {
  const isEdit = selectedApplication !== null
  const { data: platforms } = usePlatforms()

  const { register, handleSubmit, reset, setValue, watch } = useForm<FormValues>()

  useEffect(() => {
    if (open) {
      if (selectedApplication) {
        reset({
          platform_id: String(selectedApplication.platform_id),
          job_title: selectedApplication.job_title,
          company: selectedApplication.company ?? "",
          salary: selectedApplication.salary != null ? String(selectedApplication.salary) : "",
          seniority: selectedApplication.seniority ?? "",
          contract_type: selectedApplication.contract_type ?? "",
          application_url: selectedApplication.application_url ?? "",
          current_stage: selectedApplication.current_stage,
          status: selectedApplication.status,
          applied_at: selectedApplication.applied_at.slice(0, 10),
          resume_id: selectedApplication.resume_id != null ? String(selectedApplication.resume_id) : "",
        })
      } else {
        reset({
          platform_id: "",
          job_title: "",
          company: "",
          salary: "",
          seniority: "",
          contract_type: "",
          application_url: "",
          current_stage: "application",
          status: "active",
          applied_at: new Date().toISOString().slice(0, 10),
          resume_id: "",
        })
      }
    }
  }, [open, selectedApplication, reset])

  async function onSubmit(values: FormValues) {
    if (!values.platform_id) {
      toast.error("Platform is required")
      return
    }
    if (!values.job_title.trim()) {
      toast.error("Job title is required")
      return
    }

    if (isEdit && selectedApplication) {
      const data: ApplicationUpdate = {
        platform_id: parseInt(values.platform_id),
        job_title: values.job_title.trim(),
        company: values.company.trim() || undefined,
        salary: values.salary ? parseFloat(values.salary) : undefined,
        seniority: values.seniority.trim() || undefined,
        contract_type: values.contract_type.trim() || undefined,
        application_url: values.application_url.trim() || undefined,
        status: values.status,
        applied_at: values.applied_at as unknown as string,
        resume_id: values.resume_id ? parseInt(values.resume_id) : undefined,
      }
      const result = await updateApplication(selectedApplication.id, data)
      if (result.error) {
        toast.error(result.error)
        return
      }
      toast.success("Application updated")
    } else {
      const data: ApplicationCreate = {
        platform_id: parseInt(values.platform_id),
        job_title: values.job_title.trim(),
        company: values.company.trim() || undefined,
        salary: values.salary ? parseFloat(values.salary) : undefined,
        seniority: values.seniority.trim() || undefined,
        contract_type: values.contract_type.trim() || undefined,
        application_url: values.application_url.trim() || undefined,
        current_stage: values.current_stage,
        status: values.status,
        applied_at: values.applied_at as unknown as string,
        resume_id: values.resume_id ? parseInt(values.resume_id) : undefined,
      }
      const result = await createApplication(data)
      if (result.error) {
        toast.error(result.error)
        return
      }
      toast.success("Application created")
    }

    onOpenChange(false)
    onSuccess()
  }

  const currentStageValue = watch("current_stage")
  const statusValue = watch("status")
  const platformValue = watch("platform_id")

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Application" : "New Application"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1">
            <Label>Platform *</Label>
            <Select value={platformValue} onValueChange={(v) => setValue("platform_id", v)}>
              <SelectTrigger>
                <SelectValue placeholder="Select platform" />
              </SelectTrigger>
              <SelectContent>
                {platforms.map((p) => (
                  <SelectItem key={p.id} value={String(p.id)}>
                    {p.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1">
            <Label htmlFor="job_title">Job Title *</Label>
            <Input id="job_title" {...register("job_title")} placeholder="e.g. Backend Engineer" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label htmlFor="company">Company</Label>
              <Input id="company" {...register("company")} placeholder="Acme Corp" />
            </div>
            <div className="space-y-1">
              <Label htmlFor="salary">Salary</Label>
              <Input id="salary" type="number" step="0.01" {...register("salary")} placeholder="0.00" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label htmlFor="seniority">Seniority</Label>
              <Input id="seniority" {...register("seniority")} placeholder="e.g. Senior" />
            </div>
            <div className="space-y-1">
              <Label htmlFor="contract_type">Contract Type</Label>
              <Input id="contract_type" {...register("contract_type")} placeholder="e.g. Full-time" />
            </div>
          </div>

          <div className="space-y-1">
            <Label htmlFor="application_url">Application URL</Label>
            <Input id="application_url" type="url" {...register("application_url")} placeholder="https://…" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label>Current Stage {isEdit ? "(read-only)" : "*"}</Label>
              {isEdit ? (
                <div>
                  <Input value={currentStageValue} readOnly className="cursor-not-allowed opacity-60" />
                  <p className="mt-1 text-xs text-muted-foreground">
                    Stage changes are made via the History dialog
                  </p>
                </div>
              ) : (
                <Select value={currentStageValue} onValueChange={(v) => setValue("current_stage", v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select stage" />
                  </SelectTrigger>
                  <SelectContent>
                    {STAGE_SUGGESTIONS.map((s) => (
                      <SelectItem key={s} value={s}>
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>

            <div className="space-y-1">
              <Label>Status *</Label>
              <Select value={statusValue} onValueChange={(v) => setValue("status", v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  {STATUS_SUGGESTIONS.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-1">
            <Label htmlFor="applied_at">Date Applied *</Label>
            <Input id="applied_at" type="date" {...register("applied_at")} />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">{isEdit ? "Save Changes" : "Create Application"}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
