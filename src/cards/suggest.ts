import { plantByDevice } from '../data/discover';
import type { HomeAssistant, LovelaceCardConfig } from '../types/hass';

// Offered in "Add to dashboard" for any plant_care entity that belongs to a plant.
export function suggestPlantCard(
  hass: HomeAssistant,
  entityId: string,
): { config: LovelaceCardConfig } | null {
  const entry = hass.entities[entityId];
  if (entry?.platform !== 'plant_care' || !entry.device_id) return null;
  const plant = plantByDevice(hass, entry.device_id);
  return plant ? { config: { type: 'custom:plant-care-card', device_id: plant.deviceId } } : null;
}
