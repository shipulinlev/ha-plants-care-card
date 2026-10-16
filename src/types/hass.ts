// The slice of the frontend `hass` object these cards read.
// Mirrors home-assistant/frontend types; only the fields we use.

export interface HassEntityState {
  entity_id: string;
  state: string;
  attributes: Record<string, unknown>;
  last_changed: string;
  last_updated: string;
}

export interface HassEntityRegistryEntry {
  entity_id: string;
  platform: string;
  device_id?: string | null;
  area_id?: string | null;
  translation_key?: string | null;
  hidden?: boolean;
}

export interface HassDevice {
  id: string;
  name: string | null;
  name_by_user: string | null;
  area_id: string | null;
  model: string | null;
}

export interface HassArea {
  area_id: string;
  name: string;
  floor_id?: string | null;
  picture?: string | null;
}

export interface HomeAssistant {
  states: Record<string, HassEntityState>;
  entities: Record<string, HassEntityRegistryEntry>;
  devices: Record<string, HassDevice>;
  areas: Record<string, HassArea>;
  config: { time_zone: string };
  locale: { language: string; time_zone?: 'local' | 'server' };
  language: string;
  themes?: { darkMode?: boolean };
  callService(domain: string, service: string, data?: Record<string, unknown>): Promise<unknown>;
}

export interface LovelaceCardConfig {
  type: string;
  [key: string]: unknown;
}

export interface LovelaceGridOptions {
  columns?: number | 'full';
  rows?: number | 'auto';
  min_columns?: number;
  min_rows?: number;
}
