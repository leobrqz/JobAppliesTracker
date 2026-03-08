"use client"

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
import { Button } from "@workspace/ui/components/button"
import { Checkbox } from "@workspace/ui/components/checkbox"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@workspace/ui/components/table"
import { deleteJobPlatform } from "@/services/platforms.service"
import type { JobPlatformResponse } from "@/types"

interface Props {
  data: JobPlatformResponse[]
  onEdit: (platform: JobPlatformResponse) => void
  onRefresh: () => void
}

export function PlatformTable({ data, onEdit, onRefresh }: Props) {
  async function handleDelete(id: number) {
    const result = await deleteJobPlatform(id)
    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success("Platform deleted")
      onRefresh()
    }
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Icon</TableHead>
            <TableHead>Base URL</TableHead>
            <TableHead>Applications URL</TableHead>
            <TableHead>Manual Resume</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="py-8 text-center text-muted-foreground">
                No platforms yet.
              </TableCell>
            </TableRow>
          ) : (
            data.map((platform) => (
              <TableRow key={platform.id}>
                <TableCell className="font-medium">{platform.name}</TableCell>
                <TableCell>
                  {platform.icon ? (
                    platform.icon.startsWith("http") ? (
                      <img
                        src={platform.icon}
                        alt={platform.name}
                        className="h-5 w-5 object-contain"
                      />
                    ) : (
                      <span className="text-sm">{platform.icon}</span>
                    )
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </TableCell>
                <TableCell>
                  {platform.base_url ? (
                    <a
                      href={platform.base_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-primary hover:underline truncate block max-w-40"
                    >
                      {platform.base_url}
                    </a>
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </TableCell>
                <TableCell>
                  {platform.applications_url ? (
                    <a
                      href={platform.applications_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-primary hover:underline truncate block max-w-40"
                    >
                      {platform.applications_url}
                    </a>
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </TableCell>
                <TableCell>
                  <Checkbox checked={platform.manual_resume} disabled />
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="sm" onClick={() => onEdit(platform)}>
                      Edit
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-destructive hover:text-destructive"
                        >
                          Delete
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete platform?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This will permanently delete &quot;{platform.name}&quot;. Platforms with existing
                            applications cannot be deleted.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDelete(platform.id)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )
}
