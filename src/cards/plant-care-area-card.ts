import { LitElement, css, html, nothing } from 'lit';
import { applyFontMode, corners, sharedStyles, type FontMode, type PhotoStyle } from '../styles';
import type { HomeAssistant, LovelaceCardConfig, LovelaceGridOptions } from '../types/hass';

export interface PlantCareAreaCardConfig extends LovelaceCardConfig {
  area: string;
  layout?: 'list' | 'grid';
  date_format?: 'relative' | 'absolute';
  photo_style?: PhotoStyle;
  font?: FontMode;
  title?: string;
  images?: Record<string, string>;
}

// Placeholder: layouts 1e/1f land in Phase 4.
export class PlantCareAreaCard extends LitElement {
  static properties = {
    hass: { attribute: false },
    _config: { state: true },
  };

  hass?: HomeAssistant;
  private _config?: PlantCareAreaCardConfig;

  static getStubConfig(): Partial<PlantCareAreaCardConfig> {
    return { area: '', layout: 'list' };
  }

  setConfig(config: PlantCareAreaCardConfig): void {
    if (!config.area) throw new Error('area is required');
    this._config = {
      layout: 'list',
      date_format: 'relative',
      photo_style: 'duotone',
      font: 'design',
      ...config,
    };
    applyFontMode(this, this._config.font ?? 'design');
  }

  getCardSize(): number {
    return 5;
  }

  getGridOptions(): LovelaceGridOptions {
    return { columns: 12, min_columns: 6, rows: 'auto' };
  }

  render() {
    if (!this._config || !this.hass) return nothing;
    const area = this.hass.areas[this._config.area];
    return html`<ha-card>
      ${corners()}
      <div class="body heading">${this._config.title ?? area?.name ?? this._config.area}</div>
    </ha-card>`;
  }

  static styles = [
    sharedStyles,
    css`
      .body {
        padding: 16px 18px;
        font-size: 30px;
      }
    `,
  ];
}
