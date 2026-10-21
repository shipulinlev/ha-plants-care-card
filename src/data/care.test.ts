import { describe, expect, it } from 'vitest';
import { createMockHass, TODAY } from '../../dev/mock-hass';
import { createLocalize } from '../localize/localize';
import {
  groupSummary,
  careStatus,
  careView,
  liveStatus,
  needsCare,
  nextAndThen,
  ruler,
  sortByUrgency,
  urgency,
  type CareContext,
} from './care';
import { discoverPlants, plantsInArea } from './discover';
import type { Care, CareStatus, Plant } from './model';

const NOW = new Date('2026-10-13T12:00:00Z'); // a Tuesday
const DAY = 86_400_000;

const ctx = (over: Partial<CareContext> = {}): CareContext => ({
  now: NOW,
  timeZone: 'UTC',
  language: 'en',
  t: createLocalize('en'),
  dateFormat: 'relative',
  showInterval: true,
  ...over,
});

const care = (days: number | null, over: Partial<Care> = {}): Care => ({
  kind: 'water',
  nextAt: days === null ? null : new Date(NOW.getTime() + days * DAY),
  status: 'ok',
  intervalDays: 7,
  ...over,
});

const plant = (name: string, water: Care, feed: Care): Plant => ({
  deviceId: name,
  name,
  areaId: 'a',
  species: null,
  image: null,
  water,
  feed: { ...feed, kind: 'feed' },
});

describe('careView: design copy table', () => {
  const cases: Array<[number, Record<string, string>, Record<string, string>]> = [
    [
      12,
      {
        big: '12',
        unit: 'days',
        text: 'in 12 days',
        short: '12 d',
        sub: 'Sun 25 Oct · every 7 days',
      },
      { text: 'Sun 25 Oct', sub: 'in 12 days · every 7 days' },
    ],
    [
      2,
      { big: '2', unit: 'days', text: 'in 2 days', short: '2 d', sub: 'Thu 15 Oct · every 7 days' },
      { text: 'Thu 15 Oct', sub: 'in 2 days · every 7 days' },
    ],
    [
      1,
      { big: '1', unit: 'day', text: 'Tomorrow', short: '1 d', sub: 'Wed 14 Oct · every 7 days' },
      { text: 'Tomorrow', sub: 'in 1 day · every 7 days' },
    ],
    [
      0,
      { big: 'Today', unit: '', text: 'Today', short: 'Today', sub: 'Due today · every 7 days' },
      { text: 'Today', sub: 'Due today · every 7 days' },
    ],
    [
      -1,
      {
        big: '1',
        unit: 'day late',
        text: '1 day late',
        short: '1 d late',
        sub: 'Was due Mon 12 Oct · every 7 days',
      },
      { text: '1 day late', sub: 'Was due Mon 12 Oct · every 7 days' },
    ],
    [
      -3,
      {
        big: '3',
        unit: 'days late',
        text: '3 days late',
        short: '3 d late',
        sub: 'Was due Sat 10 Oct · every 7 days',
      },
      { text: '3 days late', sub: 'Was due Sat 10 Oct · every 7 days' },
    ],
  ];

  it.each(cases)('days %i', (days, relative, absolute) => {
    expect(careView(care(days), ctx())).toMatchObject({ days, ...relative });
    expect(careView(care(days), ctx({ dateFormat: 'absolute' }))).toMatchObject(absolute);
  });

  it('lowercases today and tomorrow for mid-sentence use', () => {
    expect(careView(care(0), ctx()).textLower).toBe('today');
    expect(careView(care(1), ctx()).textLower).toBe('tomorrow');
    expect(careView(care(5), ctx()).textLower).toBe('in 5 days');
  });
});

