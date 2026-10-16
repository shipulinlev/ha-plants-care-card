import { PlantCareAreaCardEditor } from './cards/area/editor';
import { PlantCareAreaCard } from './cards/plant-care-area-card';
import { PlantCareCard } from './cards/plant-care-card';
import { PlantCareCardEditor } from './cards/plant/editor';

declare global {
  interface Window {
    customCards?: Array<{ type: string; name: string; description: string; preview?: boolean }>;
  }
}

const define = (tag: string, ctor: CustomElementConstructor) => {
  if (!customElements.get(tag)) customElements.define(tag, ctor);
};

define('plant-care-card', PlantCareCard);
define('plant-care-area-card', PlantCareAreaCard);
define('plant-care-card-editor', PlantCareCardEditor);
define('plant-care-area-card-editor', PlantCareAreaCardEditor);

window.customCards = window.customCards ?? [];
window.customCards.push(
  {
    type: 'plant-care-card',
    name: 'Plant Care',
    description: 'One plant: next watering and feeding.',
    preview: true,
  },
  {
    type: 'plant-care-area-card',
    name: 'Plant Care Area',
    description: 'Every plant in an area, most urgent first.',
    preview: true,
  },
);
