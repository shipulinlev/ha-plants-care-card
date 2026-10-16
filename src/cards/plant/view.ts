import { careView, nextAndThen, ruler, type CareView, type RulerCell } from '../../data/care';
import { now } from '../../data/clock';
import type { Plant } from '../../data/model';
import { resolveTimeZone } from '../../data/time';
import { createLocalize, type Localize } from '../../localize/localize';
import type { PhotoStyle } from '../../styles';
import type { HomeAssistant } from '../../types/hass';

export interface PlantViewConfig {
  date_format?: 'relative' | 'absolute';
  show_interval?: boolean;
  image?: string;
  photo_style?: PhotoStyle;
}

// Everything a plant layout renders. Layouts are pure templates over this.
export interface PlantView {
  name: string;
  kicker: string; // "{area} · {species}", whichever are known; may be empty
  photo: { src: string | null; style: PhotoStyle };
  water: CareView;
  feed: CareView;
  next: CareView;
  then: CareView;
  ruler: RulerCell[];
  t: Localize;
}

export function buildPlantView(
  hass: Pick<HomeAssistant, 'areas' | 'config' | 'locale'>,
  config: PlantViewConfig,
  plant: Plant,
): PlantView {
  const language = hass.locale.language;
  const t = createLocalize(language);
  const ctx = {
    now: now(),
    timeZone: resolveTimeZone(hass),
    language,
    t,
    dateFormat: config.date_format ?? 'relative',
    showInterval: config.show_interval ?? true,
  };
  const area = plant.areaId ? hass.areas[plant.areaId]?.name : undefined;
  const [next, then] = nextAndThen(plant, ctx);
  return {
    name: plant.name,
    kicker: [area, plant.species].filter(Boolean).join(' · '),
    photo: { src: config.image || plant.image, style: config.photo_style ?? 'duotone' },
    water: careView(plant.water, ctx),
    feed: careView(plant.feed, ctx),
    next,
    then,
    ruler: ruler(plant, ctx),
    t,
  };
}
