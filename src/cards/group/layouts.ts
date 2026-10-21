import { css, html, nothing } from 'lit';
import { careButton, careIcon, plantPhoto } from '../../styles';
import type { GroupPlantView, GroupView } from './view';

// Layouts 1e/1f from docs/design/Plant Card.dc.html (pixel specs in docs/design/README.md).
// Each plant carries data-device so the card's single gesture listener can find it;
// its care chips carry data-care.

const empty = (v: GroupView) =>
  v.plants.length ? nothing : html`<div class="empty muted">${v.t('no_plants')}</div>`;

const row = (p: GroupPlantView) => html`
  <div
    class="row plant"
    data-device=${p.plant.deviceId}
    role="button"
    tabindex="0"
    aria-label=${p.name}
  >
    <div class="thumb">${plantPhoto({ ...p.photo, size: 'sm' })}</div>
    <div class="who">
      <span class="heading row-name">${p.name}</span>
      ${p.species ? html`<span class="species">${p.species}</span>` : nothing}
    </div>
    ${careButton(p.water, p.water.short, true)} ${careButton(p.feed, p.feed.short, true)}
  </div>
`;

// 1e: list, most urgent first.
export const list = (v: GroupView) => html`
  <div class="area-head">
    ${
      v.title === null
        ? nothing
        : html`<div class="area-title">
            <div class="label muted">${v.t('area')}</div>
            <h2 class="heading area-name">${v.title}</h2>
          </div>`
    }
    <div class="summary">${v.countText}<br />${v.attentionText}</div>
  </div>
  ${
    v.plants.length
      ? html`<div class="row columns">
            <span></span><span>${v.t('plant')}</span><span>${v.t('care.water')}</span
            ><span>${v.t('care.feed')}</span>
          </div>
          ${v.plants.map(row)}`
      : empty(v)
  }
`;

const cell = (p: GroupPlantView, i: number) => html`
  <div
    class="cell plant ${i % 2 ? 'right' : ''} ${i > 1 ? 'lower' : ''}"
    data-device=${p.plant.deviceId}
    role="button"
    tabindex="0"
    aria-label=${p.name}
  >
    <div class="cell-photo">${plantPhoto({ ...p.photo, size: 'sm' })}</div>
    <div class="heading row-name">${p.name}</div>
    <div class="cell-big">
      <span class="cell-icon" title=${p.water.label}>${careIcon('water', 15)}</span>
      <span class="number">${p.water.big}</span>
      ${p.water.unit ? html`<span class="unit">${p.water.unit}</span>` : nothing}
      <span class="cell-tag">${careButton(p.water)}</span>
    </div>
    <div class="cell-foot">
      <span class="cell-feed">${careIcon('feed', 15)}${p.feed.label} ${p.feed.textLower}</span>
      ${careButton(p.feed)}
    </div>
  </div>
`;

// 1f: two-column grid of plant cells.
export const grid = (v: GroupView) => html`
  <div class="area-head bordered">
    ${v.title === null ? nothing : html`<h2 class="heading area-name">${v.title}</h2>`}
    <div class="summary">${v.attentionText}</div>
  </div>
  ${v.plants.length ? html`<div class="cells">${v.plants.map(cell)}</div>` : empty(v)}
`;

export const GROUP_LAYOUTS = { list, grid };
export type GroupLayout = keyof typeof GROUP_LAYOUTS;

export const groupLayoutStyles = css`
  h2 {
    margin: 0;
  }
  .area-head {
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    gap: 12px;
    padding: 16px 18px 14px;
  }
  .area-head.bordered {
    border-bottom: 1px solid var(--pc-divider);
  }
  .area-title {
    display: flex;
    flex-direction: column;
    gap: 4px;
    min-width: 0;
  }
  .area-name {
    font-size: 30px;
  }
  .summary {
    margin-left: auto;
    font-size: 12px;
    line-height: 1.4;
    text-align: right;
    color: var(--pc-muted);
  }
  .empty {
    padding: 0 18px 16px;
    font-size: 13px;
  }
  .plant {
    cursor: pointer;
    user-select: none;
    -webkit-tap-highlight-color: transparent;
  }
  .plant:focus-visible {
    outline: 2px solid var(--pc-accent);
    outline-offset: -2px;
  }
  .row-name {
    font-size: 18px;
  }

  /* 1e */
  .row {
    display: grid;
    grid-template-columns: 44px minmax(0, 1fr) 74px 74px;
    column-gap: 12px;
    align-items: center;
  }
  .row.columns {
    padding: 0 18px 6px;
    font: 500 10px/1 var(--pc-font-body);
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: var(--pc-muted);
  }
  .row.plant {
    padding: 10px 18px;
    border-top: 1px solid var(--pc-divider);
  }
  .thumb .photo {
    width: 44px;
    height: 44px;
    border: 1px solid var(--pc-divider);
  }
  .thumb .photo.hatch.sm {
    padding: 0;
  }
  .who {
    display: flex;
    flex-direction: column;
    gap: 2px;
    min-width: 0;
  }
  .species {
    font-size: 11px;
    line-height: 1.2;
    color: var(--pc-muted);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  /* 1f */
  .cells {
    display: grid;
    grid-template-columns: 1fr 1fr;
  }
  .cell {
    display: flex;
    flex-direction: column;
    gap: 10px;
    min-width: 0;
    padding: 14px 16px 16px;
  }
  .cell.right {
    border-left: 1px solid var(--pc-divider);
  }
  .cell.lower {
    border-top: 1px solid var(--pc-divider);
  }
  .cell-photo .photo {
    height: 84px;
    border: 1px solid var(--pc-divider);
  }
  .cell-big {
    display: flex;
    align-items: baseline;
    gap: 5px;
  }
  .cell-big .number {
    font: 600 36px/0.85 var(--pc-font-heading);
    text-transform: uppercase;
  }
  .cell-big .unit {
    font: 500 12px/1 var(--pc-font-heading);
    letter-spacing: 0.04em;
    text-transform: uppercase;
    color: var(--pc-muted);
  }
  .cell-tag {
    margin-left: auto;
  }
  .cell-icon {
    align-self: center;
    display: flex;
    color: var(--pc-muted);
  }
  .cell-foot {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    font-size: 12px;
    color: var(--pc-muted);
  }
  .cell-feed {
    display: flex;
    align-items: center;
    gap: 5px;
    min-width: 0;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
`;
