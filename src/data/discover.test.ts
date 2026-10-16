import { describe, expect, it } from 'vitest';
import { createMockHass } from '../../dev/mock-hass';
import type { HassEntityRegistryEntry, HomeAssistant } from '../types/hass';
import { discoverPlants, plantByDevice, plantsInArea } from './discover';

// A one-plant hass; `edit` tweaks it before discovery.
function singlePlant(edit: (hass: HomeAssistant) => void = () => {}): HomeAssistant {
  const hass = createMockHass();
  for (const [id, entry] of Object.entries(hass.entities)) {
    if (entry.device_id !== 'device_monstera') delete hass.entities[id];
  }
  edit(hass);
  return hass;
}

const setState = (hass: HomeAssistant, entityId: string, state: string) => {
  hass.states[entityId] = { ...hass.states[entityId], state };
};

describe('discoverPlants', () => {
  it('finds every plant of the mock', () => {
    const plants = discoverPlants(createMockHass());
    expect(plants.map((p) => p.name).sort()).toEqual([
      'Boston fern',
      'Calathea',
      'Fiddle-leaf fig',
      'Monstera',
      'Pothos',
      'Snake plant',
    ]);
  });

  it('maps device and entity fields', () => {
    const [plant] = discoverPlants(singlePlant());
    expect(plant).toMatchObject({
      deviceId: 'device_monstera',
      name: 'Monstera',
      areaId: 'living_room',
      species: 'Monstera deliciosa',
      image: null,
      water: {
        kind: 'water',
        status: 'soon',
        intervalDays: 7,
        nextEntityId: 'sensor.monstera_next_watering',
        statusEntityId: 'sensor.monstera_watering_status',
        buttonEntityId: 'button.monstera_water',
      },
      feed: {
        kind: 'feed',
        status: 'ok',
        intervalDays: 30,
        buttonEntityId: 'button.monstera_feed',
      },
    });
    expect(plant.water.nextAt).toBeInstanceOf(Date);
  });

  it('prefers the user-given device name', () => {
    const hass = singlePlant((h) => {
      h.devices.device_monstera.name_by_user = 'Big Monty';
    });
    expect(discoverPlants(hass)[0].name).toBe('Big Monty');
  });

  it('falls back to the entity_id suffix without a translation_key', () => {
    const hass = singlePlant((h) => {
      for (const entry of Object.values(h.entities)) entry.translation_key = null;
    });
    const [plant] = discoverPlants(hass);
    expect(plant.water.nextEntityId).toBe('sensor.monstera_next_watering');
    expect(plant.water.statusEntityId).toBe('sensor.monstera_watering_status');
    expect(plant.water.buttonEntityId).toBe('button.monstera_water');
    expect(plant.feed.buttonEntityId).toBe('button.monstera_feed');
  });

  it('keeps a plant with a missing role', () => {
    const hass = singlePlant((h) => {
      delete h.entities['sensor.monstera_next_feeding'];
      delete h.entities['sensor.monstera_feeding_status'];
    });
    const [plant] = discoverPlants(hass);
    expect(plant.feed).toMatchObject({ nextAt: null, status: null, intervalDays: null });
    expect(plant.water.status).toBe('soon');
  });

  it('skips a device with no schedule sensors', () => {
    const hass = singlePlant((h) => {
      delete h.entities['sensor.monstera_next_watering'];
      delete h.entities['sensor.monstera_next_feeding'];
    });
    expect(discoverPlants(hass)).toEqual([]);
  });

  it('turns unknown, unavailable and invalid states into null', () => {
    const hass = singlePlant((h) => {
      setState(h, 'sensor.monstera_next_watering', 'unavailable');
      setState(h, 'sensor.monstera_watering_status', 'unknown');
      setState(h, 'sensor.monstera_next_feeding', 'not a date');
      setState(h, 'sensor.monstera_feeding_status', 'weird');
    });
    const [plant] = discoverPlants(hass);
    expect(plant.water).toMatchObject({ nextAt: null, status: null });
    expect(plant.feed).toMatchObject({ nextAt: null, status: null });
  });

  it('reads the photo from entity_picture', () => {
    const hass = singlePlant((h) => {
      h.states['sensor.monstera_next_watering'].attributes.entity_picture = '/local/m.jpg';
    });
    expect(discoverPlants(hass)[0].image).toBe('/local/m.jpg');
  });

  it('ignores other integrations on the same device', () => {
    const hass = singlePlant((h) => {
      const other: HassEntityRegistryEntry = {
        entity_id: 'sensor.monstera_next_watering_2',
        platform: 'other',
        device_id: 'device_monstera',
        translation_key: 'next_watering',
      };
      h.entities[other.entity_id] = other;
    });
    expect(discoverPlants(hass)[0].water.nextEntityId).toBe('sensor.monstera_next_watering');
  });
});

describe('plantByDevice / plantsInArea', () => {
  const hass = createMockHass();

  it('finds by device', () => {
    expect(plantByDevice(hass, 'device_ficus')?.name).toBe('Fiddle-leaf fig');
    expect(plantByDevice(hass, 'nope')).toBeUndefined();
  });

  it('filters by area', () => {
    expect(plantsInArea(hass, 'bedroom').map((p) => p.name)).toEqual(['Calathea']);
    expect(plantsInArea(hass, 'living_room')).toHaveLength(4);
    expect(plantsInArea(hass, 'nope')).toEqual([]);
  });
});
