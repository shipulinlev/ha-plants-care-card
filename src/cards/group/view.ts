import { careView, groupSummary, sortByUrgency, type CareView } from '../../data/care';
import { now } from '../../data/clock';
import { plantsInGroup } from '../../data/discover';
import type { Plant } from '../../data/model';
import { resolveTimeZone } from '../../data/time';
import { createLocalize, type Localize } from '../../localize/localize';
import type { PhotoStyle } from '../../styles';
import type { HomeAssistant } from '../../types/hass';

export const GROUP_SORTS = ['urgency', 'manual'] as const;
export type GroupSort = (typeof GROUP_SORTS)[number];

export interface GroupViewConfig {
  area?: string;
  plants?: string[]; // device IDs
  sort?: GroupSort;
  date_format?: 'relative' | 'absolute';
  title?: string;
  show_name?: boolean;
  images?: Record<string, string>;
  photo_style?: PhotoStyle;
}

export interface GroupPlantView {
  plant: Plant;
  name: string;
  species: string | null;
  photo: { src: string | null; style: PhotoStyle };
  water: CareView;
  feed: CareView;
}

// Everything a group layout renders. Layouts are pure templates over this.
export interface GroupView {
  label: string; // above the title: "Area", or "Group" without one
  title: string | null; // null when the name is hidden
  countText: string;
  attentionText: string;
  emptyText: string;
  plants: GroupPlantView[]; // most urgent first, or in the picked order
  t: Localize;
}

// Manual order: the picked plants as listed, then the area's other plants by name.
function manualOrder(plants: Plant[], picked: string[], language: string): Plant[] {
  const first = plants.filter((p) => picked.includes(p.deviceId));
  const rest = plants
    .filter((p) => !picked.includes(p.deviceId))
    .sort((a, b) => a.name.localeCompare(b.name, language));
  return [...first, ...rest];
}

// null when the configured area does not exist.
export function buildGroupView(
  hass: Pick<HomeAssistant, 'states' | 'entities' | 'devices' | 'areas' | 'config' | 'locale'>,
  config: GroupViewConfig,
): GroupView | null {
  const area = config.area ? hass.areas[config.area] : undefined;
  if (config.area && !area) return null;
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
  const group = plantsInGroup(hass, config);
  const plants =
    config.sort === 'manual'
      ? manualOrder(group, config.plants ?? [], language)
      : sortByUrgency(group, ctx);
  const { countText, attentionText } = groupSummary(plants, t, ctx.now);
  return {
    label: area ? t('area') : t('group'),
    title: config.show_name === false ? null : config.title || area?.name || t('plants'),
    countText,
    attentionText,
    emptyText: area ? t('no_plants') : t('no_plants_selected'),
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
