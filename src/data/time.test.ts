import { describe, expect, it } from 'vitest';
import { addCalendarDays, calendarDaysBetween, resolveTimeZone } from './time';

const utc = (iso: string) => new Date(`${iso}Z`);

describe('calendarDaysBetween', () => {
  const tz = 'Europe/London';

  it('counts calendar days, not 24h blocks', () => {
    const now = utc('2026-10-13T23:00:00');
    expect(calendarDaysBetween(now, utc('2026-10-13T23:30:00'), 'UTC')).toBe(0);
    expect(calendarDaysBetween(now, utc('2026-10-14T00:30:00'), 'UTC')).toBe(1);
    expect(calendarDaysBetween(now, utc('2026-10-12T22:00:00'), 'UTC')).toBe(-1);
    expect(calendarDaysBetween(now, utc('2026-12-31T12:00:00'), 'UTC')).toBe(79);
  });

  it('uses the given time zone near midnight', () => {
    // 23:30 UTC is already 02:30 next day in Moscow (UTC+3).
    const now = utc('2026-10-13T20:00:00');
    const target = utc('2026-10-13T23:30:00');
    expect(calendarDaysBetween(now, target, 'UTC')).toBe(0);
    expect(calendarDaysBetween(now, target, 'Europe/Moscow')).toBe(1);
  });

  it('is not shifted by a DST change', () => {
    // London leaves BST on 2026-10-25.
    expect(calendarDaysBetween(utc('2026-10-24T23:30:00'), utc('2026-10-26T00:30:00'), tz)).toBe(1);
    expect(calendarDaysBetween(utc('2026-10-20T12:00:00'), utc('2026-10-27T12:00:00'), tz)).toBe(7);
  });
});

describe('addCalendarDays', () => {
  it('rolls over months and years', () => {
    expect(addCalendarDays(utc('2026-12-30T12:00:00'), 3, 'UTC')).toEqual({
      year: 2027,
      month: 1,
      day: 2,
    });
  });

  it('starts from the date in the time zone', () => {
    expect(addCalendarDays(utc('2026-10-13T23:30:00'), 0, 'Europe/Moscow')).toEqual({
      year: 2026,
      month: 10,
      day: 14,
    });
  });
});

describe('resolveTimeZone', () => {
  const config = { time_zone: 'Asia/Tokyo' };

  it('uses the server zone by default', () => {
    expect(resolveTimeZone({ config, locale: { language: 'en' } })).toBe('Asia/Tokyo');
    expect(resolveTimeZone({ config, locale: { language: 'en', time_zone: 'server' } })).toBe(
      'Asia/Tokyo',
    );
  });

  it('uses the browser zone when the profile says local', () => {
    expect(resolveTimeZone({ config, locale: { language: 'en', time_zone: 'local' } })).toBe(
      Intl.DateTimeFormat().resolvedOptions().timeZone,
    );
  });
});
