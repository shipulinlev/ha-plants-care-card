import { css, html, nothing } from 'lit';

export type PhotoStyle = 'duotone' | 'natural';

export interface PhotoOptions {
  src: string | null;
  style: PhotoStyle;
  size?: 'lg' | 'sm'; // hatch density: 7/8px stripes, or 5/6px for thumbnails
  label?: string; // placeholder caption, e.g. "Plant photo"
}

// The layout sizes the photo; it fills its box.
export const photoStyles = css`
  .photo {
    position: relative;
    overflow: hidden;
    box-sizing: border-box;
    display: flex;
    align-items: flex-end;
  }
  .photo img {
    display: block;
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  .photo.hatch {
    --hatch-gap: 7px;
    --hatch-step: 8px;
    padding: 10px 12px;
    background: repeating-linear-gradient(
      135deg,
      transparent 0 var(--hatch-gap),
      var(--pc-divider) var(--hatch-gap) var(--hatch-step)
    );
  }
  .photo.hatch.sm {
    --hatch-gap: 5px;
    --hatch-step: 6px;
    padding: 6px 7px;
  }
  .photo-label {
    font: 500 10px/1 var(--pc-font-body);
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: color-mix(in srgb, var(--pc-text) 65%, transparent);
  }
  .photo.sm .photo-label {
    font-size: 9px;
  }
  .photo.duotone::after {
    content: '';
    position: absolute;
    inset: 0;
    pointer-events: none;
    background: var(--pc-accent);
    mix-blend-mode: color;
  }
`;

export const plantPhoto = ({ src, style, size = 'lg', label }: PhotoOptions) =>
  src
    ? html`<div class="photo ${size}${style === 'duotone' ? ' duotone' : ''}">
        <img src=${src} alt="" loading="lazy" />
      </div>`
    : html`<div class="photo hatch ${size}">
        ${label ? html`<span class="photo-label">${label}</span>` : nothing}
      </div>`;
