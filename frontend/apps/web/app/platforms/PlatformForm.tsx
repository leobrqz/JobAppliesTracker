"use client"

import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { Button } from "@workspace/ui/components/button"
import { Checkbox } from "@workspace/ui/components/checkbox"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@workspace/ui/components/command"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@workspace/ui/components/dialog"
import { Input } from "@workspace/ui/components/input"
import { Label } from "@workspace/ui/components/label"
import { Popover, PopoverContent, PopoverTrigger } from "@workspace/ui/components/popover"
import { usePlatformTemplates } from "@/hooks/usePlatformTemplates"
import { createJobPlatform, updateJobPlatform } from "@/services/platforms.service"
import type { JobPlatformCreate, JobPlatformResponse, JobPlatformUpdate } from "@/types"

interface FormValues {
  name: string
  icon: string
  base_url: string
  applications_url: string
  manual_resume: boolean
}

interface Props {
  selectedPlatform: JobPlatformResponse | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function PlatformForm({ selectedPlatform, open, onOpenChange, onSuccess }: Props) {
  const isEdit = selectedPlatform !== null
  const { data: templates } = usePlatformTemplates()
  const [templateOpen, setTemplateOpen] = useState(false)

  const { register, handleSubmit, reset, setValue, watch } = useForm<FormValues>()
  const manualResume = watch("manual_resume")

  useEffect(() => {
    if (open) {
      if (selectedPlatform) {
        reset({
          name: selectedPlatform.name,
          icon: selectedPlatform.icon ?? "",
          base_url: selectedPlatform.base_url ?? "",
          applications_url: selectedPlatform.applications_url ?? "",
          manual_resume: selectedPlatform.manual_resume,
        })
      } else {
        reset({ name: "", icon: "", base_url: "", applications_url: "", manual_resume: false })
      }
    }
  }, [open, selectedPlatform, reset])

  function applyTemplate(template: { name: string; icon?: string | null; base_url?: string | null; applications_url?: string | null }) {
    setValue("name", template.name)
    setValue("icon", template.icon ?? "")
    setValue("base_url", template.base_url ?? "")
    setValue("applications_url", template.applications_url ?? "")
    setTemplateOpen(false)
  }

  async function onSubmit(values: FormValues) {
    if (!values.name.trim()) {
      toast.error("Name is required")
      return
    }

    if (isEdit && selectedPlatform) {
      const data: JobPlatformUpdate = {
        name: values.name.trim(),
        icon: values.icon.trim() || undefined,
        base_url: values.base_url.trim() || undefined,
        applications_url: values.applications_url.trim() || undefined,
        manual_resume: values.manual_resume,
      }
      const result = await updateJobPlatform(selectedPlatform.id, data)
      if (result.error) { toast.error(result.error); return }
      toast.success("Platform updated")
    } else {
      const data: JobPlatformCreate = {
        name: values.name.trim(),
        icon: values.icon.trim() || undefined,
        base_url: values.base_url.trim() || undefined,
        applications_url: values.applications_url.trim() || undefined,
        registered_at: new Date().toISOString(),
        manual_resume: values.manual_resume,
      }
      const result = await createJobPlatform(data)
      if (result.error) { toast.error(result.error); return }
      toast.success("Platform created")
    }

    onOpenChange(false)
    onSuccess()
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Platform" : "New Platform"}</DialogTitle>
        </DialogHeader>

        {!isEdit && (
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Fill from template</Label>
            <Popover open={templateOpen} onOpenChange={setTemplateOpen}>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className="w-full justify-start">
                  Select a template to auto-fill…
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-72 p-0" align="start">
                <Command>
                  <CommandInput placeholder="Search templates…" />
                  <CommandList>
                    <CommandEmpty>No templates found.</CommandEmpty>
                    <CommandGroup>
                      {templates.map((t) => (
                        <CommandItem key={t.id} onSelect={() => applyTemplate(t)}>
                          {t.name}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1">
            <Label htmlFor="name">Name *</Label>
            <Input id="name" {...register("name")} placeholder="e.g. LinkedIn" />
          </div>

          <div className="space-y-1">
            <Label htmlFor="icon">Icon URL</Label>
            <Input id="icon" {...register("icon")} placeholder="https://…" />
          </div>

          <div className="space-y-1">
            <Label htmlFor="base_url">Base URL</Label>
            <Input id="base_url" {...register("base_url")} placeholder="https://…" />
          </div>

          <div className="space-y-1">
            <Label htmlFor="applications_url">Applications URL</Label>
            <Input id="applications_url" {...register("applications_url")} placeholder="https://…" />
          </div>

          <div className="flex items-center gap-2">
            <Checkbox
              id="manual_resume"
              checked={manualResume}
              onCheckedChange={(v) => setValue("manual_resume", Boolean(v))}
            />
            <Label htmlFor="manual_resume" className="cursor-pointer">
              Manual resume submission required
            </Label>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">{isEdit ? "Save Changes" : "Create Platform"}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
