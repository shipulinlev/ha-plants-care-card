// @vitest-environment happy-dom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createMockHass } from '../../dev/mock-hass';
import { plantByDevice } from '../data/discover';
import { createLocalize } from '../localize/localize';
import { bindGestures, fireAction, HOLD_MS, plantActions, type ActionKind } from './actions';

const t = createLocalize('en');
const monstera = plantByDevice(createMockHass(), 'device_monstera')!;

describe('plantActions', () => {
  it('defaults to more-info on tap and a confirmed watering on hold', () => {
    expect(plantActions(monstera, t)).toEqual({
      entity: 'sensor.monstera_next_watering',
      tap_action: { action: 'more-info', entity: 'sensor.monstera_next_watering' },
      hold_action: {
        action: 'perform-action',
        perform_action: 'button.press',
        target: { entity_id: 'button.monstera_water' },
        confirmation: { text: 'Log a watering for Monstera?' },
      },
    });
  });

  it('uses configured actions', () => {
    const actions = plantActions(monstera, t, {
      tap_action: { action: 'navigate', navigation_path: '/plants' },
      hold_action: { action: 'none' },
    });
    expect(actions.tap_action).toEqual({ action: 'navigate', navigation_path: '/plants' });
    expect(actions.hold_action).toEqual({ action: 'none' });
  });

  it('has no hold without a water button', () => {
    const plant = { ...monstera, water: { ...monstera.water, buttonEntityId: undefined } };
    expect(plantActions(plant, t).hold_action).toEqual({ action: 'none' });
  });
});

describe('fireAction', () => {
  it('dispatches hass-action that crosses shadow roots', () => {
    const el = document.createElement('div');
    const listener = vi.fn();
    document.body.append(el);
    document.addEventListener('hass-action', listener);
    const actions = plantActions(monstera, t);
    fireAction(el, actions, 'tap');
    const event = listener.mock.calls[0][0] as CustomEvent;
    expect(event.bubbles && event.composed).toBe(true);
    expect(event.detail).toEqual({ config: actions, action: 'tap' });
    document.removeEventListener('hass-action', listener);
    el.remove();
  });

  it('fires nothing for action none', () => {
    const el = document.createElement('div');
    const listener = vi.fn();
    el.addEventListener('hass-action', listener);
    fireAction(el, plantActions(monstera, t, { hold_action: { action: 'none' } }), 'hold');
    expect(listener).not.toHaveBeenCalled();
  });
});

describe('bindGestures', () => {
  let el: HTMLElement;
  let onAction: ReturnType<typeof vi.fn<(kind: ActionKind, origin: Element | null) => void>>;
  let unbind: () => void;
  const pointer = (type: string, x = 0, y = 0) =>
    el.dispatchEvent(new PointerEvent(type, { button: 0, clientX: x, clientY: y }));

  beforeEach(() => {
    vi.useFakeTimers();
    el = document.createElement('div');
    onAction = vi.fn<(kind: ActionKind, origin: Element | null) => void>();
    unbind = bindGestures(el, onAction);
  });
  afterEach(() => {
    unbind();
    vi.useRealTimers();
  });

  it('treats a quick press as a tap', () => {
    pointer('pointerdown');
    pointer('pointerup');
    expect(onAction.mock.calls.map(([kind]) => kind)).toEqual(['tap']);
  });

  it('treats a long press as a hold, without a tap after it', () => {
    pointer('pointerdown');
    vi.advanceTimersByTime(HOLD_MS);
    pointer('pointerup');
    expect(onAction.mock.calls.map(([kind]) => kind)).toEqual(['hold']);
  });

  it('ignores a drag', () => {
    pointer('pointerdown', 0, 0);
    pointer('pointermove', 30, 0);
    vi.advanceTimersByTime(HOLD_MS);
    pointer('pointerup', 30, 0);
    expect(onAction).not.toHaveBeenCalled();
  });

  it('taps with Enter and Space', () => {
    el.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
    el.dispatchEvent(new KeyboardEvent('keydown', { key: ' ' }));
    el.dispatchEvent(new KeyboardEvent('keydown', { key: 'a' }));
    expect(onAction.mock.calls.map(([kind]) => kind)).toEqual(['tap', 'tap']);
  });

  it('passes the element the gesture started on', () => {
    const row = document.createElement('span');
    el.append(row);
    row.dispatchEvent(new PointerEvent('pointerdown', { button: 0, bubbles: true }));
    el.dispatchEvent(new PointerEvent('pointerup', { button: 0 }));
    expect(onAction.mock.calls).toEqual([['tap', row]]);
  });
});
