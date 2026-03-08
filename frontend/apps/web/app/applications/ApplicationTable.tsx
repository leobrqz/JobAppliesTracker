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
import { StageHistoryDialog } from "@/components/StageHistoryDialog"
import { archiveApplication, deleteApplication, restoreApplication } from "@/services/applications.service"
import type { ApplicationResponse } from "@/types"

interface Props {
  data: ApplicationResponse[]
  platforms: Record<number, string>
  archived: boolean
  onEdit: (application: ApplicationResponse) => void
  onRefresh: () => void
}

const columnHelper = createColumnHelper<ApplicationResponse>()

function formatDate(iso: string): string {
  return new Intl.DateTimeFormat("en-US", { year: "numeric", month: "short", day: "numeric" }).format(
    new Date(iso),
  )
}

export function ApplicationTable({ data, platforms, archived, onEdit, onRefresh }: Props) {
  const [sorting, setSorting] = useState<SortingState>([])
  const [historyAppId, setHistoryAppId] = useState<number | null>(null)

  async function handleArchive(id: number) {
    const result = await archiveApplication(id)
    if (result.error) toast.error(result.error)
    else { toast.success("Application archived"); onRefresh() }
  }

  async function handleRestore(id: number) {
    const result = await restoreApplication(id)
    if (result.error) toast.error(result.error)
    else { toast.success("Application restored"); onRefresh() }
  }

  async function handleDelete(id: number) {
    const result = await deleteApplication(id)
    if (result.error) toast.error(result.error)
    else { toast.success("Application deleted"); onRefresh() }
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
      cell: (info) => formatDate(info.getValue()),
    }),
    columnHelper.display({
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const app = row.original
        return (
          <div className="flex items-center gap-1">
            {!archived && (
              <>
                <Button variant="ghost" size="sm" onClick={() => setHistoryAppId(app.id)}>
                  History
                </Button>
                <Button variant="ghost" size="sm" onClick={() => onEdit(app)}>
                  Edit
                </Button>
                {app.application_url && (
                  <Button variant="ghost" size="sm" asChild>
                    <a href={app.application_url} target="_blank" rel="noopener noreferrer">
                      Open
                    </a>
                  </Button>
                )}
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="ghost" size="sm">Archive</Button>
                  </AlertDialogTrigger>
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
                <AlertDialogTrigger asChild>
                  <Button variant="ghost" size="sm">Restore</Button>
                </AlertDialogTrigger>
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
              <AlertDialogTrigger asChild>
                <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive">
                  Delete
                </Button>
              </AlertDialogTrigger>
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
    <>
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
    </>
  )
}
