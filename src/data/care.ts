import { formatShortDate, type Localize } from '../localize/localize';
import type { Care, CareKind, CareStatus, Plant } from './model';
import { addCalendarDays, calendarDaysBetween } from './time';

// Everything the wording depends on. `now` is passed in so the output is deterministic.
export interface CareContext {
  now: Date;
  timeZone: string;
  language: string;
  t: Localize;
  dateFormat: 'relative' | 'absolute';
  showInterval: boolean;
}

// One care action, ready to render. Ported from care() in docs/design/Plant Card.dc.html.
export interface CareView {
  kind: CareKind;
  label: string; // "Water" / "Feed"
  days: number | null; // calendar days until due; negative = late; null = not scheduled
  status: CareStatus | null;
  statusLabel: string;
  big: string; // "3" / "Today" / "—"
  unit: string; // "days" / "days late" / ""
  text: string; // "in 3 days" / "Tomorrow" / "Today" / "3 days late" / "Thu 15 Oct"
  textLower: string; // for mid-sentence use: "today" / "tomorrow"
  short: string; // area list chip: "3 d" / "Today" / "3 d late"
  sub: string; // "Thu 15 Oct · every 7 days"
  progress: number | null; // 0–1 share of the interval elapsed; null without an interval
  button: string | null; // the integration's button entity that logs this care
  logLabel: string; // "Log a watering" / "Log a feeding"
}

const DAY_MS = 86_400_000;
// The integration's EngineSettings defaults.
const SOON_WINDOW_MS = DAY_MS;
const OVERDUE_AFTER_MS = DAY_MS;
const URGENCY: Record<CareStatus, number> = { ok: 0, soon: 1, due: 2, overdue: 3 };

// The integration's care_status() rule (core/status.py), evaluated now.
export function liveStatus(nextAt: Date, now: Date): CareStatus {
  const left = nextAt.getTime() - now.getTime();
  if (left <= -OVERDUE_AFTER_MS) return 'overdue';
  if (left <= 0) return 'due';
  return left <= SOON_WINDOW_MS ? 'soon' : 'ok';
}

// The integration only re-evaluates its status sensor when it polls, so a status can lag the
// clock. Take the more urgent of the reported and the live status; null stays "Not set".
export function careStatus(care: Care, now: Date): CareStatus | null {
  if (care.status === null || !care.nextAt) return care.status;
  const live = liveStatus(care.nextAt, now);
  return URGENCY[live] > URGENCY[care.status] ? live : care.status;
}

export function careDays(care: Care, ctx: Pick<CareContext, 'now' | 'timeZone'>): number | null {
  return care.nextAt ? calendarDaysBetween(ctx.now, care.nextAt, ctx.timeZone) : null;
}

export function careView(care: Care, ctx: CareContext): CareView {
  const { t } = ctx;
  const label = t(care.kind === 'water' ? 'care.water' : 'care.feed');
  const days = careDays(care, ctx);
  const status = careStatus(care, ctx.now);
  const button = care.buttonEntityId ?? null;
  const logLabel = t(care.kind === 'water' ? 'log.water' : 'log.feed');

  if (days === null || status === null || !care.nextAt) {
    const none = t('none');
    return {
      kind: care.kind,
      label,
      days: null,
      status: null,
      statusLabel: t('status.not_set'),
      big: none,
      unit: '',
      text: none,
      textLower: none,
      short: none,
      sub: '',
      progress: null,
      button,
      logLabel,
    };
  }

  const n = Math.abs(days);
  const date = formatShortDate(care.nextAt, ctx.language, ctx.timeZone);
  const absolute = ctx.dateFormat === 'absolute';

  const relative =
    days === 0
      ? t('today')
      : days === 1
        ? t('tomorrow')
        : days > 1
          ? t('in_days', { n })
          : t('days_late', { n });
  const text = absolute && days > 1 ? date : relative;
  const textLower = days === 0 ? t('today_lower') : days === 1 ? t('tomorrow_lower') : text;

  const subParts = [
    days < 0
      ? t('was_due', { date })
      : days === 0
        ? t('due_today')
        : absolute
          ? t('in_days', { n })
          : date,
  ];
  if (ctx.showInterval && care.intervalDays) {
    subParts.push(t('every_days', { n: care.intervalDays }));
  }

  return {
    kind: care.kind,
    label,
    days,
    status,
    statusLabel: t(`status.${status}`),
    big: days === 0 ? t('today') : String(n),
    unit: days === 0 ? '' : days < 0 ? t('unit_late', { n }) : t('unit_day', { n }),
    text,
    textLower,
    short: days === 0 ? t('today') : days > 0 ? t('short_days', { n }) : t('short_late', { n }),
    sub: subParts.join(' · '),
    progress: care.intervalDays
      ? Math.max(0, Math.min(1, (care.intervalDays - days) / care.intervalDays))
      : null,
    button,
    logLabel,
  };
}

