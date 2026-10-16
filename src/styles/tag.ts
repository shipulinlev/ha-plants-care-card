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
`;

// "Not set" (no status yet) uses the quiet ok style.
export const tagClass = (status: CareStatus | null): CareStatus => status ?? 'ok';

export const statusTag = (
  view: Pick<CareView, 'status' | 'statusLabel'>,
  text: string = view.statusLabel,
  chip = false,
) => html`<span class="tag ${tagClass(view.status)}${chip ? ' chip' : ''}">${text}</span>`;
