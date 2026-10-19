import { css, html, nothing } from 'lit';
import { styleMap } from 'lit/directives/style-map.js';
import type { CareView } from '../../data/care';
import { careButton, careIcon, plantPhoto, statusTag } from '../../styles';
import type { PlantView } from './view';

// Layouts 1a/1b/1c from docs/design/Plant Card.dc.html (pixel specs in docs/design/README.md).

const careLabel = (c: CareView, iconSize = 16) =>
  html`<span class="label care-label">${careIcon(c.kind, iconSize)}${c.label}</span>`;

const bigNumber = (c: CareView) =>
  html`<div class="big">
    <span class="number">${c.big}</span>${
      c.unit ? html`<span class="unit">${c.unit}</span>` : nothing
    }
  </div>`;

const kicker = (v: PlantView, cls: string) =>
  v.kicker ? html`<div class=${cls}>${v.kicker}</div>` : nothing;

// 1a: photo header, two equal countdown cells.
export const header = (v: PlantView) => html`
  <div class="header">
    <div class="header-photo">${plantPhoto({ ...v.photo, label: v.t('plant_photo') })}</div>
    <div class="header-title">
      ${kicker(v, 'kicker')}
      <h2 class="heading name-lg">${v.name}</h2>
    </div>
    <div class="header-cares">
      ${[v.water, v.feed].map(
        (c) =>
          html`<div class="header-care ${c.kind}">
            <div class="care-row">${careLabel(c)}${careButton(c)}</div>
            ${bigNumber(c)} ${c.sub ? html`<div class="sub">${c.sub}</div>` : nothing}
          </div>`,
      )}
    </div>
  </div>
`;

// 1b: side photo, interval progress bars.
export const side = (v: PlantView) => html`
  <div class="side">
    <div class="side-photo">${plantPhoto({ ...v.photo, size: 'sm', label: v.t('photo') })}</div>
    <div class="side-body">
      <div class="title">
        <h2 class="heading name-md">${v.name}</h2>
        ${kicker(v, 'meta')}
      </div>
      ${[v.water, v.feed].map(
        (c) =>
          html`<div class="side-care ${c.kind}">
            <div class="care-row">
              ${careLabel(c, 15)}${careButton(c)}
              <span class="heading side-text">${c.text}</span>
            </div>
            ${
              c.progress === null
                ? nothing
                : html`<div class="track">
                    <div
                      class="fill ${c.status === 'overdue' ? 'overdue' : ''}"
                      style=${styleMap({ width: `${Math.round(c.progress * 100)}%` })}
                    ></div>
                  </div>`
            }
            ${c.sub ? html`<div class="sub small">${c.sub}</div>` : nothing}
          </div>`,
      )}
    </div>
  </div>
`;

// 1c: the next care as a hero number, then a 14-day ruler.
export const countdown = (v: PlantView) => html`
  <div class="countdown">
    <div class="countdown-head">
      <div class="title">
        <h2 class="heading name-md">${v.name}</h2>
        ${kicker(v, 'meta')}
      </div>
      <div class="countdown-photo">
        ${plantPhoto({ ...v.photo, size: 'sm', label: v.t('photo') })}
      </div>
    </div>
    <div class="hero">
      <div class="label hero-label">${v.t('next')} · ${v.next.label}${statusTag(v.next)}</div>
      <div class="big hero-big">
        <span class="number">${v.next.big}</span>${
          v.next.unit ? html`<span class="unit">${v.next.unit}</span>` : nothing
        }
      </div>
      <div class="then">
        <span class="muted">${v.t('then', { label: v.then.label })}</span>
        <span class="then-text">${v.then.textLower}</span>${statusTag(v.then)}
      </div>
    </div>
    <div class="ruler-block">
      <div class="ruler">
        ${v.ruler.map(
          (d) =>
            html`<div class="day ${d.isToday ? 'today' : ''}">
              <span class="day-num">${d.day}</span>
              <div class="marks">
                ${d.feed ? html`<span class="mark feed"></span>` : nothing}
                ${d.water ? html`<span class="mark water"></span>` : nothing}
              </div>
            </div>`,
        )}
      </div>
      <div class="legend">
        <span><span class="mark water"></span>${v.water.label}</span>
        <span><span class="mark feed"></span>${v.feed.label}</span>
        <span class="legend-range">${v.t('next_14_days')}</span>
      </div>
    </div>
  </div>
`;

export const LAYOUTS = { header, side, countdown };
export type PlantLayout = keyof typeof LAYOUTS;

