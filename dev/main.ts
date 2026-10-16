import '../src/index';
import './styleguide';
import { createMockHass } from './mock-hass';
import type { LovelaceCardConfig } from '../src/types/hass';

type Card = HTMLElement & { hass: unknown; setConfig(c: LovelaceCardConfig): void };

const plant = (device: string, layout = 'header') => ({
  type: 'plant-care-card',
  device_id: `device_${device}`,
  layout,
});

// The shared styles, then every layout from docs/design, each rendered on a light and a dark surface.
const SAMPLES: Array<{ id: string; label: string; config: LovelaceCardConfig }> = [
  { id: '0', label: 'Styles', config: { type: 'plant-care-styleguide' } },
  {
    id: '0-theme',
    label: 'Styles: theme font',
    config: { type: 'plant-care-styleguide', font: 'theme' },
  },
  { id: '1a', label: 'Photo header', config: plant('monstera') },
  { id: '1b', label: 'Side photo + progress', config: plant('monstera', 'side') },
  { id: '1c', label: 'Countdown + ruler', config: plant('monstera', 'countdown') },
  { id: '1d-ok', label: 'State: ok', config: plant('pothos') },
  { id: '1d-soon', label: 'State: soon', config: plant('monstera') },
  { id: '1d-due', label: 'State: due', config: plant('calathea') },
  { id: '1d-overdue', label: 'State: overdue', config: plant('ficus') },
  {
    id: '1e',
    label: 'Area list',
    config: { type: 'plant-care-area-card', area: 'living_room', layout: 'list' },
  },
  {
    id: '1f',
    label: 'Area grid',
    config: { type: 'plant-care-area-card', area: 'living_room', layout: 'grid' },
  },
];

const hass = createMockHass();
const root = document.getElementById('samples')!;

for (const sample of SAMPLES) {
  const section = document.createElement('section');
  section.id = sample.id;
  const heading = document.createElement('h2');
  const code = document.createElement('code');
  code.textContent = sample.id;
  heading.append(code, ` ${sample.label}`);
  const themes = document.createElement('div');
  themes.className = 'themes';
  for (const theme of ['light', 'dark']) {
    const surface = document.createElement('div');
    surface.className = `surface ${theme}`;
    const card = document.createElement(sample.config.type) as Card;
    card.setConfig(sample.config);
    card.hass = hass;
    surface.append(card);
    themes.append(surface);
  }
  section.append(heading, themes);
  root.append(section);
}