describe('live status', () => {
  const HOUR = 3_600_000;
  const at = (ms: number) => new Date(NOW.getTime() + ms);

  it('follows the integration rule', () => {
    expect(liveStatus(at(DAY + HOUR), NOW)).toBe('ok');
    expect(liveStatus(at(DAY), NOW)).toBe('soon');
    expect(liveStatus(at(HOUR), NOW)).toBe('soon');
    expect(liveStatus(at(0), NOW)).toBe('due');
    expect(liveStatus(at(-DAY + HOUR), NOW)).toBe('due');
    expect(liveStatus(at(-DAY), NOW)).toBe('overdue');
  });

  it('moves on from a stale sensor but never below what it reports', () => {
    expect(careStatus(care(0.5, { status: 'ok' }), NOW)).toBe('soon');
    expect(careStatus(care(-2, { status: 'soon' }), NOW)).toBe('overdue');
    expect(careStatus(care(2, { status: 'soon' }), NOW)).toBe('soon');
    expect(careStatus(care(2, { status: null }), NOW)).toBeNull();
  });

  it('rolls the chip over as time passes', () => {
    const c = care(0.5, { status: 'soon' });
    expect(careView(c, ctx()).statusLabel).toBe('Soon');
    expect(careView(c, ctx({ now: new Date(NOW.getTime() + DAY) })).statusLabel).toBe('Due');
    expect(careView(c, ctx({ now: new Date(NOW.getTime() + 2 * DAY) })).statusLabel).toBe(
      'Overdue',
    );
  });
});

describe('careView: details', () => {
  it('carries the button that logs the care', () => {
    expect(careView(care(5, { buttonEntityId: 'button.p_water' }), ctx())).toMatchObject({
      button: 'button.p_water',
      logLabel: 'Log a watering',
    });
    expect(careView(care(null, { kind: 'feed' }), ctx())).toMatchObject({
      button: null,
      logLabel: 'Log a feeding',
    });
  });

  it('takes the status from the integration', () => {
    const view = careView(care(5, { status: 'soon' }), ctx());
    expect(view).toMatchObject({ status: 'soon', statusLabel: 'Soon', label: 'Water' });
    expect(careView(care(5, { kind: 'feed' }), ctx()).label).toBe('Feed');
  });

  it('hides the interval when asked or unknown', () => {
    expect(careView(care(2), ctx({ showInterval: false })).sub).toBe('Thu 15 Oct');
    expect(careView(care(2, { intervalDays: null }), ctx()).sub).toBe('Thu 15 Oct');
  });

  it('clamps progress and drops it without an interval', () => {
    expect(careView(care(2), ctx()).progress).toBeCloseTo(5 / 7);
    expect(careView(care(-3), ctx()).progress).toBe(1);
    expect(careView(care(12), ctx()).progress).toBe(0);
    expect(careView(care(2, { intervalDays: null }), ctx()).progress).toBeNull();
  });

  it('counts calendar days in the HA time zone', () => {
    // 22:30 UTC on the 13th is already the 14th in Moscow.
    const c = care(null, { nextAt: new Date('2026-10-13T22:30:00Z') });
    expect(careView(c, ctx()).days).toBe(0);
    expect(careView(c, ctx({ timeZone: 'Europe/Moscow' })).days).toBe(1);
  });

  it.each([
    ['no date', care(null)],
    ['no status', care(3, { status: null })],
  ])('shows "Not set" with %s', (_, c) => {
    expect(careView(c, ctx())).toMatchObject({
      days: null,
      status: null,
      statusLabel: 'Not set',
      big: '—',
      unit: '',
      text: '—',
      short: '—',
      sub: '',
      progress: null,
    });
  });
});

describe('nextAndThen', () => {
  it('puts the sooner care first', () => {
    const [next, then] = nextAndThen(plant('p', care(12), care(2)), ctx());
    expect([next.kind, then.kind]).toEqual(['feed', 'water']);
  });

  it('prefers water on a tie and known over unknown', () => {
    expect(nextAndThen(plant('p', care(2), care(2)), ctx())[0].kind).toBe('water');
    expect(nextAndThen(plant('p', care(null), care(9)), ctx())[0].kind).toBe('feed');
  });
});

