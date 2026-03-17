"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@workspace/ui/components/card"
import { Separator } from "@workspace/ui/components/separator"
import { Skeleton } from "@workspace/ui/components/skeleton"
import { useDashboardWidgets } from "@/hooks/useDashboardWidgets"
import { useDashboardSummary } from "@/hooks/useDashboardSummary"
import type { StageAvg } from "@/types"

export function SummaryCards() {
  const [widgets] = useDashboardWidgets()
  if (!widgets.showSummary) return null

  const { data, isLoading, error } = useDashboardSummary()

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <Card key={i}>
            <CardHeader className="pb-2">
              <Skeleton className="h-4 w-32" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-16" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (error || !data) {
    return <p className="text-sm text-destructive">Failed to load summary: {error}</p>
  }

  const summary = data as typeof data & { total_offers: number; total_rejections: number }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Applications</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold">{summary.total_applications}</p>
          <Separator className="my-3" />
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Offers</span>
              <span className="font-medium">{summary.total_offers ?? 0}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Rejections</span>
              <span className="font-medium">{summary.total_rejections ?? 0}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Response Rate</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold">{summary.response_rate}%</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Avg Days Per Stage</CardTitle>
        </CardHeader>
        <CardContent>
          {summary.avg_days_per_stage.length === 0 ? (
            <p className="text-sm text-muted-foreground">No data yet</p>
          ) : (
            <ul className="flex flex-col gap-1">
              {summary.avg_days_per_stage.map((item: StageAvg) => (
                <li key={item.stage} className="flex justify-between text-sm">
                  <span className="capitalize text-muted-foreground">{item.stage}</span>
                  <span className="font-medium">{item.avg_days}d</span>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
