"use client"

import { Badge } from "@workspace/ui/components/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@workspace/ui/components/card"
import { Skeleton } from "@workspace/ui/components/skeleton"
import { useRecentApplications } from "@/hooks/useRecentApplications"

function formatDate(iso: string): string {
  return new Intl.DateTimeFormat("en-US", { year: "numeric", month: "short", day: "numeric" }).format(
    new Date(iso),
  )
}

export function RecentApplicationsList() {
  const { data, isLoading, error } = useRecentApplications()

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-5 w-48" />
        </CardHeader>
        <CardContent className="space-y-3">
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-10 w-full" />
          ))}
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-sm text-destructive">Failed to load recent applications: {error}</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Recent Applications</CardTitle>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <p className="text-sm text-muted-foreground">No applications yet.</p>
        ) : (
          <ul className="space-y-3">
            {data.map((item) => (
              <li key={item.id} className="flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{item.job_title}</p>
                  {item.company && (
                    <p className="truncate text-xs text-muted-foreground">{item.company}</p>
                  )}
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <Badge variant="outline" className="text-xs">
                    {item.status}
                  </Badge>
                  <span className="text-xs text-muted-foreground">{formatDate(item.applied_at)}</span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}
