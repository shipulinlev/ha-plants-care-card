import { css } from 'lit';

// Industry DS tokens mapped to HA theme variables (docs/design/README.md, "Token → HA variable
// mapping"). Each one can be overridden with a public --plant-care-* variable.
export const tokens = css`
  :host {
    --pc-bg: var(
      --plant-care-background,
      var(--ha-card-background, var(--card-background-color, #f2f2f3))
    );
    --pc-text: var(--plant-care-text, var(--primary-text-color, #1d1f20));
    --pc-muted: color-mix(in srgb, var(--pc-text) 68%, transparent);
    --pc-divider: var(
      --plant-care-divider,
      var(--divider-color, color-mix(in srgb, var(--pc-text) 16%, transparent))
    );
    --pc-accent: var(--plant-care-accent, var(--primary-color, #5980a6));
    --pc-accent-100: color-mix(in srgb, var(--pc-accent) 15%, transparent);
    --pc-accent-800: color-mix(in srgb, var(--pc-accent) 60%, var(--pc-text));
    --pc-font-theme: var(--ha-font-family-body, system-ui), sans-serif;
    --pc-font-heading: 'Barlow Condensed', var(--pc-font-theme);
    --pc-font-body: 'Barlow', var(--pc-font-theme);
  }
  :host([font='theme']) {
    --pc-font-heading: var(--pc-font-theme);
    --pc-font-body: var(--pc-font-theme);
  }
`;
