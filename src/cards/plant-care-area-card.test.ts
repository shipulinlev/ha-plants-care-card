// @vitest-environment happy-dom
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { createMockHass, TODAY } from '../../dev/mock-hass';
import { setClock } from '../data/clock';
import type { HomeAssistant } from '../types/hass';
import { HOLD_MS } from './actions';
import { PlantCareAreaCard, type PlantCareAreaCardConfig } from './plant-care-area-card';

if (!customElements.get('plant-care-area-card')) {
  customElements.define('plant-care-area-card', PlantCareAreaCard);
}

beforeAll(() => setClock(() => TODAY));
afterAll(() => setClock(null));
afterEach(() => {
  document.body.replaceChildren();
  vi.useRealTimers();
});

async function mount(config: Partial<PlantCareAreaCardConfig>, hass = createMockHass()) {
  const card = document.createElement('plant-care-area-card') as PlantCareAreaCard;
  card.setConfig({ type: 'custom:plant-care-area-card', area: 'living_room', ...config });
  card.hass = hass;
  document.body.append(card);
  await card.updateComplete;
  const root = card.shadowRoot!;
  const clean = (el: Element | null | undefined) => el?.textContent?.replace(/\s+/g, ' ').trim();
  const text = (sel: string) => clean(root.querySelector(sel));
  const all = (sel: string) => [...root.querySelectorAll(sel)];
  return { card, root, text, all, clean };
}

const ORDER = ['Fiddle-leaf fig', 'Monstera', 'Pothos', 'Snake plant'];

describe('layout list (1e)', () => {
  it('renders the header and column headings', async () => {
    const { text, all, clean } = await mount({});
    expect(text('.area-name')).toBe('Living room');
    expect(text('.summary')).toBe('4 plants1 needs care today');
    expect(all('.row.columns span').map(clean)).toEqual(['', 'Plant', 'Water', 'Feed']);
  });

  it('lists plants most urgent first with status chips', async () => {
    const { all, clean } = await mount({});
    const rows = all('.row.plant');
    expect(rows.map((r) => clean(r.querySelector('.row-name')))).toEqual(ORDER);
    const chips = (i: number) =>
      [...rows[i].querySelectorAll('.tag')].map((t) => [t.className, clean(t)]);
    expect(chips(0)).toEqual([
      ['tag overdue chip', '3 d late'],
      ['tag overdue chip', '1 d late'],
    ]);
    expect(chips(1)).toEqual([
      ['tag soon chip', '2 d'],
      ['tag ok chip', '12 d'],
    ]);
    expect(clean(rows[0].querySelector('.species'))).toBe('Ficus lyrata');
  });
});

describe('show_name', () => {
  it('hides the area name and keeps the summary in both layouts', async () => {
    for (const layout of ['list', 'grid'] as const) {
      const { root, text } = await mount({ layout, show_name: false });
      expect(root.querySelector('.area-name')).toBeNull();
      expect(root.querySelector('.area-title')).toBeNull();
      expect(text('.summary')).toContain('1 needs care today');
      document.body.replaceChildren();
    }
  });
});

describe('layout grid (1f)', () => {
  it('renders cells with the water countdown and the feed footer', async () => {
    const { text, all, clean } = await mount({ layout: 'grid' });
    expect(text('.area-name')).toBe('Living room');
    expect(text('.summary')).toBe('1 needs care today');
    const cells = all('.cell');
    expect(cells.map((c) => clean(c.querySelector('.row-name')))).toEqual(ORDER);
    expect(clean(cells[0].querySelector('.number'))).toBe('3');
    expect(clean(cells[0].querySelector('.unit'))).toBe('days late');
    expect(clean(cells[0].querySelector('.cell-foot'))).toBe('Feed 1 day late Overdue');
    expect(clean(cells[0].querySelector('.cell-tag button.tag.overdue'))).toBe('Overdue');
    expect(cells[0].querySelector('.cell-foot button')!.getAttribute('data-care')).toBe('feed');
  });

  it('borders the right column and the lower rows', async () => {
    const { all } = await mount({ layout: 'grid' });
    const classes = all('.cell').map((c) =>
      ['right', 'lower'].filter((k) => c.classList.contains(k)),
    );
    expect(classes).toEqual([[], ['right'], ['lower'], ['right', 'lower']]);
  });
});

