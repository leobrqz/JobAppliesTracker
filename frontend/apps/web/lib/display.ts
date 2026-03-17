export type TimeFormat = "12h" | "24h"

export function formatDate(iso: string, locale: string): string {
  return new Intl.DateTimeFormat(locale, {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date(iso))
}

export function formatTime(iso: string, locale: string, format: TimeFormat): string {
  return new Intl.DateTimeFormat(locale, {
    hour: "2-digit",
    minute: "2-digit",
    hour12: format === "12h",
  }).format(new Date(iso))
}

export function formatTimeRange(
  startsAt: string,
  endsAt: string | null,
  locale: string,
  format: TimeFormat,
): string {
  const start = new Intl.DateTimeFormat(locale, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: format === "12h",
  }).format(new Date(startsAt))
  if (!endsAt) return start
  const end = formatTime(endsAt, locale, format)
  return `${start} – ${end}`
}

