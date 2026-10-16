import type { Localize } from '../../localize/localize';
import type { Plant } from '../../data/model';
import type { ActionConfig } from '../../types/hass';

export type ActionKind = 'tap' | 'hold';

export interface CardActions {
  entity?: string;
  tap_action: ActionConfig;
  hold_action: ActionConfig;
}

const NONE: ActionConfig = { action: 'none' };

// Tap opens more-info for the plant; hold logs a watering after a confirmation.
export function plantActions(
  plant: Plant,
  t: Localize,
  overrides: { tap_action?: ActionConfig; hold_action?: ActionConfig } = {},
): CardActions {
  const entity = plant.water.nextEntityId ?? plant.feed.nextEntityId;
  const button = plant.water.buttonEntityId;
  return {
    entity,
    tap_action: overrides.tap_action ?? (entity ? { action: 'more-info', entity } : NONE),
    hold_action:
      overrides.hold_action ??
      (button
        ? {
            action: 'perform-action',
            perform_action: 'button.press',
            target: { entity_id: button },
            confirmation: { text: t('confirm_water', { name: plant.name }) },
          }
        : NONE),
  };
}

export const hasAction = (config: ActionConfig | undefined) => !!config && config.action !== 'none';

// HA's frontend handles the hass-action event: more-info, perform-action, confirmation, …
export function fireAction(el: HTMLElement, actions: CardActions, action: ActionKind): void {
  if (!hasAction(action === 'tap' ? actions.tap_action : actions.hold_action)) return;
  el.dispatchEvent(
    new CustomEvent('hass-action', {
      bubbles: true,
      composed: true,
      detail: { config: actions, action },
    }),
  );
}

export const HOLD_MS = 500;
const MOVE_TOLERANCE = 10;

// Tap / hold gesture on one element. A hold suppresses the tap that would follow it.
// Returns a cleanup function.
export function bindGestures(el: HTMLElement, onAction: (kind: ActionKind) => void): () => void {
  let timer: ReturnType<typeof setTimeout> | undefined;
  let start: { x: number; y: number } | undefined;
  let held = false;

  const cancel = () => {
    clearTimeout(timer);
    timer = undefined;
    start = undefined;
  };
  const down = (e: PointerEvent) => {
    if (e.button !== 0) return;
    held = false;
    start = { x: e.clientX, y: e.clientY };
    timer = setTimeout(() => {
      held = true;
      timer = undefined;
      onAction('hold');
    }, HOLD_MS);
  };
  const move = (e: PointerEvent) => {
    if (start && Math.hypot(e.clientX - start.x, e.clientY - start.y) > MOVE_TOLERANCE) {
      cancel();
      held = true; // a drag is neither a tap nor a hold
    }
  };
  const up = () => {
    const wasPressed = start !== undefined;
    cancel();
    if (wasPressed && !held) onAction('tap');
  };
  const key = (e: KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onAction('tap');
    }
  };
  const contextmenu = (e: Event) => {
    if (held || timer) e.preventDefault(); // long-press on touch would open the menu
  };

  el.addEventListener('pointerdown', down);
  el.addEventListener('pointermove', move);
  el.addEventListener('pointerup', up);
  el.addEventListener('pointercancel', cancel);
  el.addEventListener('pointerleave', cancel);
  el.addEventListener('keydown', key);
  el.addEventListener('contextmenu', contextmenu);
  return () => {
    cancel();
    el.removeEventListener('pointerdown', down);
    el.removeEventListener('pointermove', move);
    el.removeEventListener('pointerup', up);
    el.removeEventListener('pointercancel', cancel);
    el.removeEventListener('pointerleave', cancel);
    el.removeEventListener('keydown', key);
    el.removeEventListener('contextmenu', contextmenu);
  };
}
