// Single source of truth for event details — used by the landing page, the
// ticket email, the mentor scan page, and the attendance board. Edit here and
// everything updates.
//
// Each day now carries a stable `key` ("day1" | "day2" | "day3") — that key is
// what gets stored on each student's document (day1/day2/day3 booleans) and what
// the mentor scan sends. The `iso` field ("YYYY-MM-DD") is used to auto-detect
// which day "today" is, in India time, so the mentor page can pre-select it.

export type DayKey = "day1" | "day2" | "day3"

export interface EventDay {
  key: DayKey
  label: string   // "Day 1"
  date: string    // "16 August 2026" (display)
  iso: string     // "2026-08-16"     (for today-matching)
  time: string
}

export const EVENT = {
  name: "Web Development Bootcamp",
  venue: "LHL",
  campus: "IIT Bhubaneswar",
  days: [
    { key: "day1", label: "Day 1", date: "16 August 2026", iso: "2026-08-16", time: "10:00 AM – 1:00 PM" },
    { key: "day2", label: "Day 2", date: "17 August 2026", iso: "2026-08-17", time: "5:30 PM – 9:00 PM" },
    { key: "day3", label: "Day 3", date: "19 August 2026", iso: "2026-08-19", time: "5:30 PM – 9:00 PM" },
  ] as EventDay[],

  WhatsappGroupLink: "https://chat.whatsapp.com/CHhIzCIyEIi6DC4zQEXaWG?s=qt&p=a&ilr=4",
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
// otherwise the last event day that has already started (so a late/after-hours
// scan still lands sensibly), falling back to Day 1. The mentor can always
// override with a tap.
export function defaultScanDayKey(d: Date = new Date()): DayKey {
  const exact = todayEventDayKey(d)
  if (exact) return exact
  const today = istDateISO(d)
  const started = [...EVENT.days].reverse().find((day) => day.iso <= today)
  return started?.key ?? "day1"
}