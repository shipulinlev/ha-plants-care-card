import type {
  HassArea,
  HassDevice,
  HassEntityRegistryEntry,
  HassEntityState,
  HomeAssistant,
} from '../src/types/hass';

// The five prototype plants from docs/design/Plant Card.dc.html, today = 2026-10-13,
// plus a fern with no care logged yet.
// Species (device.model) and interval_days use the shape planned for plant_care (Phase 6).
export const TODAY = new Date(2026, 9, 13, 12, 0, 0);

type Care = { days: number; interval: number };
// null: no care logged yet, so the schedule sensors are unknown.
type MockPlant = {
  name: string;
  species: string;
  area: string;
  water: Care | null;
  feed: Care | null;
};

const PLANTS: Record<string, MockPlant> = {
  fern: {
    name: 'Boston fern',
    species: 'Nephrolepis exaltata',
    area: 'kitchen',
    water: null,
    feed: null,
  },
  monstera: {
    name: 'Monstera',
    species: 'Monstera deliciosa',
    area: 'living_room',
    water: { days: 2, interval: 7 },
    feed: { days: 12, interval: 30 },
  },
  calathea: {
    name: 'Calathea',
    species: 'Calathea orbifolia',
    area: 'bedroom',
    water: { days: 0, interval: 4 },
    feed: { days: 5, interval: 21 },
  },
  ficus: {
    name: 'Fiddle-leaf fig',
    species: 'Ficus lyrata',
    area: 'living_room',
    water: { days: -3, interval: 9 },
    feed: { days: -1, interval: 28 },
  },
  pothos: {
    name: 'Pothos',
    species: 'Epipremnum aureum',
    area: 'living_room',
    water: { days: 6, interval: 10 },
    feed: { days: 20, interval: 30 },
  },
  snake: {
    name: 'Snake plant',
    species: 'Dracaena trifasciata',
    area: 'living_room',
    water: { days: 15, interval: 21 },
    feed: { days: 40, interval: 60 },
  },
};

// Mirrors the prototype; the real integration reports status itself.
const statusFor = (days: number) =>
  days < 0 ? 'overdue' : days === 0 ? 'due' : days <= 2 ? 'soon' : 'ok';

const at = (days: number) => {
  const d = new Date(TODAY);
  d.setDate(d.getDate() + days);
  return d.toISOString();
};

export function createMockHass(): HomeAssistant {
  const states: Record<string, HassEntityState> = {};
  const entities: Record<string, HassEntityRegistryEntry> = {};
  const devices: Record<string, HassDevice> = {};
  const areas: Record<string, HassArea> = {
    living_room: { area_id: 'living_room', name: 'Living room' },
    bedroom: { area_id: 'bedroom', name: 'Bedroom' },
    kitchen: { area_id: 'kitchen', name: 'Kitchen' },
    office: { area_id: 'office', name: 'Office' }, // no plants
  };

  const add = (
    deviceId: string,
    entityId: string,
    key: string,
    state: string,
    attributes: Record<string, unknown> = {},
  ) => {
    entities[entityId] = {
      entity_id: entityId,
      platform: 'plant_care',
      device_id: deviceId,
      translation_key: key,
    };
    const now = TODAY.toISOString();
    states[entityId] = {
      entity_id: entityId,
      state,
      attributes,
      last_changed: now,
      last_updated: now,
    };
  };

  for (const [key, p] of Object.entries(PLANTS)) {
    const deviceId = `device_${key}`;
    devices[deviceId] = {
      id: deviceId,
      name: p.name,
      name_by_user: null,
      area_id: p.area,
      model: p.species,
    };
    const schedule = (care: Care | null, next: string, status: string) => {
      add(deviceId, `sensor.${key}_${next}`, next, care ? at(care.days) : 'unknown', {
        device_class: 'timestamp',
        ...(care && { interval_days: care.interval }),
      });
      add(deviceId, `sensor.${key}_${status}`, status, care ? statusFor(care.days) : 'unknown', {
        device_class: 'enum',
      });
    };
    schedule(p.water, 'next_watering', 'watering_status');
    schedule(p.feed, 'next_feeding', 'feeding_status');
    add(deviceId, `button.${key}_water`, 'water', 'unknown');
    add(deviceId, `button.${key}_feed`, 'feed', 'unknown');
  }

  return {
    states,
    entities,
    devices,
    areas,
    config: { time_zone: 'Europe/London' },
    locale: { language: 'en' },
    language: 'en',
    callService: async (domain, service, data) => {
      console.info('callService', domain, service, data);
    },
  };
}
