import { css, html } from 'lit';

// The blueprint frame: square, hairline border, "+" registration marks at the corners.
// Ported from .blueprint / .corner in docs/design/_ds/industry-*/styles.css.
export const frame = css`
  ha-card {
    display: block;
    position: relative;
    overflow: visible;
    box-sizing: border-box;
    border: 1px solid var(--pc-divider);
    border-radius: 0;
    box-shadow: none;
    background: var(--plant-care-card-background, transparent);
    color: var(--pc-text);
    font-family: var(--pc-font-body);
  }
  .corner {
    position: absolute;
    width: 11px;
    height: 11px;
    color: color-mix(in srgb, var(--pc-text) 55%, transparent);
    pointer-events: none;
  }
  .corner::before,
  .corner::after {
    content: '';
    position: absolute;
    background: currentColor;
  }
  .corner::before {
    left: 5px;
    top: 0;
    width: 1px;
    height: 100%;
  }
  .corner::after {
    top: 5px;
    left: 0;
    width: 100%;
    height: 1px;
  }
  .corner.tl {
    top: -6px;
    left: -6px;
  }
  .corner.tr {
    top: -6px;
    right: -6px;
  }
  .corner.bl {
    bottom: -6px;
    left: -6px;
  }
  .corner.br {
    bottom: -6px;
    right: -6px;
  }

  .heading {
    margin: 0;
    font-family: var(--pc-font-heading);
    font-weight: 600;
    line-height: 1;
    text-transform: uppercase;
  }
  .kicker {
    font: 500 12px/1.3 var(--pc-font-body);
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: var(--pc-muted);
  }
  .label {
    font: 500 12px/1 var(--pc-font-body);
    letter-spacing: 0.1em;
    text-transform: uppercase;
  }
  .muted {
    color: var(--pc-muted);
  }
`;

export const corners = () =>
  html`<i class="corner tl" aria-hidden="true"></i><i class="corner tr" aria-hidden="true"></i
    ><i class="corner bl" aria-hidden="true"></i><i class="corner br" aria-hidden="true"></i>`;
