"use client"

import * as React from "react"
import { ApplicationsTablePreferencesCard } from "./ApplicationsTablePreferencesCard"
import { Card, CardContent, CardHeader, CardTitle } from "@workspace/ui/components/card"
import { Field, FieldGroup, FieldLabel } from "@workspace/ui/components/field"
import { Input } from "@workspace/ui/components/input"
import { Button } from "@workspace/ui/components/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@workspace/ui/components/popover"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@workspace/ui/components/command"
import { Switch } from "@workspace/ui/components/switch"
import { useDashboardWidgets } from "@/hooks/useDashboardWidgets"
import { usePreference } from "@/hooks/usePreference"

const TIME_ZONES = [
  "Africa/Cairo",
  "Africa/Johannesburg",
  "America/Chicago",
  "America/Los_Angeles",
  "America/New_York",
  "America/Sao_Paulo",
  "Asia/Dubai",
  "Asia/Hong_Kong",
  "Asia/Kolkata",
  "Asia/Singapore",
  "Australia/Sydney",
  "Europe/Amsterdam",
  "Europe/Berlin",
  "Europe/Lisbon",
  "Europe/London",
  "Europe/Madrid",
  "Europe/Paris",
  "Europe/Rome",
  "Europe/Warsaw",
  "Pacific/Auckland",
] as const

type TimeZoneValue = (typeof TIME_ZONES)[number] | "auto"

function SettingsHashScroll() {
  React.useEffect(() => {
    if (typeof window === "undefined") return
    if (window.location.hash !== "#applications-table") return
    const id = window.setTimeout(() => {
      document.getElementById("applications-table")?.scrollIntoView({ behavior: "smooth", block: "start" })
    }, 100)
    return () => window.clearTimeout(id)
  }, [])
  return null
}

