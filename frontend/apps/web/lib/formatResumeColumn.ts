import type { ResumeResponse } from "@/types"

export function formatResumeColumn(
  resumeId: number | null | undefined,
  map: Record<number, ResumeResponse>,
): string {
  if (resumeId == null) return ""
  const resume = map[resumeId]
  const name = resume?.name ?? "Unknown"
  return `${name} | ${resumeId}`
}
