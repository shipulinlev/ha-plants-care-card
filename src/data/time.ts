import type { HomeAssistant } from '../types/hass';

export interface DateParts {
  year: number;
  month: number; // 1–12
  day: number;
}

// Follows the user's profile setting, like the HA frontend: server time zone unless "local".
export function resolveTimeZone(hass: Pick<HomeAssistant, 'config' | 'locale'>): string {
  if (hass.locale.time_zone === 'local') {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  }
  return hass.config.time_zone;
}

const formatters = new Map<string, Intl.DateTimeFormat>();

export function datePartsIn(date: Date, timeZone: string): DateParts {
  let fmt = formatters.get(timeZone);
  if (!fmt) {
    fmt = new Intl.DateTimeFormat('en-US', {
      timeZone,
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
    });
    formatters.set(timeZone, fmt);
  }
  const parts = Object.fromEntries(fmt.formatToParts(date).map((p) => [p.type, p.value]));
  return { year: Number(parts.year), month: Number(parts.month), day: Number(parts.day) };
}

const dayNumber = ({ year, month, day }: DateParts) => Date.UTC(year, month - 1, day) / 86_400_000;

// Calendar days from `now` to `target` as seen in `timeZone`; negative when target is earlier.
export function calendarDaysBetween(now: Date, target: Date, timeZone: string): number {
  return dayNumber(datePartsIn(target, timeZone)) - dayNumber(datePartsIn(now, timeZone));
}

// The calendar date `n` days after `now` in `timeZone`.
export function addCalendarDays(now: Date, n: number, timeZone: string): DateParts {
  const { year, month, day } = datePartsIn(now, timeZone);
  const d = new Date(Date.UTC(year, month - 1, day + n));
  return { year: d.getUTCFullYear(), month: d.getUTCMonth() + 1, day: d.getUTCDate() };
}

// Noon UTC on a calendar date: a Date that formats to that date in any real time zone.
export function partsToDate({ year, month, day }: DateParts): Date {
  return new Date(Date.UTC(year, month - 1, day, 12));
}
