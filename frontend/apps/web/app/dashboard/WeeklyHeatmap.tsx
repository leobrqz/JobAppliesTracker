"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@workspace/ui/components/card"
import { Skeleton } from "@workspace/ui/components/skeleton"
import { useDashboardWidgets } from "@/hooks/useDashboardWidgets"
import { useHeatmap } from "@/hooks/useHeatmap"
import type { HeatmapItem } from "@/types"

const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

function getISOWeek(date: Date): string {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))
  const dayNum = d.getUTCDay() || 7
  d.setUTCDate(d.getUTCDate() + 4 - dayNum)
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1))
  return `${d.getUTCFullYear()}-W${String(Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7)).padStart(2, "0")}`
}

function buildGrid(items: HeatmapItem[]): Map<string, Map<number, number>> {
  const weekMap = new Map<string, Map<number, number>>()
  for (const item of items) {
    const date = new Date(item.date + "T00:00:00")
    const week = getISOWeek(date)
    const dow = date.getDay()
    if (!weekMap.has(week)) weekMap.set(week, new Map())
    weekMap.get(week)!.set(dow, item.count)
  }
  return weekMap
}

function intensityClass(count: number): string {
  if (count === 0) return "bg-muted"
  if (count <= 1) return "bg-primary/20"
  if (count <= 3) return "bg-primary/50"
  if (count <= 6) return "bg-primary/75"
  return "bg-primary"
}

export function WeeklyHeatmap() {
  const [widgets] = useDashboardWidgets()
  if (!widgets.showWeeklyHeatmap) return null

  const { data, isLoading, error } = useHeatmap()

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-5 w-40" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-32 w-full" />
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-sm text-destructive">Failed to load heatmap: {error}</p>
        </CardContent>
      </Card>
    )
  }

  if (data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Activity Heatmap</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">No activity yet.</p>
        </CardContent>
      </Card>
    )
  }

  const weekMap = buildGrid(data)
  const weeks = Array.from(weekMap.keys()).sort()

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Activity Heatmap</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <div className="inline-block">
            <div className="mb-1 flex gap-1 pl-10">
              {weeks.map((w) => (
                <div key={w} className="w-5 text-center text-xs text-muted-foreground">
                  {w.slice(-2)}
                </div>
              ))}
            </div>
            {DAY_LABELS.map((label, dow) => (
              <div key={dow} className="mb-1 flex items-center gap-1">
                <span className="w-9 text-right text-xs text-muted-foreground">{label}</span>
                {weeks.map((week) => {
                  const count = weekMap.get(week)?.get(dow) ?? 0
                  return (
                    <div
                      key={week}
                      title={`${week} ${label}: ${count}`}
                      className={`h-5 w-5 rounded-sm ${intensityClass(count)}`}
                    />
                  )
                })}
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
