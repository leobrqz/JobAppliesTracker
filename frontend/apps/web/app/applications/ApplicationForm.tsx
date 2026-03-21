"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { Button } from "@workspace/ui/components/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@workspace/ui/components/command"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@workspace/ui/components/dialog"
import { Input } from "@workspace/ui/components/input"
import { Label } from "@workspace/ui/components/label"
import { Popover, PopoverContent, PopoverTrigger } from "@workspace/ui/components/popover"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select"
import { useCompanies } from "@/hooks/useCompanies"
import { usePlatforms } from "@/hooks/usePlatforms"
import { useResumeMap } from "@/hooks/useResumeMap"
import { createApplication, updateApplication } from "@/services/applications.service"
import type {
  ApplicationCreate,
  ApplicationResponse,
  ApplicationUpdate,
  CompanyResponse,
  JobPlatformResponse,
} from "@/types"

const NO_RESUME_VALUE = "__none__"

const STAGE_SUGGESTIONS = ["application", "screening", "interview", "assessment", "offer", "closed"]
const STATUS_SUGGESTIONS = ["active", "in_progress", "closed", "rejected", "offered"]

interface FormValues {
  platform_id: string
  job_title: string
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
  const { data: companies } = useCompanies()
  const { map: resumeMap, isLoading: resumesLoading, error: resumesError } = useResumeMap()

  const resumesSorted = useMemo(
    () => Object.values(resumeMap).sort((a, b) => a.name.localeCompare(b.name)),
    [resumeMap],
  )

  const { register, handleSubmit, reset, setValue, watch } = useForm<FormValues>()

  // Company combobox state — managed separately from react-hook-form
  const [companyInput, setCompanyInput] = useState("")
  const [selectedCompanyId, setSelectedCompanyId] = useState<number | null>(null)
  const [companySuggestOpen, setCompanySuggestOpen] = useState(false)
  const companyInputRef = useRef<HTMLInputElement>(null)

  const filteredCompanies = companies.filter((c: CompanyResponse) =>
    c.name.toLowerCase().includes(companyInput.toLowerCase()),
  )

  useEffect(() => {
    if (open) {
      if (selectedApplication) {
        reset({
          platform_id: String(selectedApplication.platform_id),
          job_title: selectedApplication.job_title,
          salary: selectedApplication.salary != null ? String(selectedApplication.salary) : "",
          seniority: selectedApplication.seniority ?? "",
          contract_type: selectedApplication.contract_type ?? "",
          application_url: selectedApplication.application_url ?? "",
          current_stage: selectedApplication.current_stage,
          status: selectedApplication.status,
          applied_at: selectedApplication.applied_at.slice(0, 10),
          resume_id: selectedApplication.resume_id != null ? String(selectedApplication.resume_id) : "",
        })
        setCompanyInput(selectedApplication.company ?? "")
        setSelectedCompanyId(selectedApplication.company_id ?? null)
      } else {
        reset({
          platform_id: "",
          job_title: "",
          salary: "",
          seniority: "",
          contract_type: "",
          application_url: "",
          current_stage: "application",
          status: "active",
          applied_at: new Date().toISOString().slice(0, 10),
          resume_id: "",
        })
        setCompanyInput("")
        setSelectedCompanyId(null)
      }
      setCompanySuggestOpen(false)
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

    const companyName = companyInput.trim() || undefined
    const companyId = selectedCompanyId ?? undefined

    if (isEdit && selectedApplication) {
      const data: ApplicationUpdate = {
        platform_id: parseInt(values.platform_id),
        job_title: values.job_title.trim(),
        company: companyName,
        company_id: companyId,
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
        company: companyName,
        company_id: companyId,
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
  const resumeIdValue = watch("resume_id")

  const resumeSelectValue =
    resumeIdValue && resumeIdValue !== "" ? resumeIdValue : NO_RESUME_VALUE

  const parsedResumeId = resumeIdValue ? parseInt(resumeIdValue, 10) : NaN
  const orphanResumeId =
    resumeIdValue !== "" &&
    resumeIdValue != null &&
    Number.isFinite(parsedResumeId) &&
    resumeMap[parsedResumeId] === undefined
      ? parsedResumeId
      : null
  const hasOrphanResume = orphanResumeId != null

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
                {platforms.map((p: JobPlatformResponse) => (
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
            <div className="flex flex-col gap-1">
              <Label htmlFor="company-input">Company</Label>
              <Popover
                open={companySuggestOpen && filteredCompanies.length > 0}
                onOpenChange={setCompanySuggestOpen}
              >
                <PopoverTrigger asChild>
                  <div className="relative">
                    <Input
                      id="company-input"
                      ref={companyInputRef}
                      value={companyInput}
                      placeholder="Acme Corp"
                      autoComplete="off"
                      onChange={(e) => {
                        const val = e.target.value
                        setCompanyInput(val)
                        // If user deviates from the currently selected company name, unlink it
                        if (selectedCompanyId !== null) {
                          const linked = companies.find((c: CompanyResponse) => c.id === selectedCompanyId)
                          if (linked && val !== linked.name) {
                            setSelectedCompanyId(null)
                          }
                        }
                        setCompanySuggestOpen(val.length > 0)
                      }}
                      onFocus={() => {
                        if (companyInput.length > 0 && filteredCompanies.length > 0) {
                          setCompanySuggestOpen(true)
                        }
                      }}
                    />
                  </div>
                </PopoverTrigger>
                <PopoverContent
                  className="w-[var(--radix-popover-trigger-width)] p-0"
                  align="start"
                  onOpenAutoFocus={(e) => e.preventDefault()}
                >
                  <Command shouldFilter={false}>
                    <CommandList>
                      <CommandGroup>
                        {filteredCompanies.map((c: CompanyResponse) => (
                          <CommandItem
                            key={c.id}
                            value={c.name}
                            onSelect={() => {
                              setCompanyInput(c.name)
                              setSelectedCompanyId(c.id)
                              setCompanySuggestOpen(false)
                              companyInputRef.current?.focus()
                            }}
                          >
                            {c.name}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
              {selectedCompanyId !== null && (
                <p className="text-xs text-muted-foreground">
                  Linked to company record
                </p>
              )}
            </div>
            <div className="flex flex-col gap-1">
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

          <div className="space-y-1">
            <Label>Resume</Label>
            {resumesLoading ? (
              <p className="text-sm text-muted-foreground">Loading resumes…</p>
            ) : resumesError ? (
              <p className="text-sm text-destructive">{resumesError}</p>
            ) : (
              <Select
                value={hasOrphanResume ? String(orphanResumeId) : resumeSelectValue}
                onValueChange={(v) =>
                  setValue("resume_id", v === NO_RESUME_VALUE ? "" : v)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="No resume" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value={NO_RESUME_VALUE}>No resume</SelectItem>
                    {hasOrphanResume ? (
                      <SelectItem value={String(orphanResumeId)}>
                        Resume #{orphanResumeId} (removed or unavailable)
                      </SelectItem>
                    ) : null}
                    {resumesSorted.map((r) => (
                      <SelectItem key={r.id} value={String(r.id)}>
                        {r.name}
                        {r.archived_at ? " (archived)" : ""}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            )}
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