describe('states and config', () => {
  it('says so when the area has no plants', async () => {
    const { text, all } = await mount({ area: 'office' });
    expect(text('.empty')).toBe('No plants in this area');
    expect(all('.row.columns')).toHaveLength(0);
  });

  it('warns about a missing area', async () => {
    const { text } = await mount({ area: 'nope' });
    expect(text('.warning-text')).toBe('Area not found: nope');
  });

  it('rejects a missing area and an unknown layout', () => {
    const card = new PlantCareAreaCard();
    expect(() => card.setConfig({ type: 'x', area: '' })).toThrow('area');
    expect(() => card.setConfig({ type: 'x', area: 'a', layout: 'nope' as never })).toThrow(
      'layout',
    );
  });

  it('sizes the card by plant count', async () => {
    expect((await mount({})).card.getCardSize()).toBe(6);
    expect((await mount({ layout: 'grid' })).card.getCardSize()).toBe(8);
  });
});

describe('actions', () => {
  const press = (el: Element, type: string) =>
    el.dispatchEvent(new PointerEvent(type, { bubbles: true, composed: true, button: 0 }));

  it('taps a row to open that plant', async () => {
    const { card, all } = await mount({});
    const listener = vi.fn();
    card.addEventListener('hass-action', listener);
    const row = all('.row.plant')[1];
    press(row.querySelector('.row-name')!, 'pointerdown');
    press(row, 'pointerup');
    expect(listener.mock.calls[0][0].detail).toMatchObject({
      action: 'tap',
      config: { tap_action: { action: 'more-info', entity: 'sensor.monstera_next_watering' } },
    });
  });

  it('holds a cell to water that plant', async () => {
    const { card, all } = await mount({ layout: 'grid' });
    vi.useFakeTimers();
    const listener = vi.fn();
    card.addEventListener('hass-action', listener);
    const cell = all('.cell')[3];
    press(cell, 'pointerdown');
    vi.advanceTimersByTime(HOLD_MS);
    press(cell, 'pointerup');
    expect(listener).toHaveBeenCalledTimes(1);
    expect(listener.mock.calls[0][0].detail).toMatchObject({
      action: 'hold',
      config: { hold_action: { target: { entity_id: 'button.snake_water' } } },
    });
  });

  it('presses a chip to log that care for its plant only', async () => {
    const { card, all } = await mount({});
    const listener = vi.fn();
    card.addEventListener('hass-action', listener);
    const chip = all('.row.plant')[0].querySelector<HTMLButtonElement>('button[data-care=feed]')!;
    press(chip, 'pointerdown');
    press(chip, 'pointerup');
    chip.click();
    expect(listener).toHaveBeenCalledTimes(1);
    expect(listener.mock.calls[0][0].detail.config.tap_action).toEqual({
      action: 'perform-action',
      perform_action: 'button.press',
      target: { entity_id: 'button.ficus_feed' },
    });
  });

  it('asks before logging care early', async () => {
    const { card, all } = await mount({ layout: 'grid' });
    const listener = vi.fn();
    card.addEventListener('hass-action', listener);
    all('.cell')[3].querySelector<HTMLButtonElement>('button[data-care=water]')!.click();
    expect(listener.mock.calls[0][0].detail.config.tap_action).toMatchObject({
      target: { entity_id: 'button.snake_water' },
      confirmation: { text: 'Log a watering for Snake plant?' },
    });
  });
});

describe('updates', () => {
  const withState = (hass: HomeAssistant, entityId: string, state: string): HomeAssistant => ({
    ...hass,
    states: { ...hass.states, [entityId]: { ...hass.states[entityId], state } },
  });

  it('skips other areas and re-renders for its own plants', async () => {
    const { card, all } = await mount({});
    let renders = 0;
    const original = card.render.bind(card);
    card.render = () => {
      renders++;
      return original();
    };

    card.hass = withState(card.hass!, 'sensor.calathea_watering_status', 'overdue');
    await card.updateComplete;
    expect(renders).toBe(0);

    card.hass = withState(card.hass!, 'sensor.pothos_watering_status', 'due');
    await card.updateComplete;
    expect(renders).toBe(1);
    expect(all('.row.plant')[2].querySelector('.tag')!.className).toBe('tag due chip');
  });

  it('adds a plant moved into the area', async () => {
    const { card, all } = await mount({});
    const hass = card.hass!;
    card.hass = {
      ...hass,
      devices: {
        ...hass.devices,
        device_calathea: { ...hass.devices.device_calathea, area_id: 'living_room' },
      },
    };
    await card.updateComplete;
    expect(all('.row.plant')).toHaveLength(5);
  });
});

describe('card picker', () => {
  it('previews the area with the most plants', () => {
    const hass = createMockHass();
    expect(PlantCareAreaCard.getStubConfig(hass)).toEqual({ area: 'living_room', layout: 'list' });
    expect(PlantCareAreaCard.getStubConfig({ ...hass, entities: {} })).toEqual({ area: '' });
  });

  it('opens its editor', () => {
    expect(PlantCareAreaCard.getConfigElement().tagName).toBe('PLANT-CARE-AREA-CARD-EDITOR');
  });
});
