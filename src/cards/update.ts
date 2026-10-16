import type { HomeAssistant } from '../types/hass';

// hass is replaced on every state change anywhere; cards compare only what they render.

export const statesChanged = (prev: HomeAssistant, hass: HomeAssistant, ids: string[]): boolean =>
  ids.some((id) => prev.states[id] !== hass.states[id]);

export const localeChanged = (prev: HomeAssistant, hass: HomeAssistant): boolean =>
  prev.locale !== hass.locale || prev.config.time_zone !== hass.config.time_zone;
