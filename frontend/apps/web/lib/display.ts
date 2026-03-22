export type TimeFormat = "12h" | "24h"

export function scheduleXTimeAxisFormatOptions(format: TimeFormat): Intl.DateTimeFormatOptions {
  return {
    hour: "2-digit",
    minute: "2-digit",
    hour12: format === "12h",
  }
}

export function formatDateTime(iso: string, locale: string, format: TimeFormat): string {
  return new Intl.DateTimeFormat(locale, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: format === "12h",
  }).format(new Date(iso))
}

export function formatTimeFromEpochMs(epochMs: number, locale: string, format: TimeFormat): string {
  return formatTime(new Date(epochMs).toISOString(), locale, format)
}

export function formatTimeRangeFromZoned(
  start: { toInstant: () => { epochMilliseconds: number } },
  end: { toInstant: () => { epochMilliseconds: number } },
  locale: string,
  format: TimeFormat,
): string {
  const a = formatTimeFromEpochMs(Number(start.toInstant().epochMilliseconds), locale, format)
  const b = formatTimeFromEpochMs(Number(end.toInstant().epochMilliseconds), locale, format)
  return `${a} – ${b}`
}

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

