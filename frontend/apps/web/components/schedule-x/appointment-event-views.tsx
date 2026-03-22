"use client"

import "temporal-polyfill/global"

import type { CSSProperties } from "react"
import type { CalendarEvent } from "@schedule-x/calendar"
import { Clock, MapPin, User } from "lucide-react"
import {
  formatTimeFromEpochMs,
  formatTimeRangeFromZoned,
  type TimeFormat,
} from "@/lib/display"

function calendarColorId(event: CalendarEvent): string {
  return event.calendarId ?? "other"
}

function monthGridEventStyles(event: CalendarEvent, hasStartDate: boolean): CSSProperties {
  const id = calendarColorId(event)
  return {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
    width: "100%",
    height: "100%",
    boxSizing: "border-box",
    padding: "var(--sx-spacing-padding1)",
    borderRadius: "var(--sx-rounding-extra-small)",
    overflow: "hidden",
    borderInlineStart: hasStartDate ? `4px solid var(--sx-color-${id})` : undefined,
    color: `var(--sx-color-on-${id}-container)`,
    backgroundColor: `var(--sx-color-${id}-container)`,
  }
}

function monthAgendaStyles(event: CalendarEvent): CSSProperties {
  const id = calendarColorId(event)
  return {
    boxSizing: "border-box",
    width: "100%",
    height: "100%",
    padding: "var(--sx-spacing-padding1)",
    backgroundColor: `var(--sx-color-${id}-container)`,
    color: `var(--sx-color-on-${id}-container)`,
    borderInlineStart: `4px solid var(--sx-color-${id})`,
  }
}

function timeGridInnerStyles(event: CalendarEvent): CSSProperties {
  const id = calendarColorId(event)
  return {
    boxSizing: "border-box",
    width: "100%",
    height: "100%",
    padding: "var(--sx-spacing-padding2, 4px)",
    backgroundColor: `var(--sx-color-${id}-container)`,
    color: `var(--sx-color-on-${id}-container)`,
    borderInlineStart: `4px solid var(--sx-color-${id})`,
    display: "flex",
    flexDirection: "column",
    gap: "2px",
    overflow: "hidden",
  }
}

function agendaTimeLabel(event: CalendarEvent, locale: string, timeFormat: TimeFormat): string {
  if (event.start instanceof Temporal.ZonedDateTime && event.end instanceof Temporal.ZonedDateTime) {
    return formatTimeRangeFromZoned(event.start, event.end, locale, timeFormat)
  }
  if (event.start instanceof Temporal.ZonedDateTime) {
    return formatTimeFromEpochMs(Number(event.start.toInstant().epochMilliseconds), locale, timeFormat)
  }
  return ""
}

export function createAppointmentScheduleXCustomComponents(locale: string, timeFormat: TimeFormat) {
  const iconStroke = "currentColor"

  function AppointmentMonthGridEvent({
    calendarEvent,
    hasStartDate,
  }: {
    calendarEvent: CalendarEvent
    hasStartDate: boolean
  }) {
    const time =
      calendarEvent.start instanceof Temporal.ZonedDateTime
        ? formatTimeFromEpochMs(
            Number(calendarEvent.start.toInstant().epochMilliseconds),
            locale,
            timeFormat,
          )
        : null
    return (
      <div style={monthGridEventStyles(calendarEvent, hasStartDate)}>
        {time ? <div className="sx__month-grid-event-time">{time}</div> : null}
        <div className="sx__month-grid-event-title">{calendarEvent.title}</div>
      </div>
    )
  }

  function AppointmentMonthAgendaEvent({ calendarEvent }: { calendarEvent: CalendarEvent }) {
    const timeLabel = agendaTimeLabel(calendarEvent, locale, timeFormat)
    return (
      <div style={monthAgendaStyles(calendarEvent)}>
        <div className="sx__month-agenda-event__title">{calendarEvent.title}</div>
        {timeLabel ? (
          <div className="sx__month-agenda-event__time sx__month-agenda-event__has-icon">
            <Clock className="size-3 shrink-0" stroke={iconStroke} aria-hidden />
            <div>{timeLabel}</div>
          </div>
        ) : null}
      </div>
    )
  }

  function AppointmentTimeGridEvent({ calendarEvent }: { calendarEvent: CalendarEvent }) {
    const id = calendarColorId(calendarEvent)
    const stroke = `var(--sx-color-on-${id}-container)`
    let timeLine: string | null = null
    if (
      calendarEvent.start instanceof Temporal.ZonedDateTime &&
      calendarEvent.end instanceof Temporal.ZonedDateTime
    ) {
      timeLine = formatTimeRangeFromZoned(calendarEvent.start, calendarEvent.end, locale, timeFormat)
    }
    return (
      <div style={timeGridInnerStyles(calendarEvent)}>
        {calendarEvent.title ? (
          <div className="sx__time-grid-event-title">{calendarEvent.title}</div>
        ) : null}
        {timeLine ? (
          <div className="sx__time-grid-event-time flex items-center gap-1">
            <Clock className="size-3 shrink-0" stroke={stroke} aria-hidden />
            <span>{timeLine}</span>
          </div>
        ) : null}
        {calendarEvent.people && calendarEvent.people.length > 0 ? (
          <div className="sx__time-grid-event-people flex items-center gap-1">
            <User className="size-3 shrink-0" stroke={stroke} aria-hidden />
            <span>{calendarEvent.people.join(", ")}</span>
          </div>
        ) : null}
        {calendarEvent.location ? (
          <div className="sx__time-grid-event-location flex items-center gap-1">
            <MapPin className="size-3 shrink-0" stroke={stroke} aria-hidden />
            <span>{calendarEvent.location}</span>
          </div>
        ) : null}
      </div>
    )
  }

  return {
    monthGridEvent: AppointmentMonthGridEvent,
    monthAgendaEvent: AppointmentMonthAgendaEvent,
    timeGridEvent: AppointmentTimeGridEvent,
  }
}
