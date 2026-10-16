# Handoff: Plant Care dashboard cards

## Overview
Lovelace dashboard cards for the `plant_care` Home Assistant integration (https://github.com/shipulinlev/ha-plant-care):
- **Plant card**: one plant, showing next watering and next feeding.
- **Area card**: every plant in one HA area, sorted by urgency.

Target width is a masonry column (~400px). Must work on light and dark HA themes.

## About the design files
`Plant Card.dc.html` is a **design reference built in HTML**, not production code. Recreate it as a Lovelace custom card, most likely a LitElement web component (`custom:plant-care-card`, `custom:plant-care-area-card`) shipped as a frontend resource (HACS "Dashboard" category, or bundled with the integration via `frontend.add_extra_js_url`). Follow standard custom-card conventions: `setConfig`, `set hass`, `getCardSize`, `getGridOptions`, `static getConfigElement`/`getStubConfig`.

Open the HTML file in a browser to view it. It needs `support.js` and the `_ds/` folder next to it.

## Fidelity
**High-fidelity** for layout, type, spacing and status logic. Colors come from the "Industry" design-system tokens (below). In production, map them to HA theme variables so the card follows the user's theme (see *Token → HA variable mapping*).

## Data source (per plant device)
| Entity | Use |
|---|---|
| `sensor.<plant>_next_watering` / `_next_feeding` | timestamp → days until due (negative = overdue) |
| `sensor.<plant>_watering_status` / `_feeding_status` | `ok` \| `soon` \| `due` \| `overdue`. Use this, don't recompute |
| `button.<plant>_water` / `_feed` | actions (not shown in v1 design) |
| Device name, area, species attribute | title / kicker |
| Interval (days) | "every N days" sub-line and 1b progress bar. Expose as an attribute if it isn't one yet |
| Entity picture / user-configured image | plant photo |

The prototype treats `soon` as ≤ 2 days. In production, use whatever the integration reports.

Suggested config:
```yaml
type: custom:plant-care-card
device_id: <plant device>      # or entity prefix
layout: header | side | countdown   # 1a | 1b | 1c
date_format: relative | absolute
show_interval: true
image: /local/plants/monstera.jpg   # optional
---
type: custom:plant-care-area-card
area: living_room
layout: list | grid                 # 1e | 1f
```

## Shared visual rules
- Card: square corners (radius 0), transparent fill, 1px border `--color-divider`, plus four "+" registration marks at the corners (11×11px, 1px strokes, offset −6px, color text @55%). Implementation: the `.blueprint` + `.corner.tl/.tr/.bl/.br` rules in `_ds/.../styles.css`.
- Fonts: headings **Barlow Condensed** 600, uppercase. Body **Barlow**.
- Muted text: `color-mix(in srgb, var(--color-text) 68%, transparent)`.
- Photo placeholder: 135° hatch `repeating-linear-gradient(135deg, transparent 0 7px, divider 7px 8px)`. Real photos get the `.duotone` treatment (an accent layer with `mix-blend-mode: color`).
- Icons: Lucide `droplet` (water) and `sprout` (feed), stroke-width 1.5, 15–16px.

### Status scale (one accent: fill weight carries urgency)
Status label is a `.tag` (11px, letter-spacing .02em, padding 3px 10px, radius 0):
| Status | Label | Style |
|---|---|---|
| ok | OK | 1px border divider, muted text, no fill |
| soon | Soon | bg `accent-100`, text `accent-800` |
| due | Due | bg `accent`, text `bg` |
| overdue | Overdue | bg `text` (ink), text `bg` |

### Countdown copy
- days > 1: "in N days" (absolute mode: "Thu 15 Oct", en-GB short weekday/day/month)
- days = 1: "Tomorrow"
- days = 0: "Today"
- days < 0: "N days late"
- Big number: `|days|`, or "Today". Unit: "day"/"days", plus " late" when overdue.
- Sub-line: date (or relative text in absolute mode) · "every N days" (hidden if `show_interval: false`). Overdue: "Was due <date>".

## Screens

### 1a: Photo header (recommended default)
400px wide, column.
1. Photo 100% × 176px, bottom border.
2. Title block, padding 16/18/14: kicker `{area} · {species}` (Barlow 500 12px/1.3, ls .06em, uppercase, muted); name (Barlow Condensed 600 30px/1, uppercase).
3. 2-column grid (1fr 1fr), top border, 1px divider between cells. Each cell has padding 14/18/16 and 10px gap:
   - row: icon + label "WATER"/"FEED" (500 12px, ls .1em, uppercase) on the left, status tag on the right
   - big number: Barlow Condensed 600 52px/0.85 + unit (500 15px uppercase, muted), baseline-aligned, 6px gap
   - sub-line: 12px/1.3, muted

### 1b: Side photo + progress
Row. Photo 116px wide, full height, right border. Content padding 14/16/16, gap 14:
- name (Condensed 600 24px) and `{area} · {species}` (12px muted)
- per care row: icon+label, tag, and on the right the countdown text (Condensed 600 18px uppercase). Below that a 4px track (divider color) with a fill whose width is `(interval − days) / interval`, clamped 0–1. Fill is accent, or ink when overdue. Then the 11px sub-line.

### 1c: Countdown hero + 14-day ruler
Padding 18/18/16, gap 16.
- Header: name + area/species on the left, 84×84 photo on the right.
- "NEXT · {care}" + tag, then the big number (Condensed 600 88px/0.82) + unit (22px). This is the care with the smaller `days`.
- "Then {other care} {text}" + tag (13px).
- Ruler: 15 equal cells (today + 14), outer border, 1px dividers. Day-of-month 10px. Today's cell has bg `accent-100` and text `accent-800`. Markers: water = 8px solid accent square, feed = 8px square with a 1.5px accent outline. Overdue items pin to today.
- Legend: Water / Feed / "Next 14 days" (11px muted).

### 1d: States
Same as 1a with a 120px photo. Use it as the visual spec for ok/soon/due/overdue.

### 1e: Area list
- Header padding 16/18/14: "AREA" kicker + area name (Condensed 600 30px). Right side: "{n} plants" / "{k} need(s) care today" (or "All on schedule"), 12px muted, right-aligned.
- Column headers PLANT / WATER / FEED (10px, ls .12em, muted).
- Rows: grid `44px 1fr 74px 74px`, gap 12, padding 10/18, top border. Thumbnail 44×44. Name (Condensed 600 18px) + species (11px, ellipsis). Water/feed chips use the status tag styles, centered, with text "N d" / "Today" / "N d late".
- Sort ascending by `min(water_days, feed_days)`.

### 1f: Area grid
Header: area name + attention text, bottom border. 2-column grid of cells, 1px dividers between them. Each cell has padding 14/16/16, gap 10: photo 84px tall, name (18px), water big number 36px + unit + tag (right), and a footer "Water … Feed {text}" (12px muted).

## Interactions (v1)
The design has no inline actions. Recommended: tap opens more-info for the plant device. Hold → `button.press` on `_water` (confirm). Water/Feed buttons are a planned follow-up.

## Design tokens (Industry DS)
Light:
- bg `#f2f2f3`
- text `#1d1f20`
- accent `#5980a6`
- divider `color-mix(in srgb, #1d1f20 16%, transparent)`
- accent-100 `#eef6ff`
- accent-800 `#2c455d`

Dark (as used in the mock):
- bg `#1d2d3d`
- text `#f5f5f8`
- accent `#94bce3`
- divider `color-mix(in srgb, #f5f5f8 20%, transparent)`
- accent-100 → `#2c455d`
- accent-800 → `#d6ebff`

Full ramps are in `_ds/industry-…/styles.css`.

### Token → HA variable mapping (suggested)
- `--color-bg` → `--ha-card-background` / `--card-background-color`
- `--color-text` → `--primary-text-color`
- muted → `--secondary-text-color`
- `--color-divider` → `--divider-color`
- `--color-accent` → `--primary-color`
- `accent-100` → `rgba(var(--rgb-primary-color), .15)`
- `accent-800` → `--primary-color`, darkened (or `--primary-text-color`)

Set `ha-card { border-radius: 0; background: transparent }` (or keep `--ha-card-background`) and draw the corner marks with pseudo-elements.

## Assets
- No final images. Plant photos are placeholders.
- Icons: Lucide `droplet`, `sprout` (or `mdi:water` / `mdi:sprout` via `ha-icon`).
- Fonts: Barlow + Barlow Condensed (Google Fonts). Consider falling back to the HA theme font.

## Files
- `Plant Card.dc.html`: all options (1a–1f), light + dark. Data and formatting logic are in the `<script data-dc-script>` class (`care()` and `build()`).
- `support.js`: runtime needed to open the HTML.
- `_ds/industry-7177be25-d486-4202-9c49-a84d149a5468/styles.css`: token sheet and `.card` / `.tag` / `.blueprint` rules.
