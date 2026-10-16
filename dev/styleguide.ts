import { LitElement, css, html } from 'lit';
import {
  applyFontMode,
  careIcon,
  corners,
  plantPhoto,
  sharedStyles,
  statusTag,
  type FontMode,
} from '../src/styles';

// A leafy test image, inline so the harness needs no network.
const PHOTO = `data:image/svg+xml,${encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 100">
    <rect width="160" height="100" fill="#d9c9a3"/>
    <ellipse cx="60" cy="55" rx="38" ry="22" fill="#3f7d3a" transform="rotate(-25 60 55)"/>
    <ellipse cx="105" cy="45" rx="34" ry="18" fill="#6aa84f" transform="rotate(20 105 45)"/>
    <rect x="76" y="60" width="6" height="40" fill="#5b4632"/>
  </svg>`,
)}`;

// Dev only: every shared piece from src/styles in one framed card.
export class PlantCareStyleguide extends LitElement {
  hass?: unknown; // set by the harness like on the cards; unused

  setConfig(config: { font?: FontMode }): void {
    applyFontMode(this, config.font ?? 'design');
  }

  render() {
    const states = [
      { status: 'ok', statusLabel: 'OK' },
      { status: 'soon', statusLabel: 'Soon' },
      { status: 'due', statusLabel: 'Due' },
      { status: 'overdue', statusLabel: 'Overdue' },
      { status: null, statusLabel: 'Not set' },
    ] as const;
    return html`<ha-card>
      ${corners()}
      <div class="body">
        <div>
          <div class="kicker">Living room · Monstera deliciosa</div>
          <h1 class="heading name">Monstera</h1>
        </div>
        <div class="row">${states.map((s) => statusTag(s))}</div>
        <div class="row chips">
          ${statusTag(states[1], '2 d', true)} ${statusTag(states[2], 'Today', true)}
          ${statusTag(states[3], '3 d late', true)}
        </div>
        <div class="row">
          <span class="label icon-label">${careIcon('water')} Water</span>
          <span class="label icon-label">${careIcon('feed')} Feed</span>
          <span class="label icon-label">${careIcon('water', 15)}${careIcon('feed', 15)}</span>
        </div>
        <div class="big">
          <span class="heading number">12</span><span class="unit muted">days</span>
        </div>
        <div class="photos">
          ${plantPhoto({ src: null, style: 'duotone', label: 'Plant photo' })}
          ${plantPhoto({ src: null, style: 'duotone', size: 'sm' })}
          ${plantPhoto({ src: PHOTO, style: 'duotone' })}
          ${plantPhoto({ src: PHOTO, style: 'natural' })}
        </div>
        <div class="muted small">Thu 15 Oct · every 7 days</div>
      </div>
    </ha-card>`;
  }

  static styles = [
    sharedStyles,
    css`
      .body {
        display: flex;
        flex-direction: column;
        gap: 14px;
        padding: 16px 18px;
      }
      .name {
        font-size: 30px;
      }
      .row {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
        align-items: center;
      }
      .chips .tag {
        width: 74px;
      }
      .icon-label {
        display: inline-flex;
        align-items: center;
        gap: 6px;
      }
      .big {
        display: flex;
        align-items: baseline;
        gap: 6px;
      }
      .number {
        font-size: 52px;
        line-height: 0.85;
      }
      .unit {
        font: 500 15px/1 var(--pc-font-body);
        text-transform: uppercase;
      }
      .photos {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 8px;
      }
      .photos .photo {
        height: 84px;
        border: 1px solid var(--pc-divider);
      }
      .small {
        font-size: 12px;
      }
    `,
  ];
}

customElements.define('plant-care-styleguide', PlantCareStyleguide);
