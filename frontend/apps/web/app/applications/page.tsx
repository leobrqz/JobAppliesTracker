"use client"

import Link from "next/link"
import { useState } from "react"
import { Settings } from "lucide-react"
import { Button } from "@workspace/ui/components/button"
import { Skeleton } from "@workspace/ui/components/skeleton"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@workspace/ui/components/tooltip"
import { useApplications } from "@/hooks/useApplications"
import { useCompanies } from "@/hooks/useCompanies"
import { usePlatforms } from "@/hooks/usePlatforms"
import { useResumeMap } from "@/hooks/useResumeMap"
import type { ApplicationFilters, ApplicationResponse } from "@/types"
import { ApplicationFiltersBar } from "./ApplicationFilters"
import { ApplicationForm } from "./ApplicationForm"
import { ApplicationTable } from "./ApplicationTable"

export default function ApplicationsPage() {
  const [filters, setFilters] = useState<ApplicationFilters>({ archived: false })
  const [formOpen, setFormOpen] = useState(false)
  const [selected, setSelected] = useState<ApplicationResponse | null>(null)

  const { data, isLoading, error, refetch, setData } = useApplications(filters)
  const { data: platforms } = usePlatforms()
  const { map: resumeMap } = useResumeMap()
  const { data: companies } = useCompanies()

  const platformMap = Object.fromEntries(platforms.map((p) => [p.id, p.name])) as Record<number, string>

  function openCreate() {
    setSelected(null)
    setFormOpen(true)
  }

  function openEdit(application: ApplicationResponse) {
    setSelected(application)
    setFormOpen(true)
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Applications</h1>

      <div className="flex flex-wrap items-end gap-4">
        <ApplicationFiltersBar filters={filters} onChange={setFilters} />
        <div className="ml-auto flex items-center gap-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="icon" asChild>
                  <Link href="/settings#applications-table" aria-label="Customize table columns">
                    <Settings />
                  </Link>
                </Button>
              </TooltipTrigger>
              <TooltipContent>Customize table columns</TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <Button onClick={openCreate}>New Application</Button>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      ) : error ? (
        <p className="text-sm text-destructive">Failed to load applications: {error}</p>
      ) : (
        <ApplicationTable
          data={data}
          platforms={platformMap}
          resumeMap={resumeMap}
          companies={companies}
          archived={filters.archived ?? false}
          onEdit={openEdit}
          onRefresh={(updater) => {
            if (updater) {
              setData((current) => updater(current))
            } else {
              refetch()
            }
          }}
        />
      )}

      <ApplicationForm
        selectedApplication={selected}
        open={formOpen}
        onOpenChange={setFormOpen}
        onSuccess={refetch}
      />
    </div>
  )
}
