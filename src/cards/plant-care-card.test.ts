// @vitest-environment happy-dom
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { createMockHass, TODAY } from '../../dev/mock-hass';
import { setClock } from '../data/clock';
import type { HomeAssistant } from '../types/hass';
import { PlantCareCard, type PlantCareCardConfig } from './plant-care-card';
import { suggestPlantCard } from './suggest';

if (!customElements.get('plant-care-card')) customElements.define('plant-care-card', PlantCareCard);

beforeAll(() => setClock(() => TODAY));
afterAll(() => setClock(null));
afterEach(() => {
  document.body.innerHTML = '';
});

async function mount(config: Partial<PlantCareCardConfig>, hass = createMockHass()) {
  const card = document.createElement('plant-care-card') as PlantCareCard;
  card.setConfig({ type: 'custom:plant-care-card', device_id: 'device_monstera', ...config });
  card.hass = hass;
  document.body.append(card);
  await card.updateComplete;
  const root = card.shadowRoot!;
  const text = (sel: string) => root.querySelector(sel)?.textContent?.replace(/\s+/g, ' ').trim();
  const all = (sel: string) => [...root.querySelectorAll(sel)];
  return { card, root, text, all };
}

describe('layout header (1a)', () => {
  it('renders name, kicker and both cares', async () => {
    const { text, all } = await mount({});
    expect(text('.name-lg')).toBe('Monstera');
    expect(text('.kicker')).toBe('Living room · Monstera deliciosa');
    const cells = all('.header-care');
    expect(cells.map((c) => c.querySelector('.tag')!.className)).toEqual(['tag soon', 'tag ok']);
    expect(cells.map((c) => c.querySelector('.number')!.textContent)).toEqual(['2', '12']);
    expect(cells[0].querySelector('.sub')!.textContent).toBe('Thu 15 Oct · every 7 days');
    expect(all('.corner')).toHaveLength(4);
  });

  it('shows a hatch placeholder without a photo', async () => {
    const { root } = await mount({});
    expect(root.querySelector('.header-photo .photo.hatch')).not.toBeNull();
  });
});

describe('layout side (1b)', () => {
  it('sizes the progress fill from the interval', async () => {
    const { all } = await mount({ layout: 'side' });
    const fills = all('.fill') as HTMLElement[];
    expect(fills.map((f) => f.style.width)).toEqual(['71%', '60%']); // (7-2)/7, (30-12)/30
  });

  it('uses the ink fill when overdue', async () => {
    const { all } = await mount({ layout: 'side', device_id: 'device_ficus' });
    expect(all('.fill').every((f) => f.classList.contains('overdue'))).toBe(true);
  });

  it('hides the track without an interval', async () => {
    const hass = createMockHass();
    delete hass.states['sensor.monstera_next_watering'].attributes.interval_days;
    const { all } = await mount({ layout: 'side' }, hass);
    expect(all('.side-care.water .track')).toHaveLength(0);
    expect(all('.side-care.feed .track')).toHaveLength(1);
  });
});

describe('layout countdown (1c)', () => {
  it('leads with the next care and marks the ruler', async () => {
    const { text, all } = await mount({ layout: 'countdown' });
    expect(text('.hero-label')).toBe('Next · WaterSoon');
    expect(text('.hero-label .tag.soon')).toBe('Soon');
    expect(text('.hero-big .number')).toBe('2');
    expect(text('.then .muted')).toBe('Then Feed');
    expect(text('.then-text')).toBe('in 12 days');
    expect(text('.then .tag.ok')).toBe('OK');
    const days = all('.day');
    expect(days).toHaveLength(15);
    expect(days.findIndex((d) => d.querySelector('.mark.water'))).toBe(2);
    expect(days.findIndex((d) => d.querySelector('.mark.feed'))).toBe(12);
    expect(days[0].classList.contains('today')).toBe(true);
  });

  it('pins overdue care to today', async () => {
    const { all } = await mount({ layout: 'countdown', device_id: 'device_ficus' });
    const today = all('.day')[0];
    expect(today.querySelector('.mark.water')).not.toBeNull();
    expect(today.querySelector('.mark.feed')).not.toBeNull();
  });
});

describe('errors and config', () => {
  it('reports a missing plant', async () => {
    const { text } = await mount({ device_id: 'nope' });
    expect(text('.warning-text')).toBe('Plant not found: nope');
  });

  it('rejects a missing device_id and an unknown layout', () => {
    const card = new PlantCareCard();
    expect(() => card.setConfig({ type: 'x', device_id: '' })).toThrow('device_id');
    expect(() => card.setConfig({ type: 'x', device_id: 'd', layout: 'nope' as never })).toThrow(
      'layout',
    );
  });

  it('reports a size per layout', () => {
    const card = new PlantCareCard();
    card.setConfig({ type: 'x', device_id: 'd', layout: 'side' });
    expect(card.getCardSize()).toBe(4);
  });

  it('is focusable when it has actions', async () => {
    const { root } = await mount({});
    const haCard = root.querySelector('ha-card')!;
    expect(haCard.getAttribute('role')).toBe('button');
    expect(haCard.getAttribute('tabindex')).toBe('0');
  });

  it('is not interactive when both actions are none', async () => {
    const { root } = await mount({
      tap_action: { action: 'none' },
      hold_action: { action: 'none' },
    });
    expect(root.querySelector('ha-card')!.hasAttribute('role')).toBe(false);
  });
});

describe('updates', () => {
  const withState = (hass: HomeAssistant, entityId: string, state: string): HomeAssistant => ({
    ...hass,
    states: { ...hass.states, [entityId]: { ...hass.states[entityId], state } },
  });

  it('skips unrelated entity changes and re-renders on its own', async () => {
    const { card, text, all } = await mount({});
    let renders = 0;
    const original = card.render.bind(card);
    card.render = () => {
      renders++;
      return original();
    };

    card.hass = withState(card.hass!, 'sensor.pothos_watering_status', 'due');
    await card.updateComplete;
    expect(renders).toBe(0);

    card.hass = withState(card.hass!, 'sensor.monstera_watering_status', 'due');
    await card.updateComplete;
    expect(renders).toBe(1);
    expect(all('.header-care')[0].querySelector('.tag')!.className).toBe('tag due');
    expect(text('.name-lg')).toBe('Monstera');
  });

  it('re-renders on a device rename', async () => {
    const { card, text } = await mount({});
    const hass = card.hass!;
    card.hass = {
      ...hass,
      devices: {
        ...hass.devices,
        device_monstera: { ...hass.devices.device_monstera, name_by_user: 'Big Monty' },
      },
    };
    await card.updateComplete;
    expect(text('.name-lg')).toBe('Big Monty');
  });
});

describe('card picker', () => {
  const empty = { ...createMockHass(), entities: {} };

  it('previews the first plant by name', () => {
    expect(PlantCareCard.getStubConfig(createMockHass())).toEqual({
      device_id: 'device_fern',
      layout: 'header',
    });
    expect(PlantCareCard.getStubConfig(empty)).toEqual({ device_id: '' });
  });

  it('opens its editor', () => {
    expect(PlantCareCard.getConfigElement().tagName).toBe('PLANT-CARE-CARD-EDITOR');
  });

  it('suggests itself for plant entities only', () => {
    const hass = createMockHass();
    expect(suggestPlantCard(hass, 'sensor.monstera_next_watering')).toEqual({
      config: { type: 'custom:plant-care-card', device_id: 'device_monstera' },
    });
    expect(suggestPlantCard(hass, 'light.kitchen')).toBeNull();
  });
});