// Unknown days sort after any known ones.
const byDays = (a: number | null, b: number | null) =>
  a === b ? 0 : a === null ? 1 : b === null ? -1 : a - b;

// The countdown layout's [next, then]: the sooner care first; water wins a tie.
export function nextAndThen(plant: Plant, ctx: CareContext): [CareView, CareView] {
  const water = careView(plant.water, ctx);
  const feed = careView(plant.feed, ctx);
  return byDays(water.days, feed.days) <= 0 ? [water, feed] : [feed, water];
}

export interface RulerCell {
  day: number; // day of month
  isToday: boolean;
  water: boolean;
  feed: boolean;
}

export const RULER_DAYS = 15; // today + 14

// The 14-day ruler. Overdue care pins to today; care beyond the ruler has no marker.
export function ruler(plant: Plant, ctx: Pick<CareContext, 'now' | 'timeZone'>): RulerCell[] {
  const at = (care: Care) => {
    const days = careDays(care, ctx);
    return days === null || care.status === null ? -1 : Math.max(0, days);
  };
  const water = at(plant.water);
  const feed = at(plant.feed);
  return Array.from({ length: RULER_DAYS }, (_, i) => ({
    day: addCalendarDays(ctx.now, i, ctx.timeZone).day,
    isToday: i === 0,
    water: water === i,
    feed: feed === i,
  }));
}

// Days until the plant's most urgent care; null when nothing is scheduled.
export function urgency(plant: Plant, ctx: Pick<CareContext, 'now' | 'timeZone'>): number | null {
  const known = [plant.water, plant.feed]
    .filter((c) => c.status !== null)
    .map((c) => careDays(c, ctx))
    .filter((d): d is number => d !== null);
  return known.length ? Math.min(...known) : null;
}

// Most urgent first; unscheduled plants last; ties by name.
export function sortByUrgency(
  plants: Plant[],
  ctx: Pick<CareContext, 'now' | 'timeZone' | 'language'>,
): Plant[] {
  const keyed = plants.map((plant) => ({ plant, urgency: urgency(plant, ctx) }));
  keyed.sort(
    (a, b) =>
      byDays(a.urgency, b.urgency) || a.plant.name.localeCompare(b.plant.name, ctx.language),
  );
  return keyed.map((k) => k.plant);
}

// Same rule as the integration's needs_water / needs_feeding binary sensors, on the live status.
export function needsCare(plant: Plant, now: Date): boolean {
  return [plant.water, plant.feed]
    .map((c) => careStatus(c, now))
    .some((s) => s === 'due' || s === 'overdue');
}

export function groupSummary(
  plants: Plant[],
  t: Localize,
  now: Date,
): { countText: string; attentionText: string } {
  const attention = plants.filter((p) => needsCare(p, now)).length;
  return {
    countText: t('plants_count', { n: plants.length }),
    attentionText: attention ? t('need_care_today', { n: attention }) : t('all_on_schedule'),
  };
}
