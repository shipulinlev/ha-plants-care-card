import type { Localize } from '../localize/localize';
import type { CareKind, CareStatus, Plant } from '../data/model';
import type { ActionConfig } from '../types/hass';

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

// A care chip: press the plant's water/feed button. Logging before it is due asks first.
export function careActions(
  plant: Plant,
  kind: CareKind,
  status: CareStatus | null,
  t: Localize,
): CardActions | null {
  const button = plant[kind].buttonEntityId;
  if (!button) return null;
  const early = status !== 'due' && status !== 'overdue';
  const confirm = t(kind === 'water' ? 'confirm_water' : 'confirm_feed', { name: plant.name });
  return {
    entity: button,
    tap_action: {
      action: 'perform-action',
      perform_action: 'button.press',
      target: { entity_id: button },
      ...(early ? { confirmation: { text: confirm } } : {}),
    },
    hold_action: NONE,
  };
}

// The care chip a click or key press landed on, across shadow roots.
export function careKindAt(e: Event): CareKind | null {
  const target = e.composedPath()[0];
  const button = target instanceof Element ? target.closest<HTMLElement>('[data-care]') : null;
  const kind = button?.dataset.care;
  return kind === 'water' || kind === 'feed' ? kind : null;
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
// `origin` is the innermost element the gesture started on, across shadow roots, so one
// listener can serve several rows. Gestures on a <button> inside are left to that button.
// Returns a cleanup function.
export function bindGestures(
  el: HTMLElement,
  onAction: (kind: ActionKind, origin: Element | null) => void,
): () => void {
  let timer: ReturnType<typeof setTimeout> | undefined;
  let start: { x: number; y: number } | undefined;
  let held = false;
  let origin: Element | null = null;
  const originOf = (e: Event) => {
    const target = e.composedPath()[0];
    return target instanceof Element ? target : null;
  };

  const cancel = () => {
    clearTimeout(timer);
    timer = undefined;
    start = undefined;
  };
  const onButton = (e: Event) => !!originOf(e)?.closest('button');

  const down = (e: PointerEvent) => {
    if (e.button !== 0 || onButton(e)) return;
    held = false;
    origin = originOf(e);
    start = { x: e.clientX, y: e.clientY };
    timer = setTimeout(() => {
      held = true;
      timer = undefined;
      onAction('hold', origin);
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
    if (wasPressed && !held) onAction('tap', origin);
  };
  const key = (e: KeyboardEvent) => {
    if ((e.key === 'Enter' || e.key === ' ') && !onButton(e)) {
      e.preventDefault();
      onAction('tap', originOf(e));
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
