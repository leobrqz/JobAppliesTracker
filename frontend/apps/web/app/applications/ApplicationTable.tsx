"use client"

import { useCallback, useMemo, useState } from "react"
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type SortingState,
} from "@tanstack/react-table"
import { Archive, CalendarDays, ExternalLink, History, Pencil, RotateCcw, Trash2 } from "lucide-react"
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
import { Badge } from "@workspace/ui/components/badge"
import { Button } from "@workspace/ui/components/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@workspace/ui/components/table"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@workspace/ui/components/tooltip"
import { cn } from "@workspace/ui/lib/utils"
import { AppointmentListDialog } from "@/components/AppointmentListDialog"
import { StageHistoryDialog } from "@/components/StageHistoryDialog"
import { formatCompensation } from "@/lib/compensation-display"
import { formatDate } from "@/lib/display"
import { formatResumeColumn } from "@/lib/formatResumeColumn"
import { useApplicationsTablePreferences } from "@/hooks/useApplicationsTablePreferences"
import { usePreference } from "@/hooks/usePreference"
import { archiveApplication, deleteApplication, restoreApplication } from "@/services/applications.service"
import type { ApplicationResponse, CompanyResponse, ResumeResponse } from "@/types"
import { ApplicationDetailDialog } from "./ApplicationDetailDialog"

interface Props {
  data: ApplicationResponse[]
  platforms: Record<number, string>
  resumeMap: Record<number, ResumeResponse>
  companies: CompanyResponse[]
  archived: boolean
  onEdit: (application: ApplicationResponse) => void
  onRefresh: (updater?: (current: ApplicationResponse[]) => ApplicationResponse[]) => void
}

const columnHelper = createColumnHelper<ApplicationResponse>()

