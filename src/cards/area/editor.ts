import type { Localize, TranslationKey } from '../../localize/localize';
import type { HaFormSchema } from '../../types/hass';
import { actionFields, PlantCareEditor, section, select } from '../editor';
import { AREA_DEFAULTS, type PlantCareAreaCardConfig } from '../plant-care-area-card';
import { AREA_LAYOUTS } from './layouts';

// `images` (per-plant photos) stays YAML-only; the editor keeps it untouched.
export class PlantCareAreaCardEditor extends PlantCareEditor<PlantCareAreaCardConfig> {
  protected defaults = AREA_DEFAULTS;
  protected helpers: Record<string, TranslationKey> = { photo_style: 'editor.images_helper' };

  protected schema(t: Localize): HaFormSchema[] {
    return [
      {
        name: 'area',
        required: true,
        selector: { area: { device: { integration: 'plant_care' } } },
      },
      { name: 'title', selector: { text: {} } },
      { name: 'show_name', selector: { boolean: {} } },
      {
        type: 'grid',
        name: '',
        schema: [
          select(t, 'layout', Object.keys(AREA_LAYOUTS)),
          select(t, 'date_format', ['relative', 'absolute']),
        ],
      },
      section(t, 'appearance', 'mdi:palette', [
        select(t, 'photo_style', ['duotone', 'natural']),
        select(t, 'font', ['design', 'theme']),
      ]),
      section(t, 'interactions', 'mdi:gesture-tap', actionFields()),
    ];
  }
}
