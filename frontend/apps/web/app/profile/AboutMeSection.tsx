"use client"

import { useEffect, useState } from "react"
import { toast } from "sonner"
import { Button } from "@workspace/ui/components/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@workspace/ui/components/card"
import { Field, FieldGroup, FieldLabel } from "@workspace/ui/components/field"
import { Skeleton } from "@workspace/ui/components/skeleton"
import { Textarea } from "@workspace/ui/components/textarea"
import { useProfileAboutMe } from "@/hooks/useProfileAboutMe"
import { updateProfileAboutMe } from "@/services/profile-about-me.service"

export function AboutMeSection() {
  const { data, isLoading, error, refetch } = useProfileAboutMe()
  const [description, setDescription] = useState("")

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
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="about-me-description">Description</FieldLabel>
              <Textarea
                id="about-me-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={6}
              />
            </Field>
            <div className="flex justify-end">
              <Button onClick={save}>Save</Button>
            </div>
          </FieldGroup>
        )}
      </CardContent>
    </Card>
  )
}
