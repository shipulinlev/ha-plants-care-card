import { LitElement, css, html, nothing, type PropertyValues } from 'lit';
import { discoverPlants, plantByDevice, plantEntityIds } from '../data/discover';
import type { Plant } from '../data/model';
import { createLocalize } from '../localize/localize';
import { applyFontMode, corners, sharedStyles, type FontMode, type PhotoStyle } from '../styles';
import type {
  ActionConfig,
  HomeAssistant,
  LovelaceCardConfig,
  LovelaceGridOptions,
} from '../types/hass';
import { bindGestures, fireAction, hasAction, plantActions } from './actions';
import { localeChanged, statesChanged } from './update';
import { LAYOUTS, layoutStyles, type PlantLayout } from './plant/layouts';
import { buildPlantView } from './plant/view';

export interface PlantCareCardConfig extends LovelaceCardConfig {
  device_id: string;
  layout?: PlantLayout;
  date_format?: 'relative' | 'absolute';
  photo_style?: PhotoStyle;
  font?: FontMode;
  show_interval?: boolean;
  image?: string;
  tap_action?: ActionConfig;
  hold_action?: ActionConfig;
}

export const PLANT_DEFAULTS = {
  layout: 'header',
  date_format: 'relative',
  photo_style: 'duotone',
  font: 'design',
  show_interval: true,
} satisfies Partial<PlantCareCardConfig>;

const CARD_SIZE: Record<PlantLayout, number> = { header: 7, side: 4, countdown: 7 };
const TICK_MS = 60_000;

export class PlantCareCard extends LitElement {
  static properties = {
    hass: { attribute: false },
    _config: { state: true },
    _tick: { state: true },
  };

  hass?: HomeAssistant;
  private _config?: PlantCareCardConfig;
  private _tick = 0;
  private _plant?: Plant;
  private _timer?: ReturnType<typeof setInterval>;
  private _unbind?: () => void;

  static getConfigElement(): HTMLElement {
    return document.createElement('plant-care-card-editor');
  }

  // The card picker's preview: the first plant by name.
  static getStubConfig(hass?: HomeAssistant): Partial<PlantCareCardConfig> {
    const [first] = hass ? discoverPlants(hass).sort((a, b) => a.name.localeCompare(b.name)) : [];
    return first ? { device_id: first.deviceId, layout: 'header' } : { device_id: '' };
  }

  setConfig(config: PlantCareCardConfig): void {
    if (!config.device_id) throw new Error('device_id is required');
    if (config.layout && !(config.layout in LAYOUTS)) {
      throw new Error(`layout must be one of: ${Object.keys(LAYOUTS).join(', ')}`);
    }
    this._config = { ...PLANT_DEFAULTS, ...config };
    this._plant = undefined;
    applyFontMode(this, this._config.font ?? 'design');
  }

  getCardSize(): number {
    return CARD_SIZE[this._config?.layout ?? 'header'];
  }

  getGridOptions(): LovelaceGridOptions {
    return { columns: 12, min_columns: 6, rows: 'auto' };
  }

  connectedCallback(): void {
    super.connectedCallback();
    // Re-render now and then so "Today" / "Tomorrow" roll over at midnight without a state change.
    this._timer = setInterval(() => this._tick++, TICK_MS);
    this._unbind = bindGestures(this, (kind) => {
      if (this._plant && this.hass && this._config) {
        fireAction(this, this._actions(this._plant), kind);
      }
    });
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();
    clearInterval(this._timer);
    this._unbind?.();
  }

  // Only this plant's entities, device, area and the locale matter; hass changes on every state.
  protected shouldUpdate(changed: PropertyValues<this>): boolean {
    if (!changed.has('hass') || changed.size > 1) return true;
    const prev = changed.get('hass') as HomeAssistant | undefined;
    const hass = this.hass;
    if (!prev || !hass) return true;
    if (!this._plant) return prev.entities !== hass.entities || prev.devices !== hass.devices;
    const plant = this._plant;
    return (
      statesChanged(prev, hass, plantEntityIds(plant)) ||
      prev.devices[plant.deviceId] !== hass.devices[plant.deviceId] ||
      (!!plant.areaId && prev.areas[plant.areaId] !== hass.areas[plant.areaId]) ||
      localeChanged(prev, hass)
    );
  }

  protected willUpdate(): void {
    if (this.hass && this._config) {
      this._plant = plantByDevice(this.hass, this._config.device_id);
    }
  }

  private _actions(plant: Plant) {
    const t = createLocalize(this.hass!.locale.language);
    return plantActions(plant, t, this._config);
  }

  render() {
    if (!this._config || !this.hass) return nothing;
    const plant = this._plant;
    if (!plant) {
      const t = createLocalize(this.hass.locale.language);
      return html`<ha-card class="warning">
        ${corners()}
        <div class="warning-text">${t('plant_not_found', { name: this._config.device_id })}</div>
      </ha-card>`;
    }
    void this._tick; // read so the minute tick re-renders
    const view = buildPlantView(this.hass, this._config, plant);
    const actions = this._actions(plant);
    const interactive = hasAction(actions.tap_action) || hasAction(actions.hold_action);
    return html`<ha-card
      class=${interactive ? 'interactive' : ''}
      role=${interactive ? 'button' : nothing}
      tabindex=${interactive ? '0' : nothing}
      aria-label=${plant.name}
    >
      ${corners()} ${LAYOUTS[this._config.layout ?? 'header'](view)}
    </ha-card>`;
  }

  static styles = [
    sharedStyles,
    layoutStyles,
    css`
      ha-card.interactive {
        cursor: pointer;
        user-select: none;
        -webkit-tap-highlight-color: transparent;
      }
      ha-card.interactive:focus-visible {
        outline: 2px solid var(--pc-accent);
        outline-offset: 2px;
      }
      .warning-text {
        padding: 16px 18px;
        font-size: 13px;
        color: var(--error-color, var(--pc-text));
      }
    `,
  ];
}
