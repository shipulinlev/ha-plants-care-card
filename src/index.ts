import { PlantCareGroupCardEditor } from './cards/group/editor';
import { PlantCareGroupCard } from './cards/plant-care-group-card';
import { PlantCareCard } from './cards/plant-care-card';
import { PlantCareCardEditor } from './cards/plant/editor';
import { suggestPlantCard } from './cards/suggest';
import type { HomeAssistant, LovelaceCardConfig } from './types/hass';

declare global {
  interface Window {
    customCards?: Array<{
      type: string;
      name: string;
      description: string;
      preview?: boolean;
      documentationURL?: string;
      getEntitySuggestion?: (
        hass: HomeAssistant,
        entityId: string,
      ) => { config: LovelaceCardConfig } | null;
    }>;
  }
}

const define = (tag: string, ctor: CustomElementConstructor) => {
  if (!customElements.get(tag)) customElements.define(tag, ctor);
};

define('plant-care-card', PlantCareCard);
define('plant-care-area-card', PlantCareGroupCard);
define('plant-care-card-editor', PlantCareCardEditor);
define('plant-care-area-card-editor', PlantCareGroupCardEditor);

const DOCS = 'https://github.com/shipulinlev/ha-plants-care-card#readme';

window.customCards = window.customCards ?? [];
window.customCards.push(
  {
    type: 'plant-care-card',
    name: 'Plant Care',
    description: 'One plant: next watering and feeding.',
    preview: true,
    documentationURL: DOCS,
    getEntitySuggestion: suggestPlantCard,
  },
  {
    type: 'plant-care-area-card',
    name: 'Plant Care Area',
    description: 'Every plant in an area, most urgent first.',
    preview: true,
    documentationURL: DOCS,
  },
);