describe('ruler', () => {
  it('has 15 days starting today', () => {
    const cells = ruler(plant('p', care(2), care(12)), ctx());
    expect(cells).toHaveLength(15);
    expect(cells[0]).toMatchObject({ day: 13, isToday: true });
    expect(cells[14]).toMatchObject({ day: 27, isToday: false });
    expect(cells.findIndex((c) => c.water)).toBe(2);
    expect(cells.findIndex((c) => c.feed)).toBe(12);
  });

  it('pins overdue care to today and drops care beyond the ruler', () => {
    const cells = ruler(plant('p', care(-3), care(20)), ctx());
    expect(cells[0].water).toBe(true);
    expect(cells.some((c) => c.feed)).toBe(false);
  });

  it('has no marker for unknown care', () => {
    const cells = ruler(plant('p', care(null), care(1, { status: null })), ctx());
    expect(cells.some((c) => c.water || c.feed)).toBe(false);
  });
});

describe('urgency and sorting', () => {
  it('uses the most urgent known care', () => {
    expect(urgency(plant('p', care(4), care(-1)), ctx())).toBe(-1);
    expect(urgency(plant('p', care(null), care(6)), ctx())).toBe(6);
    expect(urgency(plant('p', care(null), care(null)), ctx())).toBeNull();
  });

  it('matches the design living room order', () => {
    const hass = createMockHass();
    const sorted = sortByUrgency(plantsInArea(hass, 'living_room'), {
      now: TODAY,
      timeZone: hass.config.time_zone,
      language: 'en',
    });
    expect(sorted.map((p) => p.name)).toEqual([
      'Fiddle-leaf fig',
      'Monstera',
      'Pothos',
      'Snake plant',
    ]);
  });

  it('puts unscheduled plants last and breaks ties by name', () => {
    const sorted = sortByUrgency(
      [
        plant('Zed', care(null), care(null)),
        plant('Bee', care(3), care(9)),
        plant('Ant', care(3), care(9)),
      ],
      ctx(),
    );
    expect(sorted.map((p) => p.name)).toEqual(['Ant', 'Bee', 'Zed']);
  });
});

describe('needsCare and groupSummary', () => {
  const withStatus = (water: CareStatus | null, feed: CareStatus | null) =>
    plant('p', care(5, { status: water }), care(5, { status: feed }));
  const t = createLocalize('en');

  it('follows the due/overdue statuses', () => {
    expect(needsCare(withStatus('ok', 'soon'), NOW)).toBe(false);
    expect(needsCare(withStatus('due', 'ok'), NOW)).toBe(true);
    expect(needsCare(withStatus(null, 'overdue'), NOW)).toBe(true);
    expect(needsCare(withStatus(null, null), NOW)).toBe(false);
  });

  it('counts care that has become due since the last poll', () => {
    expect(needsCare(plant('p', care(-0.1), care(5)), NOW)).toBe(true);
  });

  it('summarises an area', () => {
    expect(groupSummary([withStatus('ok', 'ok')], t, NOW)).toEqual({
      countText: '1 plant',
      attentionText: 'All on schedule',
    });
    expect(groupSummary([withStatus('due', 'ok'), withStatus('ok', 'ok')], t, NOW)).toEqual({
      countText: '2 plants',
      attentionText: '1 needs care today',
    });
    expect(groupSummary([withStatus('due', 'ok'), withStatus('overdue', 'ok')], t, NOW)).toEqual({
      countText: '2 plants',
      attentionText: '2 need care today',
    });
  });

  it('counts the mock living room like the design', () => {
    const living = discoverPlants(createMockHass()).filter((p) => p.areaId === 'living_room');
    expect(groupSummary(living, t, TODAY).attentionText).toBe('1 needs care today');
  });
});
