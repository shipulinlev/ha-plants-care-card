import { LitElement, css, html, nothing, type PropertyValues } from 'lit';
import { discoverPlants, plantEntityIds } from '../data/discover';
import { createLocalize } from '../localize/localize';
import { applyFontMode, corners, sharedStyles, type FontMode, type PhotoStyle } from '../styles';
import type {
  ActionConfig,
  HomeAssistant,
  LovelaceCardConfig,
  LovelaceGridOptions,
} from '../types/hass';
import { bindGestures, fireAction, plantActions } from './actions';
import { AREA_LAYOUTS, areaLayoutStyles, type AreaLayout } from './area/layouts';
import { buildAreaView, type AreaView } from './area/view';
import { localeChanged, statesChanged } from './update';

export interface PlantCareAreaCardConfig extends LovelaceCardConfig {
  area: string;
  layout?: AreaLayout;
  date_format?: 'relative' | 'absolute';
  photo_style?: PhotoStyle;
  font?: FontMode;
  title?: string;
  images?: Record<string, string>;
  tap_action?: ActionConfig;
  hold_action?: ActionConfig;
}

export const AREA_DEFAULTS = {
  layout: 'list',
  date_format: 'relative',
  photo_style: 'duotone',
  font: 'design',
} satisfies Partial<PlantCareAreaCardConfig>;

const TICK_MS = 60_000;

export class PlantCareAreaCard extends LitElement {
  static properties = {
    hass: { attribute: false },
    _config: { state: true },
    _tick: { state: true },
  };

  hass?: HomeAssistant;
  private _config?: PlantCareAreaCardConfig;
  private _tick = 0;
  private _view?: AreaView | null;
  private _timer?: ReturnType<typeof setInterval>;
  private _unbind?: () => void;

  static getConfigElement(): HTMLElement {
    return document.createElement('plant-care-area-card-editor');
  }

  // The card picker's preview: the area with the most plants, ties by name.
  static getStubConfig(hass?: HomeAssistant): Partial<PlantCareAreaCardConfig> {
    const counts = new Map<string, number>();
    for (const { areaId } of hass ? discoverPlants(hass) : []) {
      if (areaId && hass?.areas[areaId]) counts.set(areaId, (counts.get(areaId) ?? 0) + 1);
    }
    const name = (id: string) => hass?.areas[id]?.name ?? id;
    const [area] = [...counts].sort(([a, n], [b, m]) => m - n || name(a).localeCompare(name(b)));
    return area ? { area: area[0], layout: 'list' } : { area: '' };
  }

  setConfig(config: PlantCareAreaCardConfig): void {
    if (!config.area) throw new Error('area is required');
    if (config.layout && !(config.layout in AREA_LAYOUTS)) {
      throw new Error(`layout must be one of: ${Object.keys(AREA_LAYOUTS).join(', ')}`);
    }
    this._config = { ...AREA_DEFAULTS, ...config };
    this._view = undefined;
    applyFontMode(this, this._config.font ?? 'design');
  }

  getCardSize(): number {
    const n = this._view?.plants.length ?? 0;
    return this._config?.layout === 'grid' ? 2 + 3 * Math.ceil(n / 2) : 2 + n;
  }

  getGridOptions(): LovelaceGridOptions {
    return { columns: 12, min_columns: 6, rows: 'auto' };
  }

  connectedCallback(): void {
    super.connectedCallback();
    // Re-render now and then so "Today" / "Tomorrow" roll over at midnight without a state change.
    this._timer = setInterval(() => this._tick++, TICK_MS);
    // One listener for every plant row; the gesture's origin says which plant.
    this._unbind = bindGestures(this, (kind, origin) => {
      const deviceId = origin?.closest<HTMLElement>('[data-device]')?.dataset.device;
      const plant = this._view?.plants.find((p) => p.plant.deviceId === deviceId)?.plant;
      if (plant && this.hass) {
        const t = createLocalize(this.hass.locale.language);
        fireAction(this, plantActions(plant, t, this._config), kind);
      }
    });
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();
    clearInterval(this._timer);
    this._unbind?.();
  }

  // Only this area's plants, the registries (plants can move) and the locale matter.
  protected shouldUpdate(changed: PropertyValues<this>): boolean {
    if (!changed.has('hass') || changed.size > 1) return true;
    const prev = changed.get('hass') as HomeAssistant | undefined;
    const hass = this.hass;
    if (!prev || !hass || !this._config || !this._view) return true;
    const area = this._config.area;
    return (
      prev.entities !== hass.entities ||
      prev.devices !== hass.devices ||
      prev.areas[area] !== hass.areas[area] ||
      localeChanged(prev, hass) ||
      statesChanged(
        prev,
        hass,
        this._view.plants.flatMap((p) => plantEntityIds(p.plant)),
      )
    );
  }

  protected willUpdate(): void {
    if (this.hass && this._config) {
      void this._tick; // the minute tick rebuilds the view, so relative dates roll over
      this._view = buildAreaView(this.hass, this._config);
    }
  }

  render() {
    if (!this._config || !this.hass) return nothing;
    const view = this._view;
    if (!view) {
      const t = createLocalize(this.hass.locale.language);
      return html`<ha-card>
        ${corners()}
        <div class="warning-text">${t('area_not_found', { name: this._config.area })}</div>
      </ha-card>`;
    }
    return html`<ha-card>
      ${corners()} ${AREA_LAYOUTS[this._config.layout ?? 'list'](view)}
    </ha-card>`;
  }

  static styles = [
    sharedStyles,
    areaLayoutStyles,
    css`
      .warning-text {
        padding: 16px 18px;
        font-size: 13px;
        color: var(--error-color, var(--pc-text));
      }
    `,
  ];
}
