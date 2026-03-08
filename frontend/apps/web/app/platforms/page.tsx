"use client"

import { useState } from "react"
import { Button } from "@workspace/ui/components/button"
import { Skeleton } from "@workspace/ui/components/skeleton"
import { usePlatforms } from "@/hooks/usePlatforms"
import type { JobPlatformResponse } from "@/types"
import { PlatformForm } from "./PlatformForm"
import { PlatformTable } from "./PlatformTable"

export default function PlatformsPage() {
  const { data, isLoading, error, refetch } = usePlatforms()
  const [formOpen, setFormOpen] = useState(false)
  const [selected, setSelected] = useState<JobPlatformResponse | null>(null)

  function openCreate() {
    setSelected(null)
    setFormOpen(true)
  }

  function openEdit(platform: JobPlatformResponse) {
    setSelected(platform)
    setFormOpen(true)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Platforms</h1>
        <Button onClick={openCreate}>New Platform</Button>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {[0, 1, 2].map((i) => <Skeleton key={i} className="h-12 w-full" />)}
        </div>
      ) : error ? (
        <p className="text-sm text-destructive">Failed to load platforms: {error}</p>
      ) : (
        <PlatformTable data={data} onEdit={openEdit} onRefresh={refetch} />
      )}

      <PlatformForm
        selectedPlatform={selected}
        open={formOpen}
        onOpenChange={setFormOpen}
        onSuccess={refetch}
      />
    </div>
  )
}
