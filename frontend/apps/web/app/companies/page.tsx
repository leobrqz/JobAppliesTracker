"use client"

import { useState } from "react"
import { Button } from "@workspace/ui/components/button"
import { Skeleton } from "@workspace/ui/components/skeleton"
import { useCompanies } from "@/hooks/useCompanies"
import type { CompanyResponse } from "@/types"
import { CompanyForm } from "./CompanyForm"
import { CompanyTable } from "./CompanyTable"

export default function CompaniesPage() {
  const { data, isLoading, error, refetch } = useCompanies()
  const [formOpen, setFormOpen] = useState(false)
  const [selected, setSelected] = useState<CompanyResponse | null>(null)

  function openCreate() {
    setSelected(null)
    setFormOpen(true)
  }

  function openEdit(company: CompanyResponse) {
    setSelected(company)
    setFormOpen(true)
  }

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-semibold">Companies</h1>

      <div className="flex justify-end">
        <Button onClick={openCreate}>New Company</Button>
      </div>

      {isLoading ? (
        <div className="flex flex-col gap-2">
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      ) : error ? (
        <p className="text-sm text-destructive">Failed to load companies: {error}</p>
      ) : (
        <CompanyTable data={data} onEdit={openEdit} onRefresh={refetch} />
      )}

      <CompanyForm
        selectedCompany={selected}
        open={formOpen}
        onOpenChange={setFormOpen}
        onSuccess={refetch}
      />
    </div>
  )
}
