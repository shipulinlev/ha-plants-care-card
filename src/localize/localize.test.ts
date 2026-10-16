import { describe, expect, it } from 'vitest';
import { createLocalize, formatShortDate, type TranslationKey } from './localize';

describe('createLocalize', () => {
  const t = createLocalize('en');

  it('returns plain strings', () => {
    expect(t('today')).toBe('Today');
    expect(t('status.not_set')).toBe('Not set');
  });

  it('picks plural forms and interpolates', () => {
    expect(t('in_days', { n: 1 })).toBe('in 1 day');
    expect(t('in_days', { n: 5 })).toBe('in 5 days');
    expect(t('need_care_today', { n: 1 })).toBe('1 needs care today');
    expect(t('need_care_today', { n: 2 })).toBe('2 need care today');
    expect(t('was_due', { date: 'Sat 10 Oct' })).toBe('Was due Sat 10 Oct');
  });

  it('falls back to English for unknown languages', () => {
    expect(createLocalize('xx')('tomorrow')).toBe('Tomorrow');
    expect(createLocalize('en-GB')('tomorrow')).toBe('Tomorrow');
  });

  it('returns the key when it is missing everywhere', () => {
    expect(t('nope' as TranslationKey)).toBe('nope');
  });
});

describe('formatShortDate', () => {
  const date = new Date('2026-10-15T12:00:00Z');

  it('uses the design order for plain English', () => {
    expect(formatShortDate(date, 'en', 'Europe/London')).toBe('Thu 15 Oct');
  });

  it('formats in the given time zone', () => {
    expect(formatShortDate(new Date('2026-10-15T23:30:00Z'), 'en', 'Europe/Moscow')).toBe(
      'Fri 16 Oct',
    );
  });
});
