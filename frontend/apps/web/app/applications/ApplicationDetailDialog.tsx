"use client"

import type { ReactNode } from "react"
import { CalendarDays, ExternalLink, History, Pencil } from "lucide-react"
import { Badge } from "@workspace/ui/components/badge"
import { Button } from "@workspace/ui/components/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@workspace/ui/components/dialog"
import { Field, FieldGroup, FieldLabel } from "@workspace/ui/components/field"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@workspace/ui/components/tooltip"
import { formatResumeColumn } from "@/lib/formatResumeColumn"
import { formatDate } from "@/lib/display"
import type { ApplicationResponse, CompanyResponse, ResumeResponse } from "@/types"

interface Props {
  application: ApplicationResponse | null
  open: boolean
  onOpenChange: (open: boolean) => void
  platforms: Record<number, string>
  resumeMap: Record<number, ResumeResponse>
  companies: CompanyResponse[]
  archived: boolean
  locale: string
  onEdit: (app: ApplicationResponse) => void
  onOpenHistory: (applicationId: number) => void
  onOpenAppointments: (app: ApplicationResponse) => void
}

function ReadonlyValue({ children }: { children: ReactNode }) {
  return <p className="text-sm break-words">{children}</p>
}

function EmptyValue() {
  return <p className="text-sm text-muted-foreground">—</p>
}

export function ApplicationDetailDialog({
  application,
  open,
  onOpenChange,
  platforms,
  resumeMap,
  companies,
  archived,
  locale,
  onEdit,
  onOpenHistory,
  onOpenAppointments,
}: Props) {
  if (application === null) {
    return null
  }

  const companyRecord =
    application.company_id != null
      ? companies.find((c) => c.id === application.company_id)
      : undefined

  function closeAndEdit() {
    onOpenChange(false)
    onEdit(application)
  }

  function closeAndHistory() {
    onOpenChange(false)
    onOpenHistory(application.id)
  }

  function closeAndAppointments() {
    onOpenChange(false)
    onOpenAppointments(application)
  }

  const salaryNum =
    application.salary != null && application.salary !== "" ? Number(application.salary) : null
  const salaryText =
    salaryNum != null && !Number.isNaN(salaryNum)
      ? new Intl.NumberFormat(locale, { maximumFractionDigits: 2 }).format(salaryNum)
      : null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[min(90vh,720px)] overflow-y-auto sm:max-w-lg">
        <TooltipProvider>
          <DialogHeader className="flex flex-col gap-4">
            <div className="flex flex-col gap-1 pr-8">
              <DialogTitle className="text-left">{application.job_title}</DialogTitle>
              {application.company ? (
                <p className="text-sm text-muted-foreground">{application.company}</p>
              ) : null}
            </div>
            <div className="flex flex-wrap items-center gap-1">
              {!archived && (
                <>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button type="button" variant="ghost" size="sm" onClick={closeAndAppointments}>
                        <CalendarDays />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Appointments</TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button type="button" variant="ghost" size="sm" onClick={closeAndHistory}>
                        <History />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>History</TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button type="button" variant="ghost" size="sm" onClick={closeAndEdit}>
                        <Pencil />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Edit</TooltipContent>
                  </Tooltip>
                </>
              )}
              {application.application_url ? (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="sm" asChild>
                      <a href={application.application_url} target="_blank" rel="noopener noreferrer">
                        <ExternalLink />
                      </a>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Open application URL</TooltipContent>
                </Tooltip>
              ) : null}
            </div>
          </DialogHeader>

          <FieldGroup className="pt-2">
          <Field className="gap-1">
            <FieldLabel>Platform</FieldLabel>
            <ReadonlyValue>
              {platforms[application.platform_id] ?? application.platform_id}
            </ReadonlyValue>
          </Field>

          <Field className="gap-1">
            <FieldLabel>Company</FieldLabel>
            {application.company ? (
              companyRecord?.website ? (
                <a
                  href={companyRecord.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-primary underline-offset-4 hover:underline"
                >
                  {application.company}
                </a>
              ) : (
                <ReadonlyValue>{application.company}</ReadonlyValue>
              )
            ) : (
              <EmptyValue />
            )}
          </Field>

          <Field className="gap-1">
            <FieldLabel>Salary</FieldLabel>
            {salaryText != null ? <ReadonlyValue>{salaryText}</ReadonlyValue> : <EmptyValue />}
          </Field>

          <Field className="gap-1">
            <FieldLabel>Seniority</FieldLabel>
            {application.seniority ? (
              <ReadonlyValue>{application.seniority}</ReadonlyValue>
            ) : (
              <EmptyValue />
            )}
          </Field>

          <Field className="gap-1">
            <FieldLabel>Contract type</FieldLabel>
            {application.contract_type ? (
              <ReadonlyValue>{application.contract_type}</ReadonlyValue>
            ) : (
              <EmptyValue />
            )}
          </Field>

          <Field className="gap-1">
            <FieldLabel>Application URL</FieldLabel>
            {application.application_url ? (
              <a
                href={application.application_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-primary underline-offset-4 hover:underline break-all"
              >
                {application.application_url}
              </a>
            ) : (
              <EmptyValue />
            )}
          </Field>

          <Field className="gap-1">
            <FieldLabel>Current stage</FieldLabel>
            <div className="flex flex-col gap-1">
              <Badge variant="secondary">{application.current_stage}</Badge>
              <p className="text-xs text-muted-foreground">
                Stage changes are made via the History dialog.
              </p>
            </div>
          </Field>

          <Field className="gap-1">
            <FieldLabel>Status</FieldLabel>
            <Badge variant="outline">{application.status}</Badge>
          </Field>

          <Field className="gap-1">
            <FieldLabel>Date applied</FieldLabel>
            <ReadonlyValue>{formatDate(application.applied_at, locale)}</ReadonlyValue>
          </Field>

          <Field className="gap-1">
            <FieldLabel>Resume</FieldLabel>
            {application.resume_id != null ? (
              <ReadonlyValue>
                {formatResumeColumn(application.resume_id, resumeMap)}
              </ReadonlyValue>
            ) : (
              <EmptyValue />
            )}
          </Field>

          <Field className="gap-1">
            <FieldLabel>Created</FieldLabel>
            <ReadonlyValue>{formatDate(application.created_at, locale)}</ReadonlyValue>
          </Field>

          <Field className="gap-1">
            <FieldLabel>Last updated</FieldLabel>
            <ReadonlyValue>{formatDate(application.updated_at, locale)}</ReadonlyValue>
          </Field>

          {application.archived_at ? (
            <Field className="gap-1">
              <FieldLabel>Archived</FieldLabel>
              <ReadonlyValue>{formatDate(application.archived_at, locale)}</ReadonlyValue>
            </Field>
          ) : null}
          </FieldGroup>
        </TooltipProvider>
      </DialogContent>
    </Dialog>
  )
}
