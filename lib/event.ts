// Single source of truth for event details — used by the landing page, the
// ticket email, the mentor scan page, and the attendance board. Edit here and
// everything updates.
//
// Each day carries a stable `key` ("day1" | "day2") — that key is what gets
// stored on each participant's document (day1/day2 booleans) and what the mentor
// scan sends. The `iso` field ("YYYY-MM-DD") auto-detects which day "today" is,
// in India time, so the mentor page pre-selects it.

export type DayKey = "day1" | "day2"

export interface EventDay {
  key: DayKey
  label: string     // "Day 01"
  date: string      // "4 September 2026" (display)
  iso: string       // "2026-09-04"       (for today-matching)
  time: string      // shown on landing + ticket
  topics: string[]  // curriculum shown on the landing schedule
}

export const EVENT = {
  name: "Design Bootcamp",
  tagline: "Be a part of something creative",
  venue: "UHL",
  campus: "IIT Bhubaneswar",
  days: [
    {
      key: "day1",
      label: "Day 01",
      date: "4 September 2026",
      iso: "2026-09-04",
      time: "Time to be announced",
      topics: ["Design Theory", "Colour Theory", "Figma Fundamentals"],
    },
    {
      key: "day2",
      label: "Day 02",
      date: "5 September 2026",
      iso: "2026-09-05",
      time: "Time to be announced",
      topics: ["Figma Basics", "Motion Graphics", "Blender"],
    },
  ] as EventDay[],
}

// All valid day keys, in order.
export const DAY_KEYS: DayKey[] = EVENT.days.map((d) => d.key)

export function isDayKey(v: unknown): v is DayKey {
  return typeof v === "string" && (DAY_KEYS as string[]).includes(v)
}

export function dayLabel(key: DayKey): string {
  return EVENT.days.find((d) => d.key === key)?.label ?? key
}

// Today's date as "YYYY-MM-DD" in Asia/Kolkata (IST), regardless of the device's
// own timezone. en-CA formats as YYYY-MM-DD.
export function istDateISO(d: Date = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(d)
}

// Which event day is "today" in IST, or null if today isn't an event day.
export function todayEventDayKey(d: Date = new Date()): DayKey | null {
  const today = istDateISO(d)
  return EVENT.days.find((day) => day.iso === today)?.key ?? null
}

// The day to PRE-SELECT on the mentor page: today if it's an event day,
// otherwise the last event day that has already started, falling back to Day 1.
// The mentor can always override with a tap.
export function defaultScanDayKey(d: Date = new Date()): DayKey {
  const exact = todayEventDayKey(d)
  if (exact) return exact
  const today = istDateISO(d)
  const started = [...EVENT.days].reverse().find((day) => day.iso <= today)
  return started?.key ?? "day1"
}