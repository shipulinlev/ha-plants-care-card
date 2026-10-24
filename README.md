<p align="center"><img src="https://raw.githubusercontent.com/shipulinlev/ha-plants-care-card/main/docs/brand/icon.png" alt="Plant Care Cards icon" width="128"></p>

# Plant Care Cards for Home Assistant

Lovelace dashboard cards for the [Plant Care](https://github.com/shipulinlev/ha-plant-care) integration. One card shows a single plant's next watering and feeding. The other shows every plant in a room, the most urgent first.

> **Status:** early development, pre-v0.1.0. Both cards follow the layouts in [docs/design/](docs/design/) and have visual editors. Next: testing in a real Home Assistant and the first release.

> [!WARNING]
> **AI-assisted project ("vibe coded").** These cards are designed and written largely by an AI coding assistant ([Claude Code](https://claude.com/claude-code)), with a human steering, reviewing and testing. Treat them as experimental: review the code before relying on it, and please report anything that looks wrong.

## Features

- **Plant card** (`custom:plant-care-card`): one plant with its next watering and next feeding, in three layouts:
  - `header`: a photo on top and a big countdown for each care (default).
  - `side`: a photo on the side and a progress bar for each care.
  - `countdown`: the next care as a big number, with a 14-day ruler.
- **Group card** (`custom:plant-care-group-card`): the plants of one HA area, plants you pick, or both, sorted by urgency, as a `list` or a 2-column `grid`. The header says how many plants need care today.
- **Status that keeps up with the clock.** The `ok` / `soon` / `due` / `overdue` labels start from the integration's status sensors. Between the integration's updates, the card applies the integration's own rule to the due time, so a label moves from Soon to Due to Overdue on time.
- **Species, interval and photo from the integration.** The species name, the "every N days" interval and the plant's photo show up when the integration provides them; plants without a species or care history simply leave them out. The photo is the one you upload in the plant's settings in the integration (_Edit plant → Photo_), or else the OpenPlantbook species photo.
- **Follows your theme.** Colors map to HA theme variables, so the cards work on light and dark themes.

## Installation

### HACS (recommended)

1. HACS → ⋮ → Custom repositories → add this repository's URL, category _Dashboard_.
2. Install **Plant Care Cards** and reload the browser.

### Manual

Copy `ha-plants-care-card.js` from the latest release to `<config>/www/`. Then add it as a dashboard resource: _Settings → Dashboards → ⋮ → Resources → Add resource_, URL `/local/ha-plants-care-card.js`, type _JavaScript module_.

**Requirements:** the [Plant Care](https://github.com/shipulinlev/ha-plant-care) integration with at least one plant.

## Configuration

Both cards are in the dashboard's card picker (_Add card → Plant Care_), and the preview already shows one of your plants. The visual editor sets every option below except the group card's `images`, which is YAML only. Options left at their defaults are not written to the YAML.

### Plant card

```yaml
type: custom:plant-care-card
device_id: <plant device id>
layout: header
date_format: relative
show_interval: true
image: /local/plants/monstera.jpg
```

| Option          | Default        | Description                                                                                            |
| --------------- | -------------- | ------------------------------------------------------------------------------------------------------ |
| `device_id`     | required       | the plant device                                                                                       |
| `layout`        | `header`       | `header`, `side` or `countdown`                                                                        |
| `date_format`   | `relative`     | `relative` ("in 3 days") or `absolute` ("Thu 15 Oct")                                                  |
| `show_interval` | `true`         | show "every N days" under the countdown                                                                |
| `image`         | none           | plant photo; without it the card uses the species photo from the integration, or a hatched placeholder |
| `photo_style`   | `duotone`      | `duotone` (tinted with the theme accent) or `natural`                                                  |
| `font`          | `design`       | `design` (Barlow, from Google Fonts) or `theme` (the HA theme font)                                    |
| `tap_action`    | more-info      | a standard [card action](https://www.home-assistant.io/dashboards/actions/)                            |
| `hold_action`   | log a watering | a standard card action                                                                                 |

Tap opens the plant's details. Hold presses the plant's **Water** button after you confirm, so a watering is logged now. Set either action to `action: none` to turn it off.

In the `header` and `side` layouts the Water and Feed status chips are buttons too. Press one to log that care now. It works at any time; before the care is due, the card asks you to confirm first.

### Group card

```yaml
type: custom:plant-care-group-card
area: living_room # every plant in the area…
plants: # …and/or plants you pick, by device ID
  - 0d6c9e1f4a2b47c8a1e3f5b7d9c2e4a6
title: Herbs
layout: grid
```

| Option        | Default        | Description                                                         |
| ------------- | -------------- | ------------------------------------------------------------------- |
| `area`        | none           | the area ID; `area` or `plants` is required                         |
| `plants`      | none           | plant device IDs, shown along with the area's plants                |
| `sort`        | `urgency`      | `urgency`, or `manual`: `plants` as listed, then the area's by name |
| `layout`      | `list`         | `list` or `grid`                                                    |
| `date_format` | `relative`     | `relative` or `absolute`                                            |
| `title`       | the area name  | heading text; `Plants` without an area                              |
| `show_name`   | `true`         | show the heading; `false` leaves only the summary                   |
| `images`      | none           | photos per plant: `{ <device_id>: /local/plants/monstera.jpg }`     |
| `photo_style` | `duotone`      | `duotone` or `natural`                                              |
| `font`        | `design`       | `design` or `theme`                                                 |
| `tap_action`  | more-info      | applied to each plant                                               |
| `hold_action` | log a watering | applied to each plant                                               |

The card used to be called the area card: `custom:plant-care-area-card` still works and takes the same options.

Plants are sorted by what needs care first, unless `sort: manual`. Each plant responds to tap and hold like the plant card, and its Water and Feed chips log that care, as on the plant card.

## Development

The design handoff is in [docs/design/](docs/design/): open `Plant Card.dc.html` in a browser to compare it with the dev harness.

```bash
npm install
npm run dev     # dev harness with a mock hass: every layout, light and dark
npm test        # unit tests
npm run build   # dist/ha-plants-care-card.js, committed: HACS installs it from the release tag
```

## License

[MIT](LICENSE).