export const layoutStyles = css`
  h2 {
    margin: 0;
  }
  .name-lg {
    font-size: 30px;
    letter-spacing: 0.01em;
  }
  .name-md {
    font-size: 24px;
  }
  .meta,
  .sub {
    font-size: 12px;
    line-height: 1.3;
    color: var(--pc-muted);
  }
  .sub.small {
    font-size: 11px;
    line-height: 1.2;
  }
  .title {
    display: flex;
    flex-direction: column;
    gap: 3px;
    min-width: 0;
  }
  .care-row {
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .care-label {
    display: flex;
    align-items: center;
    gap: 6px;
  }
  .big {
    display: flex;
    align-items: baseline;
    gap: 6px;
  }
  .big .number {
    font: 600 52px/0.85 var(--pc-font-heading);
    text-transform: uppercase;
  }
  .big .unit {
    font: 500 15px/1 var(--pc-font-heading);
    letter-spacing: 0.04em;
    text-transform: uppercase;
    color: var(--pc-muted);
  }

  /* 1a */
  .header-photo .photo {
    height: 176px;
    border-bottom: 1px solid var(--pc-divider);
  }
  .header-title {
    display: flex;
    flex-direction: column;
    gap: 4px;
    padding: 16px 18px 14px;
  }
  .header-cares {
    display: grid;
    grid-template-columns: 1fr 1fr;
    border-top: 1px solid var(--pc-divider);
  }
  .header-care {
    display: flex;
    flex-direction: column;
    gap: 10px;
    min-width: 0;
    padding: 14px 18px 16px;
  }
  .header-care + .header-care {
    border-left: 1px solid var(--pc-divider);
  }
  .header-care .care-row {
    justify-content: space-between;
  }

  /* 1b */
  .side {
    display: flex;
  }
  .side-photo {
    flex: none;
    width: 116px;
    border-right: 1px solid var(--pc-divider);
  }
  .side-photo .photo {
    height: 100%;
  }
  .side-photo .photo.hatch.sm {
    padding: 8px 10px;
  }
  .side-body {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 14px;
    padding: 14px 16px 16px;
  }
  .side-care {
    display: flex;
    flex-direction: column;
    gap: 7px;
  }
  .side-text {
    margin-left: auto;
    font-size: 18px;
    white-space: nowrap;
  }
  .track {
    position: relative;
    height: 4px;
    background: var(--pc-divider);
  }
  .fill {
    position: absolute;
    inset: 0 auto 0 0;
    background: var(--pc-accent);
  }
  .fill.overdue {
    background: var(--pc-text);
  }

  /* 1c */
  .countdown {
    display: flex;
    flex-direction: column;
    gap: 16px;
    padding: 18px 18px 16px;
  }
  .countdown-head {
    display: flex;
    gap: 14px;
    align-items: flex-start;
  }
  .countdown-head .title {
    flex: 1;
  }
  .countdown-photo {
    flex: none;
    width: 84px;
    height: 84px;
  }
  .countdown-photo .photo {
    height: 100%;
    border: 1px solid var(--pc-divider);
  }
  .hero {
    display: flex;
    flex-direction: column;
    gap: 6px;
    margin-top: -30px;
  }
  .hero-label {
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .hero-big {
    gap: 8px;
  }
  .hero-big .number {
    font-size: 88px;
    line-height: 0.82;
  }
  .hero-big .unit {
    font-size: 22px;
  }
  .then {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-top: 4px;
    font-size: 13px;
    line-height: 1.3;
  }
  .then-text {
    font-weight: 600;
  }
  .ruler-block {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }
  .ruler {
    display: grid;
    grid-template-columns: repeat(15, 1fr);
    border: 1px solid var(--pc-divider);
  }
  .day {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 6px;
    padding: 6px 0;
    color: var(--pc-muted);
  }
  .day + .day {
    border-left: 1px solid var(--pc-divider);
  }
  .day.today {
    background: var(--pc-accent-100);
    color: var(--pc-accent-800);
  }
  .day-num {
    font: 500 10px/1 var(--pc-font-body);
  }
  .marks {
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
    align-items: center;
    gap: 3px;
    height: 22px;
  }
  .mark {
    display: inline-block;
    box-sizing: border-box;
    width: 8px;
    height: 8px;
  }
  .mark.water {
    background: var(--pc-accent);
  }
  .mark.feed {
    border: 1.5px solid var(--pc-accent);
  }
  .legend {
    display: flex;
    gap: 14px;
    font-size: 11px;
    color: var(--pc-muted);
  }
  .legend > span {
    display: flex;
    align-items: center;
    gap: 5px;
  }
  .legend-range {
    margin-left: auto;
  }
`;
