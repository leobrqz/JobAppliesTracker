"use client"

import { useState } from "react"
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
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
import { AppointmentListDialog } from "@/components/AppointmentListDialog"
import { StageHistoryDialog } from "@/components/StageHistoryDialog"
import { formatDate } from "@/lib/display"
import { usePreference } from "@/hooks/usePreference"
import { archiveApplication, deleteApplication, restoreApplication } from "@/services/applications.service"
import type { ApplicationResponse } from "@/types"

interface Props {
  data: ApplicationResponse[]
  platforms: Record<number, string>
  archived: boolean
  onEdit: (application: ApplicationResponse) => void
  onRefresh: (updater?: (current: ApplicationResponse[]) => ApplicationResponse[]) => void
}

const columnHelper = createColumnHelper<ApplicationResponse>()

export function ApplicationTable({ data, platforms, archived, onEdit, onRefresh }: Props) {
  const [locale] = usePreference<string>("display.locale", "en-US")
  const [sorting, setSorting] = useState<SortingState>([])
  const [historyAppId, setHistoryAppId] = useState<number | null>(null)
  const [appointmentsApp, setAppointmentsApp] = useState<ApplicationResponse | null>(null)

  async function handleArchive(id: number) {
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
  }

  async function handleRestore(id: number) {
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
  }

  async function handleDelete(id: number) {
    onRefresh((current) => current.filter((app) => app.id !== id))
    const result = await deleteApplication(id)
    if (result.error) {
      toast.error(result.error)
      onRefresh()
    } else {
      toast.success("Application deleted")
      onRefresh()
    }
  }

  const columns = [
    columnHelper.accessor("job_title", {
      header: "Job Title",
      cell: (info) => <span className="font-medium">{info.getValue()}</span>,
    }),
    columnHelper.accessor("company", {
      header: "Company",
      cell: (info) => info.getValue() ?? <span className="text-muted-foreground">—</span>,
    }),
    columnHelper.accessor("platform_id", {
      header: "Platform",
      cell: (info) => platforms[info.getValue()] ?? info.getValue(),
    }),
    columnHelper.accessor("status", {
      header: "Status",
      cell: (info) => <Badge variant="outline">{info.getValue()}</Badge>,
    }),
    columnHelper.accessor("current_stage", {
      header: "Stage",
      cell: (info) => <Badge variant="secondary">{info.getValue()}</Badge>,
    }),
    columnHelper.accessor("applied_at", {
      header: "Date Applied",
      cell: (info) => formatDate(info.getValue(), locale),
    }),
    columnHelper.display({
      id: "actions",
      header: () => <span className="text-right block">Actions</span>,
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
                    <Button variant="ghost" size="sm" onClick={() => setHistoryAppId(app.id)}>
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
    }),
  ]

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
      <div className="rounded-md border">
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

      {historyAppId !== null && (
        <StageHistoryDialog
          applicationId={historyAppId}
          open={historyAppId !== null}
          onOpenChange={(open) => { if (!open) setHistoryAppId(null) }}
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
          onOpenChange={(open) => { if (!open) setAppointmentsApp(null) }}
          onRefresh={onRefresh}
        />
      )}
    </TooltipProvider>
  )
}
