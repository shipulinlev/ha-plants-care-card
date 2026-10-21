// @vitest-environment happy-dom
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { createMockHass, TODAY } from '../../dev/mock-hass';
import { setClock } from '../data/clock';
import type { HomeAssistant } from '../types/hass';
import { HOLD_MS } from './actions';
import {
  PlantCareAreaCard,
  PlantCareGroupCard,
  type PlantCareGroupCardConfig,
} from './plant-care-group-card';

if (!customElements.get('plant-care-group-card')) {
  customElements.define('plant-care-group-card', PlantCareGroupCard);
  customElements.define('plant-care-area-card', PlantCareAreaCard);
}

beforeAll(() => setClock(() => TODAY));
afterAll(() => setClock(null));
afterEach(() => {
  document.body.replaceChildren();
  vi.useRealTimers();
});

async function mount(
  config: Partial<PlantCareGroupCardConfig>,
  hass = createMockHass(),
  tag = 'plant-care-group-card',
) {
  const card = document.createElement(tag) as PlantCareGroupCard;
  card.setConfig({ type: 'custom:plant-care-group-card', area: 'living_room', ...config });
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

  it('says so when none of the picked plants exist', async () => {
    const { text } = await mount({ area: undefined, plants: ['nope'] });
    expect(text('.empty')).toBe('No plants selected');
  });

  it('rejects neither an area nor plants, an unknown layout and an unknown sort', () => {
    const card = new PlantCareGroupCard();
    expect(() => card.setConfig({ type: 'x', area: '' })).toThrow('area or plants');
    expect(() => card.setConfig({ type: 'x', plants: [] })).toThrow('area or plants');
    expect(() => card.setConfig({ type: 'x', plants: 'device_ficus' as never })).toThrow('list');
    expect(() => card.setConfig({ type: 'x', area: 'a', layout: 'nope' as never })).toThrow(
      'layout',
    );
    expect(() => card.setConfig({ type: 'x', area: 'a', sort: 'nope' as never })).toThrow('sort');
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

  it('re-renders for a picked plant outside the area', async () => {
    const { card, all } = await mount({ plants: ['device_calathea'] });
    card.hass = withState(card.hass!, 'sensor.calathea_watering_status', 'overdue');
    await card.updateComplete;
    const calathea = all('.row.plant').find((r) => r.textContent!.includes('Calathea'))!;
    expect(calathea.querySelector('.tag')!.className).toBe('tag overdue chip');
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
    expect(PlantCareGroupCard.getStubConfig(hass)).toEqual({ area: 'living_room', layout: 'list' });
    expect(PlantCareGroupCard.getStubConfig({ ...hass, entities: {} })).toEqual({ area: '' });
  });

  it('previews the first plant when no plant has an area', () => {
    const hass = createMockHass();
    expect(PlantCareGroupCard.getStubConfig({ ...hass, areas: {} })).toMatchObject({
      plants: [expect.any(String)],
    });
  });

  it('opens its editor', () => {
    expect(PlantCareGroupCard.getConfigElement().tagName).toBe('PLANT-CARE-GROUP-CARD-EDITOR');
  });
});

describe('picked plants', () => {
  const names = (rows: Element[]) => rows.map((r) => r.querySelector('.row-name')!.textContent);

  it('shows only the picked plants, titled "Plants"', async () => {
    const { text, all } = await mount({
      area: undefined,
      plants: ['device_monstera', 'device_calathea'],
    });
    expect(text('.area-title .label')).toBe('Group');
    expect(text('.area-name')).toBe('Plants');
    expect(names(all('.row.plant'))).toEqual(['Calathea', 'Monstera']);
  });

  it('keeps the picked order with sort: manual', async () => {
    const { all } = await mount({
      area: 'bedroom',
      plants: ['device_snake', 'device_monstera'],
      sort: 'manual',
    });
    expect(names(all('.row.plant'))).toEqual(['Snake plant', 'Monstera', 'Calathea']);
  });
});

describe('former name', () => {
  it('still renders as plant-care-area-card', async () => {
    const { all } = await mount({}, createMockHass(), 'plant-care-area-card');
    expect(all('.row.plant')).toHaveLength(4);
  });
});
