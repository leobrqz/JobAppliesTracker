"use client"

import { useMemo, useState } from "react"
import { toast } from "sonner"
import { Button } from "@workspace/ui/components/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@workspace/ui/components/card"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@workspace/ui/components/dialog"
import { Field, FieldGroup, FieldLabel } from "@workspace/ui/components/field"
import { Input } from "@workspace/ui/components/input"
import { Separator } from "@workspace/ui/components/separator"
import { Skeleton } from "@workspace/ui/components/skeleton"
import { Textarea } from "@workspace/ui/components/textarea"
import { useProfileSkills } from "@/hooks/useProfileSkills"
import {
  createProfileSkillGroup,
  createProfileSkillItem,
  deleteProfileSkillGroup,
  deleteProfileSkillItem,
  reorderProfileSkillGroups,
  reorderProfileSkillItems,
  updateProfileSkillGroup,
  updateProfileSkillItem,
} from "@/services/profile-skills.service"
import type { SkillGroupResponse, SkillItemResponse } from "@/types"
import { buildReorderPayload, copyText, moveItem } from "./profile-section-utils"

const EMPTY_GROUP = { name: "", description: "" }
const EMPTY_ITEM = { name: "", level: "" }

export function SkillsSection() {
  const { data, isLoading, error, refetch } = useProfileSkills()
  const [groupOpen, setGroupOpen] = useState(false)
  const [groupForm, setGroupForm] = useState(EMPTY_GROUP)
  const [editGroup, setEditGroup] = useState<SkillGroupResponse | null>(null)
  const [itemOpen, setItemOpen] = useState(false)
  const [itemForm, setItemForm] = useState(EMPTY_ITEM)
  const [groupIdForItem, setGroupIdForItem] = useState<number | null>(null)
  const [editItem, setEditItem] = useState<SkillItemResponse | null>(null)

  const groups = useMemo(() => [...data].sort((a, b) => a.display_order - b.display_order), [data])

  async function saveGroup() {
    if (!groupForm.name.trim()) return toast.error("Group name is required")
    const result = editGroup
      ? await updateProfileSkillGroup(editGroup.id, { name: groupForm.name.trim(), description: groupForm.description || null })
      : await createProfileSkillGroup({ name: groupForm.name.trim(), description: groupForm.description || null, items: [] })
    if (result.error) return toast.error(result.error)
    toast.success(editGroup ? "Group updated" : "Group added")
    setGroupOpen(false)
    refetch()
  }

  async function saveItem() {
    if (!groupIdForItem || !itemForm.name.trim()) return toast.error("Skill name is required")
    const result = editItem
      ? await updateProfileSkillItem(editItem.id, { name: itemForm.name.trim(), level: itemForm.level || null })
      : await createProfileSkillItem(groupIdForItem, { name: itemForm.name.trim(), level: itemForm.level || null })
    if (result.error) return toast.error(result.error)
    toast.success(editItem ? "Skill updated" : "Skill added")
    setItemOpen(false)
    refetch()
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between gap-2">
          <div className="flex flex-col gap-1">
            <CardTitle className="text-base">Skills</CardTitle>
            <CardDescription>Group skills into reusable categories.</CardDescription>
          </div>
          <Button size="sm" onClick={() => { setEditGroup(null); setGroupForm(EMPTY_GROUP); setGroupOpen(true) }}>Add Group</Button>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {isLoading ? (
          <Skeleton className="h-24 w-full" />
        ) : error ? (
          <p className="text-sm text-destructive">Failed to load skills: {error}</p>
        ) : groups.length === 0 ? (
          <p className="text-sm text-muted-foreground">No skill groups yet.</p>
        ) : groups.map((group, index) => (
          <div key={group.id} className="flex flex-col gap-3 rounded-md border p-3">
            <div className="flex items-start justify-between gap-2">
              <div className="flex flex-col gap-1">
                <p className="text-sm font-medium">{group.name}</p>
                {group.description && <p className="text-sm text-muted-foreground">{group.description}</p>}
              </div>
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="sm" onClick={async () => { const r = await reorderProfileSkillGroups(buildReorderPayload(moveItem(groups, index, index - 1))); if (r.error) toast.error(r.error); else refetch() }} disabled={index === 0}>Up</Button>
                <Button variant="ghost" size="sm" onClick={async () => { const r = await reorderProfileSkillGroups(buildReorderPayload(moveItem(groups, index, index + 1))); if (r.error) toast.error(r.error); else refetch() }} disabled={index === groups.length - 1}>Down</Button>
                <Button variant="ghost" size="sm" onClick={async () => { const ok = await copyText(`${group.name}\n${group.items.map((item) => `- ${item.name}${item.level ? ` (${item.level})` : ""}`).join("\n")}`); if (ok) toast.success("Skills copied"); else toast.error("Failed to copy") }}>Copy</Button>
                <Button variant="ghost" size="sm" onClick={() => { setEditGroup(group); setGroupForm({ name: group.name, description: group.description ?? "" }); setGroupOpen(true) }}>Edit</Button>
                <Button variant="ghost" size="sm" onClick={async () => { const r = await deleteProfileSkillGroup(group.id); if (r.error) toast.error(r.error); else { toast.success("Group deleted"); refetch() } }}>Delete</Button>
              </div>
            </div>
            <Separator />
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <p className="text-xs font-medium uppercase text-muted-foreground">Items</p>
                <Button variant="outline" size="sm" onClick={() => { setEditItem(null); setGroupIdForItem(group.id); setItemForm(EMPTY_ITEM); setItemOpen(true) }}>Add Skill</Button>
              </div>
              {group.items.map((item, itemIndex) => (
                <div key={item.id} className="flex items-center gap-1 rounded-md border px-2 py-1">
                  <p className="flex-1 text-sm">{item.name}{item.level ? ` (${item.level})` : ""}</p>
                  <Button variant="ghost" size="sm" onClick={async () => { const list = [...group.items].sort((a, b) => a.display_order - b.display_order); const r = await reorderProfileSkillItems(group.id, buildReorderPayload(moveItem(list, itemIndex, itemIndex - 1))); if (r.error) toast.error(r.error); else refetch() }} disabled={itemIndex === 0}>Up</Button>
                  <Button variant="ghost" size="sm" onClick={async () => { const list = [...group.items].sort((a, b) => a.display_order - b.display_order); const r = await reorderProfileSkillItems(group.id, buildReorderPayload(moveItem(list, itemIndex, itemIndex + 1))); if (r.error) toast.error(r.error); else refetch() }} disabled={itemIndex === group.items.length - 1}>Down</Button>
                  <Button variant="ghost" size="sm" onClick={() => { setEditItem(item); setGroupIdForItem(group.id); setItemForm({ name: item.name, level: item.level ?? "" }); setItemOpen(true) }}>Edit</Button>
                  <Button variant="ghost" size="sm" onClick={async () => { const r = await deleteProfileSkillItem(item.id); if (r.error) toast.error(r.error); else { toast.success("Skill deleted"); refetch() } }}>Delete</Button>
                </div>
              ))}
            </div>
          </div>
        ))}
      </CardContent>
      <Dialog open={groupOpen} onOpenChange={setGroupOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editGroup ? "Edit Group" : "Add Group"}</DialogTitle></DialogHeader>
          <FieldGroup>
            <Field><FieldLabel htmlFor="skills-group-name">Name</FieldLabel><Input id="skills-group-name" value={groupForm.name} onChange={(e) => setGroupForm((s) => ({ ...s, name: e.target.value }))} /></Field>
            <Field><FieldLabel htmlFor="skills-group-description">Description</FieldLabel><Textarea id="skills-group-description" value={groupForm.description} onChange={(e) => setGroupForm((s) => ({ ...s, description: e.target.value }))} /></Field>
          </FieldGroup>
          <DialogFooter><Button variant="outline" onClick={() => setGroupOpen(false)}>Cancel</Button><Button onClick={saveGroup}>{editGroup ? "Save" : "Add"}</Button></DialogFooter>
        </DialogContent>
      </Dialog>
      <Dialog open={itemOpen} onOpenChange={setItemOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editItem ? "Edit Skill" : "Add Skill"}</DialogTitle></DialogHeader>
          <FieldGroup>
            <Field><FieldLabel htmlFor="skills-item-name">Name</FieldLabel><Input id="skills-item-name" value={itemForm.name} onChange={(e) => setItemForm((s) => ({ ...s, name: e.target.value }))} /></Field>
            <Field><FieldLabel htmlFor="skills-item-level">Level</FieldLabel><Input id="skills-item-level" value={itemForm.level} onChange={(e) => setItemForm((s) => ({ ...s, level: e.target.value }))} /></Field>
          </FieldGroup>
          <DialogFooter><Button variant="outline" onClick={() => setItemOpen(false)}>Cancel</Button><Button onClick={saveItem}>{editItem ? "Save" : "Add"}</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  )
}