export default function SettingsPage() {
  const [widgets, setWidgets] = useDashboardWidgets()
  const [calendarExpanded, setCalendarExpanded] = usePreference<boolean>(
    "dashboard-calendar-strip-expanded",
    true,
  )
  const [timeFormat, setTimeFormat] = usePreference<"12h" | "24h">("display.timeFormat", "12h")
  const [timeZone, setTimeZone] = usePreference<TimeZoneValue>("display.timeZone", "auto")
  const [locale, setLocale] = usePreference<string>("display.locale", "en-US")

  return (
    <div className="flex flex-col gap-4">
      <SettingsHashScroll />
      <h1 className="text-2xl font-semibold">Settings</h1>
      <Card>
        <CardHeader>
          <div className="space-y-1">
            <CardTitle className="text-base">Dashboard</CardTitle>
            <p className="text-xs text-muted-foreground">
              Choose which widgets are shown on your dashboard.
            </p>
          </div>
        </CardHeader>
        <CardContent>
          <FieldGroup>
            <Field>
              <div className="flex items-center justify-between gap-4">
                <div className="space-y-1">
                  <FieldLabel>Summary cards</FieldLabel>
                  <p className="text-xs text-muted-foreground">
                    Show the applications, response rate, and average days per stage cards.
                  </p>
                </div>
                <Switch
                  checked={widgets.showSummary}
                  onCheckedChange={(checked) =>
                    setWidgets({ ...widgets, showSummary: checked })
                  }
                  aria-label="Show summary cards"
                />
              </div>
            </Field>
            <Field>
              <div className="flex items-center justify-between gap-4">
                <div className="space-y-1">
                  <FieldLabel>Dashboard calendar strip</FieldLabel>
                  <p className="text-xs text-muted-foreground">
                    Show the weekly calendar strip on the dashboard.
                  </p>
                </div>
                <Switch
                  checked={widgets.showCalendarStrip}
                  onCheckedChange={(checked) =>
                    setWidgets({ ...widgets, showCalendarStrip: checked })
                  }
                  aria-label="Show dashboard calendar strip"
                />
              </div>
            </Field>
            <Field>
              <div className="flex items-center justify-between gap-4">
                <div className="space-y-1">
                  <FieldLabel>Calendar strip expanded by default</FieldLabel>
                  <p className="text-xs text-muted-foreground">
                    When visible, start with the calendar strip expanded instead of collapsed.
                  </p>
                </div>
                <Switch
                  checked={calendarExpanded}
                  onCheckedChange={(checked) => setCalendarExpanded(checked)}
                  aria-label="Dashboard calendar strip expanded"
                />
              </div>
            </Field>
            <Field>
              <div className="flex items-center justify-between gap-4">
                <div className="space-y-1">
                  <FieldLabel>Stage distribution chart</FieldLabel>
                  <p className="text-xs text-muted-foreground">
                    Show the stage distribution pie chart on the dashboard.
                  </p>
                </div>
                <Switch
                  checked={widgets.showStatusDistribution}
                  onCheckedChange={(checked) =>
                    setWidgets({ ...widgets, showStatusDistribution: checked })
                  }
                  aria-label="Show stage distribution chart"
                />
              </div>
            </Field>
            <Field>
              <div className="flex items-center justify-between gap-4">
                <div className="space-y-1">
                  <FieldLabel>Recent applications</FieldLabel>
                  <p className="text-xs text-muted-foreground">
                    Show the recent applications list on the dashboard.
                  </p>
                </div>
                <Switch
                  checked={widgets.showRecentApplications}
                  onCheckedChange={(checked) =>
                    setWidgets({ ...widgets, showRecentApplications: checked })
                  }
                  aria-label="Show recent applications list"
                />
              </div>
            </Field>
            <Field>
              <div className="flex items-center justify-between gap-4">
                <div className="space-y-1">
                  <FieldLabel>Platform ranking</FieldLabel>
                  <p className="text-xs text-muted-foreground">
                    Show the platform conversion ranking table on the dashboard.
                  </p>
                </div>
                <Switch
                  checked={widgets.showPlatformRanking}
                  onCheckedChange={(checked) =>
                    setWidgets({ ...widgets, showPlatformRanking: checked })
                  }
                  aria-label="Show platform ranking table"
                />
              </div>
            </Field>
            <Field>
              <div className="flex items-center justify-between gap-4">
                <div className="space-y-1">
                  <FieldLabel>Weekly heatmap</FieldLabel>
                  <p className="text-xs text-muted-foreground">
                    Show the weekly activity heatmap on the dashboard.
                  </p>
                </div>
                <Switch
                  checked={widgets.showWeeklyHeatmap}
                  onCheckedChange={(checked) =>
                    setWidgets({ ...widgets, showWeeklyHeatmap: checked })
                  }
                  aria-label="Show weekly heatmap"
                />
              </div>
            </Field>
          </FieldGroup>
        </CardContent>
      </Card>

      <ApplicationsTablePreferencesCard />

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Time & Locale</CardTitle>
        </CardHeader>
        <CardContent>
          <FieldGroup>
            <Field>
              <div className="flex items-center justify-between gap-4">
                <div className="space-y-1">
                  <FieldLabel>Time format</FieldLabel>
                  <p className="text-xs text-muted-foreground">
                    How appointment times are displayed in lists and calendars.
                  </p>
                </div>
                <Select
                  value={timeFormat}
                  onValueChange={(value) => setTimeFormat(value as "12h" | "24h")}
                >
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="12h">12-hour</SelectItem>
                    <SelectItem value="24h">24-hour</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </Field>

            <Field>
              <div className="flex items-center justify-between gap-4">
                <div className="space-y-1">
                  <FieldLabel>Timezone</FieldLabel>
                  <p className="text-xs text-muted-foreground">
                    Leave as Auto to follow your browser timezone, or pick an IANA timezone like
                    Europe/Berlin.
                  </p>
                </div>
                <TimezoneCombobox value={timeZone} onChange={setTimeZone} />
              </div>
            </Field>

            <Field>
              <div className="flex items-center justify-between gap-4">
                <div className="space-y-1">
                  <FieldLabel>Locale</FieldLabel>
                  <p className="text-xs text-muted-foreground">
                    Controls date and number formatting. Interface language is English only for now.
                  </p>
                </div>
                <Select value={locale} onValueChange={setLocale}>
                  <SelectTrigger className="w-56">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en-US">English (United States)</SelectItem>
                    <SelectItem value="pt-BR">Português (Brasil)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </Field>
          </FieldGroup>
        </CardContent>
      </Card>
    </div>
  )
}

interface TimezoneComboboxProps {
  value: TimeZoneValue
  onChange: (value: TimeZoneValue) => void
}

function TimezoneCombobox({ value, onChange }: TimezoneComboboxProps) {
  const [open, setOpen] = React.useState(false)
  const current = value === "auto" ? "auto" : value

  const label =
    current === "auto"
      ? "Auto"
      : TIME_ZONES.includes(current as (typeof TIME_ZONES)[number])
        ? current
        : current

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className="w-56 justify-between"
          aria-label="Select timezone"
        >
          <span className="truncate text-left">
            {label}
          </span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-72 p-0">
        <Command>
          <CommandInput placeholder="Search timezones..." />
          <CommandList>
            <CommandEmpty>No timezone found.</CommandEmpty>
            <CommandGroup>
              <CommandItem
                key="auto"
                value="auto"
                onSelect={() => {
                  onChange("auto")
                  setOpen(false)
                }}
              >
                Auto (browser timezone)
              </CommandItem>
              {TIME_ZONES.map((tz) => (
                <CommandItem
                  key={tz}
                  value={tz}
                  onSelect={() => {
                    onChange(tz)
                    setOpen(false)
                  }}
                >
                  {tz}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
