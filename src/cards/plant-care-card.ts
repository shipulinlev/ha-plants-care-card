import { LitElement, css, html, nothing } from 'lit';
import { applyFontMode, corners, sharedStyles, type FontMode, type PhotoStyle } from '../styles';
import type { HomeAssistant, LovelaceCardConfig, LovelaceGridOptions } from '../types/hass';

export interface PlantCareCardConfig extends LovelaceCardConfig {
  device_id: string;
  layout?: 'header' | 'side' | 'countdown';
  date_format?: 'relative' | 'absolute';
  photo_style?: PhotoStyle;
  font?: FontMode;
  show_interval?: boolean;
  image?: string;
}

// Placeholder: layouts 1a/1b/1c land in Phase 3.
export class PlantCareCard extends LitElement {
  static properties = {
    hass: { attribute: false },
    _config: { state: true },
  };

  hass?: HomeAssistant;
  private _config?: PlantCareCardConfig;

  static getStubConfig(): Partial<PlantCareCardConfig> {
    return { device_id: '', layout: 'header' };
  }

  setConfig(config: PlantCareCardConfig): void {
    if (!config.device_id) throw new Error('device_id is required');
    this._config = {
      layout: 'header',
      date_format: 'relative',
      photo_style: 'duotone',
      font: 'design',
      show_interval: true,
      ...config,
    };
    applyFontMode(this, this._config.font ?? 'design');
  }

  getCardSize(): number {
    return 6;
  }

  getGridOptions(): LovelaceGridOptions {
    return { columns: 12, min_columns: 6, rows: 'auto' };
  }

  render() {
    if (!this._config || !this.hass) return nothing;
    const device = this.hass.devices[this._config.device_id];
    return html`<ha-card>
      ${corners()}
      <div class="body heading">
        ${device?.name_by_user ?? device?.name ?? this._config.device_id}
      </div>
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