export function ApplicationTable({
  data,
  platforms,
  resumeMap,
  companies,
  archived,
  onEdit,
  onRefresh,
}: Props) {
  const [locale] = usePreference<string>("display.locale", "en-US")
  const [tablePrefs] = useApplicationsTablePreferences()
  const [sorting, setSorting] = useState<SortingState>([])
  const [historyAppId, setHistoryAppId] = useState<number | null>(null)
  const [appointmentsApp, setAppointmentsApp] = useState<ApplicationResponse | null>(null)
  const [detailApp, setDetailApp] = useState<ApplicationResponse | null>(null)

  const handleArchive = useCallback(
    async (id: number) => {
      onRefresh((current) =>
        current.map((app) => (app.id === id ? { ...app, archived_at: new Date().toISOString() } : app)),
      )
      const result = await archiveApplication(id)
      if (result.error) {
        toast.error(result.error)
        onRefresh((current) => current.map((app) => (app.id === id ? { ...app, archived_at: null } : app)))
      } else {
        toast.success("Application archived")
        onRefresh()
      }
    },
    [onRefresh],
  )

  const handleRestore = useCallback(
    async (id: number) => {
      onRefresh((current) =>
        current.map((app) => (app.id === id ? { ...app, archived_at: null } : app)),
      )
      const result = await restoreApplication(id)
      if (result.error) {
        toast.error(result.error)
        onRefresh()
      } else {
        toast.success("Application restored")
        onRefresh()
      }
    },
    [onRefresh],
  )

  const handleDelete = useCallback(
    async (id: number) => {
      onRefresh((current) => current.filter((app) => app.id !== id))
      const result = await deleteApplication(id)
      if (result.error) {
        toast.error(result.error)
        onRefresh()
      } else {
        toast.success("Application deleted")
        onRefresh()
      }
    },
    [onRefresh],
  )

  const columns = useMemo((): ColumnDef<ApplicationResponse, any>[] => {
    const out: ColumnDef<ApplicationResponse, any>[] = [
      columnHelper.accessor("job_title", {
        header: "Job Title",
        cell: ({ row, getValue }) => (
          <Button
            type="button"
            variant="link"
            className="h-auto max-w-[min(100%,16rem)] justify-start truncate p-0 font-medium"
            onClick={() => setDetailApp(row.original)}
          >
            {getValue()}
          </Button>
        ),
      }),
      columnHelper.accessor("platform_id", {
        header: "Platform",
        cell: (info) => platforms[info.getValue()] ?? info.getValue(),
      }),
      columnHelper.accessor("company", {
        header: "Company",
        cell: (info) => info.getValue() ?? <span className="text-muted-foreground">—</span>,
      }),
    ]

    if (tablePrefs.showSeniorityColumn) {
      out.push(
        columnHelper.accessor((row) => row.seniority ?? "", {
          id: "seniority",
          header: "Seniority",
          cell: (info) =>
            info.row.original.seniority ? (
              info.getValue()
            ) : (
              <span className="text-muted-foreground">—</span>
            ),
        }) as ColumnDef<ApplicationResponse, any>,
      )
    }

    if (tablePrefs.showSalaryColumn) {
      out.push(
        columnHelper.accessor(
          (row) => {
            const s = row.salary
            if (s == null || s === "") return null
            const n = Number(s)
            return Number.isNaN(n) ? null : n
          },
          {
            id: "salary",
            header: "Salary",
            cell: ({ row }) => {
              const formatted = formatCompensation({
                salary: row.original.salary,
                salary_currency: row.original.salary_currency,
                pay_period: row.original.pay_period,
                locale,
              })
              if (formatted == null) {
                return <span className="text-muted-foreground">—</span>
              }
              return <span className="max-w-[14rem] truncate" title={formatted}>{formatted}</span>
            },
            sortingFn: (a, b, columnId) => {
              const av = a.getValue(columnId) as number | null
              const bv = b.getValue(columnId) as number | null
              if (av == null && bv == null) return 0
              if (av == null) return 1
              if (bv == null) return -1
              return av === bv ? 0 : av < bv ? -1 : 1
            },
          },
        ) as ColumnDef<ApplicationResponse, any>,
      )
    }

    if (tablePrefs.showResumeColumn) {
      out.push(
        columnHelper.accessor((row) => formatResumeColumn(row.resume_id, resumeMap), {
          id: "resume",
          header: "Resume",
          cell: ({ row }) => {
            const id = row.original.resume_id
            if (id == null) {
              return <span className="text-muted-foreground">—</span>
            }
            return (
              <span className="max-w-[14rem] truncate" title={formatResumeColumn(id, resumeMap)}>
                {formatResumeColumn(id, resumeMap)}
              </span>
            )
          },
          sortingFn: "alphanumeric",
        }) as ColumnDef<ApplicationResponse, any>,
      )
    }

    out.push(
      columnHelper.accessor("current_stage", {
        header: "Stage",
        cell: (info) => <Badge variant="secondary">{info.getValue()}</Badge>,
      }),
      columnHelper.accessor("status", {
        header: "Status",
        cell: (info) => <Badge variant="outline">{info.getValue()}</Badge>,
      }),
      columnHelper.accessor("applied_at", {
        header: "Date Applied",
        cell: (info) => formatDate(info.getValue(), locale),
      }),
    )

    if (tablePrefs.showCreatedAtColumn) {
      out.push(
        columnHelper.accessor("created_at", {
          id: "created_at",
          header: "Created",
          cell: (info) => formatDate(info.getValue(), locale),
        }) as ColumnDef<ApplicationResponse>,
      )
    }

    const actions = columnHelper.display({
      id: "actions",
      header: () => <span className="block text-right">Actions</span>,
      cell: ({ row }) => {
        const app = row.original
        return (
          <div className="flex items-center justify-end gap-1">
            {!archived && (
              <>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="sm" onClick={() => setAppointmentsApp(app)}>
                      <CalendarDays data-icon="inline-start" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Appointments</TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      aria-label="Stage history"
                      onClick={() => setHistoryAppId(app.id)}
                    >
                      <History data-icon="inline-start" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>History</TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="sm" onClick={() => onEdit(app)}>
                      <Pencil data-icon="inline-start" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Edit</TooltipContent>
                </Tooltip>
                {app.application_url && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="sm" asChild>
                        <a href={app.application_url} target="_blank" rel="noopener noreferrer">
                          <ExternalLink data-icon="inline-start" />
                        </a>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Open link</TooltipContent>
                  </Tooltip>
                )}
                <AlertDialog>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <Archive data-icon="inline-start" />
                        </Button>
                      </AlertDialogTrigger>
                    </TooltipTrigger>
                    <TooltipContent>Archive</TooltipContent>
                  </Tooltip>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Archive application?</AlertDialogTitle>
                      <AlertDialogDescription>
                        The application will be moved to the archived view.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={() => handleArchive(app.id)}>Archive</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </>
            )}
            {archived && (
              <AlertDialog>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <RotateCcw data-icon="inline-start" />
                      </Button>
                    </AlertDialogTrigger>
                  </TooltipTrigger>
                  <TooltipContent>Restore</TooltipContent>
                </Tooltip>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Restore application?</AlertDialogTitle>
                    <AlertDialogDescription>
                      The application will be moved back to active.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={() => handleRestore(app.id)}>Restore</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
            <AlertDialog>
              <Tooltip>
                <TooltipTrigger asChild>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 data-icon="inline-start" />
                    </Button>
                  </AlertDialogTrigger>
                </TooltipTrigger>
                <TooltipContent>Delete</TooltipContent>
              </Tooltip>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete application?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. The application and its history will be permanently deleted.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => handleDelete(app.id)}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        )
      },
    }) as ColumnDef<ApplicationResponse, any>

    out.push(actions)
    return out
  }, [tablePrefs, platforms, resumeMap, locale, archived, onEdit, handleArchive, handleRestore, handleDelete])

  const table = useReactTable({
    data,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: 20 } },
  })

  return (
    <TooltipProvider>
      <div
        className={cn(
          "rounded-md border",
          tablePrefs.compactDensity &&
            "[&_[data-slot=table-head]]:h-8 [&_[data-slot=table-head]]:px-1.5 [&_[data-slot=table-head]]:text-xs [&_[data-slot=table-cell]]:p-1.5 [&_[data-slot=table-cell]]:text-xs",
        )}
      >
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    className={header.column.getCanSort() ? "cursor-pointer select-none" : ""}
                    onClick={header.column.getToggleSortingHandler()}
                  >
                    {flexRender(header.column.columnDef.header, header.getContext())}
                    {header.column.getIsSorted() === "asc" ? " ↑" : header.column.getIsSorted() === "desc" ? " ↓" : ""}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="py-8 text-center text-muted-foreground">
                  No applications found.
                </TableCell>
              </TableRow>
            ) : (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  className={row.original.archived_at ? "text-muted-foreground" : ""}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {table.getPageCount() > 1 && (
        <div className="flex items-center justify-end gap-2 pt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
          </Button>
        </div>
      )}

      {detailApp !== null && (
        <ApplicationDetailDialog
          application={detailApp}
          open
          onOpenChange={(open) => {
            if (!open) setDetailApp(null)
          }}
          platforms={platforms}
          resumeMap={resumeMap}
          companies={companies}
          archived={archived}
          locale={locale}
          onEdit={onEdit}
          onOpenHistory={(id) => setHistoryAppId(id)}
          onOpenAppointments={(app) => setAppointmentsApp(app)}
        />
      )}

      {historyAppId !== null && (
        <StageHistoryDialog
          applicationId={historyAppId}
          open={historyAppId !== null}
          onOpenChange={(open) => {
            if (!open) setHistoryAppId(null)
          }}
          onStageChanged={onRefresh}
        />
      )}

      {appointmentsApp !== null && (
        <AppointmentListDialog
          applicationId={appointmentsApp.id}
          applicationLabel={
            appointmentsApp.company
              ? `${appointmentsApp.job_title} — ${appointmentsApp.company}`
              : appointmentsApp.job_title
          }
          open={appointmentsApp !== null}
          onOpenChange={(open) => {
            if (!open) setAppointmentsApp(null)
          }}
          onRefresh={onRefresh}
        />
      )}
    </TooltipProvider>
  )
}
