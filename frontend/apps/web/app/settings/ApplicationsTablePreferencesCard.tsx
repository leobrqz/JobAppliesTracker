"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@workspace/ui/components/card"
import { Field, FieldGroup, FieldLabel } from "@workspace/ui/components/field"
import { Switch } from "@workspace/ui/components/switch"
import { useApplicationsTablePreferences } from "@/hooks/useApplicationsTablePreferences"

export function ApplicationsTablePreferencesCard() {
  const [prefs, setPrefs] = useApplicationsTablePreferences()

  return (
    <Card id="applications-table">
      <CardHeader>
        <div className="flex flex-col gap-1">
          <CardTitle className="text-base">Applications table</CardTitle>
          <p className="text-xs text-muted-foreground">
            Optional columns and row density for the applications list. Job title opens a read-only detail
            view.
          </p>
        </div>
      </CardHeader>
      <CardContent>
        <FieldGroup>
          <Field>
            <div className="flex items-center justify-between gap-4">
              <div className="flex flex-col gap-1">
                <FieldLabel>Resume column</FieldLabel>
                <p className="text-xs text-muted-foreground">
                  Show linked resume as name and id (e.g. My CV | 3).
                </p>
              </div>
              <Switch
                checked={prefs.showResumeColumn}
                onCheckedChange={(checked) =>
                  setPrefs({ ...prefs, showResumeColumn: checked })
                }
                aria-label="Show resume column"
              />
            </div>
          </Field>
          <Field>
            <div className="flex items-center justify-between gap-4">
              <div className="flex flex-col gap-1">
                <FieldLabel>Salary column</FieldLabel>
                <p className="text-xs text-muted-foreground">Show stored salary when present.</p>
              </div>
              <Switch
                checked={prefs.showSalaryColumn}
                onCheckedChange={(checked) =>
                  setPrefs({ ...prefs, showSalaryColumn: checked })
                }
                aria-label="Show salary column"
              />
            </div>
          </Field>
          <Field>
            <div className="flex items-center justify-between gap-4">
              <div className="flex flex-col gap-1">
                <FieldLabel>Seniority column</FieldLabel>
                <p className="text-xs text-muted-foreground">Show seniority level when set.</p>
              </div>
              <Switch
                checked={prefs.showSeniorityColumn}
                onCheckedChange={(checked) =>
                  setPrefs({ ...prefs, showSeniorityColumn: checked })
                }
                aria-label="Show seniority column"
              />
            </div>
          </Field>
          <Field>
            <div className="flex items-center justify-between gap-4">
              <div className="flex flex-col gap-1">
                <FieldLabel>Created date column</FieldLabel>
                <p className="text-xs text-muted-foreground">Show when the record was created.</p>
              </div>
              <Switch
                checked={prefs.showCreatedAtColumn}
                onCheckedChange={(checked) =>
                  setPrefs({ ...prefs, showCreatedAtColumn: checked })
                }
                aria-label="Show created at column"
              />
            </div>
          </Field>
          <Field>
            <div className="flex items-center justify-between gap-4">
              <div className="flex flex-col gap-1">
                <FieldLabel>Compact rows</FieldLabel>
                <p className="text-xs text-muted-foreground">Tighter padding and slightly smaller text.</p>
              </div>
              <Switch
                checked={prefs.compactDensity}
                onCheckedChange={(checked) =>
                  setPrefs({ ...prefs, compactDensity: checked })
                }
                aria-label="Compact table density"
              />
            </div>
          </Field>
        </FieldGroup>
      </CardContent>
    </Card>
  )
}
