import { areaSummary, careView, sortByUrgency, type CareView } from '../../data/care';
import { now } from '../../data/clock';
import { plantsInArea } from '../../data/discover';
import type { Plant } from '../../data/model';
import { resolveTimeZone } from '../../data/time';
import { createLocalize, type Localize } from '../../localize/localize';
import type { PhotoStyle } from '../../styles';
import type { HomeAssistant } from '../../types/hass';

export interface AreaViewConfig {
  area: string;
  date_format?: 'relative' | 'absolute';
  title?: string;
  images?: Record<string, string>;
  photo_style?: PhotoStyle;
}

export interface AreaPlantView {
  plant: Plant;
  name: string;
  species: string | null;
  photo: { src: string | null; style: PhotoStyle };
  water: CareView;
  feed: CareView;
}

// Everything an area layout renders. Layouts are pure templates over this.
export interface AreaView {
  title: string;
  countText: string;
  attentionText: string;
  plants: AreaPlantView[]; // most urgent first
  t: Localize;
}

// null when the area does not exist.
export function buildAreaView(
  hass: Pick<HomeAssistant, 'states' | 'entities' | 'devices' | 'areas' | 'config' | 'locale'>,
  config: AreaViewConfig,
): AreaView | null {
  const area = hass.areas[config.area];
  if (!area) return null;
  const language = hass.locale.language;
  const t = createLocalize(language);
  const ctx = {
    now: now(),
    timeZone: resolveTimeZone(hass),
    language,
    t,
    dateFormat: config.date_format ?? 'relative',
    showInterval: false,
  };
  const plants = sortByUrgency(plantsInArea(hass, config.area), ctx);
  const { countText, attentionText } = areaSummary(plants, t);
  return {
    title: config.title || area.name,
    countText,
    attentionText,
    plants: plants.map((plant) => ({
      plant,
      name: plant.name,
      species: plant.species,
      photo: {
        src: config.images?.[plant.deviceId] || plant.image,
        style: config.photo_style ?? 'duotone',
      },
      water: careView(plant.water, ctx),
      feed: careView(plant.feed, ctx),
    })),
    t,
  };
}
