import type { Localize, TranslationKey } from '../../localize/localize';
import type { HaFormSchema } from '../../types/hass';
import { actionFields, PlantCareEditor, section, select } from '../editor';
import { GROUP_DEFAULTS, type PlantCareGroupCardConfig } from '../plant-care-group-card';
import { GROUP_LAYOUTS } from './layouts';
import { GROUP_SORTS } from './view';

// `images` (per-plant photos) stays YAML-only; the editor keeps it untouched.
export class PlantCareGroupCardEditor extends PlantCareEditor<PlantCareGroupCardConfig> {
  protected defaults = GROUP_DEFAULTS;
  protected helpers: Record<string, TranslationKey> = { photo_style: 'editor.images_helper' };

  protected schema(t: Localize): HaFormSchema[] {
    return [
      { name: 'area', selector: { area: { device: { integration: 'plant_care' } } } },
      {
        name: 'plants',
        selector: { device: { multiple: true, filter: { integration: 'plant_care' } } },
      },
      { name: 'title', selector: { text: {} } },
      { name: 'show_name', selector: { boolean: {} } },
      {
        type: 'grid',
        name: '',
        schema: [select(t, 'layout', Object.keys(GROUP_LAYOUTS)), select(t, 'sort', GROUP_SORTS)],
      },
      select(t, 'date_format', ['relative', 'absolute']),
      section(t, 'appearance', 'mdi:palette', [
        select(t, 'photo_style', ['duotone', 'natural']),
        select(t, 'font', ['design', 'theme']),
      ]),
      section(t, 'interactions', 'mdi:gesture-tap', actionFields()),
    ];
  }
}
