import type {
  HassArea,
  HassDevice,
  HassEntityRegistryEntry,
  HassEntityState,
  HomeAssistant,
} from '../src/types/hass';

// The five prototype plants from docs/design/Plant Card.dc.html, today = 2026-10-13.
// Species (device.model) and interval_days use the shape planned for plant_care (Phase 6).
export const TODAY = new Date(2026, 9, 13, 12, 0, 0);

type Care = { days: number; interval: number };
type MockPlant = { name: string; species: string; area: string; water: Care; feed: Care };

const PLANTS: Record<string, MockPlant> = {
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
    add(deviceId, `sensor.${key}_next_watering`, 'next_watering', at(p.water.days), {
      device_class: 'timestamp',
      interval_days: p.water.interval,
    });
    add(deviceId, `sensor.${key}_next_feeding`, 'next_feeding', at(p.feed.days), {
      device_class: 'timestamp',
      interval_days: p.feed.interval,
    });
    add(deviceId, `sensor.${key}_watering_status`, 'watering_status', statusFor(p.water.days), {
      device_class: 'enum',
    });
    add(deviceId, `sensor.${key}_feeding_status`, 'feeding_status', statusFor(p.feed.days), {
      device_class: 'enum',
    });
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
