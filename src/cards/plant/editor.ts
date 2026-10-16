import type { Localize } from '../../localize/localize';
import type { HaFormSchema } from '../../types/hass';
import { actionFields, PlantCareEditor, section, select } from '../editor';
import { PLANT_DEFAULTS, type PlantCareCardConfig } from '../plant-care-card';
import { LAYOUTS } from './layouts';

export class PlantCareCardEditor extends PlantCareEditor<PlantCareCardConfig> {
  protected defaults = PLANT_DEFAULTS;

  protected schema(t: Localize): HaFormSchema[] {
    return [
      {
        name: 'device_id',
        required: true,
        selector: { device: { filter: { integration: 'plant_care' } } },
      },
      {
        type: 'grid',
        name: '',
        schema: [
          select(t, 'layout', Object.keys(LAYOUTS)),
          select(t, 'date_format', ['relative', 'absolute']),
        ],
      },
      section(t, 'appearance', 'mdi:palette', [
        select(t, 'photo_style', ['duotone', 'natural']),
        select(t, 'font', ['design', 'theme']),
        { name: 'show_interval', selector: { boolean: {} } },
        { name: 'image', selector: { text: {} } },
      ]),
      section(t, 'interactions', 'mdi:gesture-tap', actionFields()),
    ];
  }
}
