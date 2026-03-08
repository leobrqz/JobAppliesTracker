import { Card, CardContent, CardHeader, CardTitle } from "@workspace/ui/components/card"

export default function SettingsPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Settings</h1>
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">No preferences configured.</p>
        </CardContent>
      </Card>
    </div>
  )
}
