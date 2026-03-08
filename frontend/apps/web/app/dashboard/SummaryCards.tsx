"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@workspace/ui/components/card"
import { Skeleton } from "@workspace/ui/components/skeleton"
import { useDashboardSummary } from "@/hooks/useDashboardSummary"

export function SummaryCards() {
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

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Total Applications</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold">{data.total_applications}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Response Rate</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold">{data.response_rate}%</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Avg Days Per Stage</CardTitle>
        </CardHeader>
        <CardContent>
          {data.avg_days_per_stage.length === 0 ? (
            <p className="text-sm text-muted-foreground">No data yet</p>
          ) : (
            <ul className="space-y-1">
              {data.avg_days_per_stage.map((item) => (
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
