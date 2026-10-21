import type { HassEntityRegistryEntry, HomeAssistant } from '../types/hass';
import { CARE_STATUSES, type Care, type CareKind, type CareStatus, type Plant } from './model';

const PLATFORM = 'plant_care';

// Entity roles of a plant, by the integration's translation keys.
const ROLES = {
  water: { next: 'next_watering', status: 'watering_status', button: 'water' },
  feed: { next: 'next_feeding', status: 'feeding_status', button: 'feed' },
} as const satisfies Record<CareKind, Record<string, string>>;
// The plant's photo: uploaded, else the species photo. Older integration
// versions have no photo entity and put the species photo on next_watering.
const PHOTO = 'photo';

type Hass = Pick<HomeAssistant, 'states' | 'entities' | 'devices'>;
type Roles = Map<string, string>; // role key → entity_id

const ALL_KEYS: string[] = [...Object.values(ROLES).flatMap((r) => Object.values(r)), PHOTO];

// translation_key when the registry has it, otherwise the entity_id suffix.
// Longest key first, so `_next_watering` never matches as `_water`.
const SUFFIX_KEYS = [...ALL_KEYS].sort((a, b) => b.length - a.length);
function roleOf(entry: HassEntityRegistryEntry): string | undefined {
  if (entry.translation_key && ALL_KEYS.includes(entry.translation_key)) {
    return entry.translation_key;
  }
  const domain = entry.entity_id.split('.')[0];
  const key = SUFFIX_KEYS.find((k) => entry.entity_id.endsWith(`_${k}`));
  if (!key) return undefined;
  const expected = key === 'water' || key === 'feed' ? 'button' : key === PHOTO ? 'image' : null;
  return (expected ? domain === expected : domain !== 'button') ? key : undefined;
}

function pictureOf(hass: Hass, entityId: string | undefined): string | null {
  const picture = entityId ? hass.states[entityId]?.attributes.entity_picture : undefined;
  return typeof picture === 'string' && picture ? picture : null;
}

function parseDate(state: string | undefined): Date | null {
  if (!state || state === 'unknown' || state === 'unavailable') return null;
  const date = new Date(state);
  return Number.isNaN(date.getTime()) ? null : date;
}

function parseStatus(state: string | undefined): CareStatus | null {
  return CARE_STATUSES.includes(state as CareStatus) ? (state as CareStatus) : null;
}

function parseInterval(value: unknown): number | null {
  const n = typeof value === 'string' ? Number(value) : value;
  return typeof n === 'number' && Number.isFinite(n) && n > 0 ? n : null;
}

function careOf(hass: Hass, roles: Roles, kind: CareKind): Care {
  const keys = ROLES[kind];
  const nextEntityId = roles.get(keys.next);
  const statusEntityId = roles.get(keys.status);
  const next = nextEntityId ? hass.states[nextEntityId] : undefined;
  return {
    kind,
    nextAt: parseDate(next?.state),
    status: parseStatus(statusEntityId ? hass.states[statusEntityId]?.state : undefined),
    intervalDays: parseInterval(next?.attributes.interval_days),
    nextEntityId,
    statusEntityId,
    buttonEntityId: roles.get(keys.button),
  };
}

export function discoverPlants(hass: Hass): Plant[] {
  const byDevice = new Map<string, Roles>();
  for (const entry of Object.values(hass.entities)) {
    if (entry.platform !== PLATFORM || !entry.device_id) continue;
    const role = roleOf(entry);
    if (!role) continue;
    let roles = byDevice.get(entry.device_id);
    if (!roles) byDevice.set(entry.device_id, (roles = new Map()));
    roles.set(role, entry.entity_id);
  }

  const plants: Plant[] = [];
  for (const [deviceId, roles] of byDevice) {
    if (!roles.has(ROLES.water.next) && !roles.has(ROLES.feed.next)) continue;
    const device = hass.devices[deviceId];
    const photo = roles.get(PHOTO);
    plants.push({
      deviceId,
      name: device?.name_by_user || device?.name || deviceId,
      areaId: device?.area_id ?? null,
      species: device?.model || null,
      image: pictureOf(hass, photo) ?? pictureOf(hass, roles.get(ROLES.water.next)),
      photoEntityId: photo,
      water: careOf(hass, roles, 'water'),
      feed: careOf(hass, roles, 'feed'),
    });
  }
  return plants;
}

// Every entity of a plant the cards render from.
export const plantEntityIds = (plant: Plant): string[] =>
  [
    ...[plant.water, plant.feed].flatMap((c) => [
      c.nextEntityId,
      c.statusEntityId,
      c.buttonEntityId,
    ]),
    plant.photoEntityId,
  ].filter((id): id is string => !!id);

export function plantByDevice(hass: Hass, deviceId: string): Plant | undefined {
  return discoverPlants(hass).find((p) => p.deviceId === deviceId);
}

export function plantsInArea(hass: Hass, areaId: string): Plant[] {
  return discoverPlants(hass).filter((p) => p.areaId === areaId);
}

// Picked plants in the given order, then the area's plants not picked already.
// Picked devices that are no longer plants are skipped.
export function plantsInGroup(hass: Hass, group: { area?: string; plants?: string[] }): Plant[] {
  const all = discoverPlants(hass);
  const picked = [...new Set(group.plants ?? [])]
    .map((id) => all.find((p) => p.deviceId === id))
    .filter((p): p is Plant => !!p);
  const inArea = group.area ? all.filter((p) => p.areaId === group.area) : [];
  return [...picked, ...inArea.filter((p) => !picked.includes(p))];
}
