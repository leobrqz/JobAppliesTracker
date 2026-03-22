import "temporal-polyfill/global"

import { describe, expect, it } from "vitest"
import {
  formatDateTime,
  formatTimeFromEpochMs,
  formatTimeRangeFromZoned,
  scheduleXTimeAxisFormatOptions,
} from "@/lib/display"

describe("scheduleXTimeAxisFormatOptions", () => {
  it("uses 12-hour clock for 12h preference", () => {
    expect(scheduleXTimeAxisFormatOptions("12h")).toMatchObject({
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    })
  })

  it("uses 24-hour clock for 24h preference", () => {
    expect(scheduleXTimeAxisFormatOptions("24h")).toMatchObject({
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    })
  })
})

describe("formatDateTime", () => {
  it("omits AM/PM for 24h in en-US", () => {
    const s = formatDateTime("2025-06-15T18:30:00.000Z", "en-US", "24h")
    expect(s).not.toMatch(/\b(AM|PM)\b/i)
    expect(s).toMatch(/2025/)
  })

  it("can include AM/PM for 12h in en-US", () => {
    const s = formatDateTime("2025-06-15T18:30:00.000Z", "en-US", "12h")
    expect(s).toMatch(/\b(AM|PM)\b/i)
  })
})

describe("formatTimeFromEpochMs", () => {
  it("formats with explicit 24h", () => {
    const ms = Date.UTC(2025, 5, 15, 18, 30, 0)
    const s = formatTimeFromEpochMs(ms, "en-US", "24h")
    expect(s).not.toMatch(/\b(AM|PM)\b/i)
  })
})

describe("formatTimeRangeFromZoned", () => {
  it("joins start and end with en dash", () => {
    const tz = Temporal.Now.timeZoneId()
    const start = Temporal.ZonedDateTime.from(`2025-06-15T10:00:00[${tz}]`)
    const end = Temporal.ZonedDateTime.from(`2025-06-15T11:30:00[${tz}]`)
    const s = formatTimeRangeFromZoned(start, end, "en-US", "24h")
    expect(s).toContain("–")
    expect(s).not.toMatch(/\b(AM|PM)\b/i)
  })
})
