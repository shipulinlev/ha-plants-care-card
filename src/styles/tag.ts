import { css, html } from 'lit';
import type { CareView } from '../data/care';
import type { CareStatus } from '../data/model';

// One accent; fill weight carries urgency. From tagStyles in docs/design/Plant Card.dc.html.
export const tagStyles = css`
  .tag {
    display: inline-flex;
    align-items: center;
    box-sizing: border-box;
    padding: 3px 10px;
    border: 1px solid transparent;
    border-radius: 0;
    font: 400 11px/1.4 var(--pc-font-body);
    letter-spacing: 0.02em;
    white-space: nowrap;
  }
  .tag.chip {
    justify-content: center;
  }
  .tag.ok {
    border-color: var(--pc-divider);
    color: var(--pc-muted);
  }
  .tag.soon {
    background: var(--pc-accent-100);
    color: var(--pc-accent-800);
  }
  .tag.due {
    background: var(--pc-accent);
    border-color: var(--pc-accent);
    color: var(--pc-bg);
  }
  .tag.overdue {
    background: var(--pc-text);
    border-color: var(--pc-text);
    color: var(--pc-bg);
  }
  button.tag {
    margin: 0;
    background: transparent;
    cursor: pointer;
    user-select: none;
    -webkit-tap-highlight-color: transparent;
    transition: transform 120ms ease-out;
  }
  button.tag:hover {
    outline: 1px solid var(--pc-accent);
    outline-offset: 1px;
  }
  button.tag:focus-visible {
    outline: 2px solid var(--pc-accent);
    outline-offset: 2px;
  }
  button.tag:active {
    transform: scale(0.96);
  }
`;

// "Not set" (no status yet) uses the quiet ok style.
export const tagClass = (status: CareStatus | null): CareStatus => status ?? 'ok';

export const statusTag = (
  view: Pick<CareView, 'status' | 'statusLabel'>,
  text: string = view.statusLabel,
  chip = false,
) => html`<span class="tag ${tagClass(view.status)}${chip ? ' chip' : ''}">${text}</span>`;

// A status tag that logs its care when pressed, at any time: early care is the user's call.
// Without the integration's button entity it stays a plain tag.
export const careButton = (
  view: Pick<CareView, 'kind' | 'status' | 'statusLabel' | 'button' | 'logLabel'>,
  text: string = view.statusLabel,
  chip = false,
) =>
  view.button
    ? html`<button
        type="button"
        class="tag ${tagClass(view.status)}${chip ? ' chip' : ''}"
        data-care=${view.kind}
        title=${view.logLabel}
        aria-label=${`${text}, ${view.logLabel}`}
      >
        ${text}
      </button>`
    : statusTag(view, text, chip);
