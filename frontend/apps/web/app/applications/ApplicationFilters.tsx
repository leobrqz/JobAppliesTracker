"use client"

import { Label } from "@workspace/ui/components/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@workspace/ui/components/select"
import { useCompanies } from "@/hooks/useCompanies"
import { usePlatforms } from "@/hooks/usePlatforms"
import type { ApplicationFilters, CompanyResponse, JobPlatformResponse } from "@/types"

const STAGE_OPTIONS = ["application", "screening", "interview", "assessment", "offer", "closed"]
const STATUS_OPTIONS = ["active", "in_progress", "closed", "rejected", "offered"]

const ALL_SENTINEL = "__all__"

interface Props {
  filters: ApplicationFilters
  onChange: (filters: ApplicationFilters) => void
}

export function ApplicationFiltersBar({ filters, onChange }: Props) {
  const { data: platforms } = usePlatforms()
  const { data: companies } = useCompanies()

  function update(patch: Partial<ApplicationFilters>) {
    onChange({ ...filters, ...patch })
  }

  return (
    <div className="contents">
      <div className="space-y-1">
        <Label className="text-xs">Status</Label>
        <Select
          value={filters.status ?? ALL_SENTINEL}
          onValueChange={(v: string) => update({ status: v === ALL_SENTINEL ? undefined : v })}
        >
          <SelectTrigger className="w-36">
            <SelectValue placeholder="All statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL_SENTINEL}>All statuses</SelectItem>
            {STATUS_OPTIONS.map((s) => (
              <SelectItem key={s} value={s}>
                {s}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1">
        <Label className="text-xs">Stage</Label>
        <Select
          value={filters.stage ?? ALL_SENTINEL}
          onValueChange={(v: string) => update({ stage: v === ALL_SENTINEL ? undefined : v })}
        >
          <SelectTrigger className="w-36">
            <SelectValue placeholder="All stages" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL_SENTINEL}>All stages</SelectItem>
            {STAGE_OPTIONS.map((s) => (
              <SelectItem key={s} value={s}>
                {s}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1">
        <Label className="text-xs">Platform</Label>
        <Select
          value={filters.platform_id != null ? String(filters.platform_id) : ALL_SENTINEL}
          onValueChange={(v: string) =>
            update({ platform_id: v === ALL_SENTINEL ? undefined : parseInt(v) })
          }
        >
          <SelectTrigger className="w-40">
            <SelectValue placeholder="All platforms" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL_SENTINEL}>All platforms</SelectItem>
            {platforms.map((p: JobPlatformResponse) => (
              <SelectItem key={p.id} value={String(p.id)}>
                {p.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {companies.length > 0 && (
        <div className="space-y-1">
          <Label className="text-xs">Company</Label>
          <Select
            value={filters.company_id != null ? String(filters.company_id) : ALL_SENTINEL}
            onValueChange={(v: string) =>
              update({ company_id: v === ALL_SENTINEL ? undefined : parseInt(v) })
            }
          >
            <SelectTrigger className="w-40">
              <SelectValue placeholder="All companies" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL_SENTINEL}>All companies</SelectItem>
              {companies.map((c: CompanyResponse) => (
                <SelectItem key={c.id} value={String(c.id)}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      <div className="space-y-1">
        <Label className="text-xs">View</Label>
        <Select
          value={filters.archived ? "archived" : "active"}
          onValueChange={(v: string) => update({ archived: v === "archived" })}
        >
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="archived">Archived</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}
