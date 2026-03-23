"use client"

import { useEffect, useState } from "react"
import { toast } from "sonner"
import { Button } from "@workspace/ui/components/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@workspace/ui/components/card"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@workspace/ui/components/dialog"
import { Field, FieldGroup, FieldLabel } from "@workspace/ui/components/field"
import { Skeleton } from "@workspace/ui/components/skeleton"
import { Textarea } from "@workspace/ui/components/textarea"
import { useProfileAboutMe } from "@/hooks/useProfileAboutMe"
import { updateProfileAboutMe } from "@/services/profile-about-me.service"
import { copyText } from "./profile-section-utils"

export function AboutMeSection() {
  const { data, isLoading, error, refetch } = useProfileAboutMe()
  const [description, setDescription] = useState("")
  const [editOpen, setEditOpen] = useState(false)

  useEffect(() => {
    setDescription(data?.description ?? "")
  }, [data])

  async function save() {
    const result = await updateProfileAboutMe({ description })
    if (result.error) {
      toast.error(result.error)
      return
    }
    toast.success("About me updated")
    setEditOpen(false)
    refetch()
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">About me</CardTitle>
        <CardDescription>Short personal description for applications.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {isLoading ? (
          <Skeleton className="h-24 w-full" />
        ) : error ? (
          <p className="text-sm text-destructive">Failed to load About me: {error}</p>
        ) : (
          <div className="flex flex-col gap-3">
            <div className="rounded-md border p-3">
              <p className="text-sm whitespace-pre-wrap">
                {description || "No description added yet."}
              </p>
            </div>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={async () => {
                  const ok = await copyText(description)
                  if (ok) toast.success("About me copied")
                  else toast.error("Failed to copy")
                }}
              >
                Copy
              </Button>
              <Button onClick={() => setEditOpen(true)}>Edit</Button>
            </div>
          </div>
        )}
      </CardContent>
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit About me</DialogTitle>
          </DialogHeader>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="about-me-description">Description</FieldLabel>
              <Textarea
                id="about-me-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={8}
              />
            </Field>
          </FieldGroup>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditOpen(false)}>Cancel</Button>
            <Button onClick={save}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  )
}
