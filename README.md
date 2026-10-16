# Plant Care Cards for Home Assistant

Lovelace dashboard cards for the [Plant Care](https://github.com/shipulinlev/ha-plant-care) integration. One card shows a single plant's next watering and feeding. The other shows every plant in a room, the most urgent first.

> **Status:** early development, pre-v0.1.0. The cards are placeholders until the layouts in [docs/design/](docs/design/) are implemented.

> [!WARNING]
> **AI-assisted project ("vibe coded").** These cards are designed and written largely by an AI coding assistant ([Claude Code](https://claude.com/claude-code)), with a human steering, reviewing and testing. Treat them as experimental: review the code before relying on it, and please report anything that looks wrong.

## Features

- **Plant card** (`custom:plant-care-card`): one plant with its next watering and next feeding, in three layouts:
  - `header`: a photo on top and a big countdown for each care (default).
  - `side`: a photo on the side and a progress bar for each care.
  - `countdown`: the next care as a big number, with a 14-day ruler.
- **Area card** (`custom:plant-care-area-card`): every plant in one HA area, sorted by urgency, as a `list` or a 2-column `grid`. The header says how many plants need care today.
- **Status from the integration.** The `ok` / `soon` / `due` / `overdue` labels come from the integration's status sensors, not from the card's own calculation.
- **Follows your theme.** Colors map to HA theme variables, so the cards work on light and dark themes.

## Installation

### HACS (recommended)

1. HACS → ⋮ → Custom repositories → add this repository's URL, category _Dashboard_.
2. Install **Plant Care Cards** and reload the browser.

### Manual

Copy `ha-plants-care-card.js` from the latest release to `<config>/www/`. Then add it as a dashboard resource: _Settings → Dashboards → ⋮ → Resources → Add resource_, URL `/local/ha-plants-care-card.js`, type _JavaScript module_.

**Requirements:** the [Plant Care](https://github.com/shipulinlev/ha-plant-care) integration with at least one plant.

## Configuration

### Plant card

```yaml
type: custom:plant-care-card
device_id: <plant device id>
layout: header
date_format: relative
show_interval: true
image: /local/plants/monstera.jpg
```

| Option          | Default    | Description                                                  |
| --------------- | ---------- | ------------------------------------------------------------ |
| `device_id`     | required   | the plant device                                             |
| `layout`        | `header`   | `header`, `side` or `countdown`                              |
| `date_format`   | `relative` | `relative` ("in 3 days") or `absolute` ("Thu 15 Oct")        |
| `show_interval` | `true`     | show "every N days" under the countdown                      |
| `image`         | none       | plant photo; without it the card shows a hatched placeholder |

### Area card

```yaml
type: custom:plant-care-area-card
area: living_room
layout: list
date_format: relative
```

| Option        | Default    | Description              |
| ------------- | ---------- | ------------------------ |
| `area`        | required   | the area ID              |
| `layout`      | `list`     | `list` or `grid`         |
| `date_format` | `relative` | `relative` or `absolute` |

## Development

The design handoff is in [docs/design/](docs/design/): open `Plant Card.dc.html` in a browser to compare it with the dev harness.

```bash
npm install
npm run dev     # dev harness with a mock hass: every layout, light and dark
npm test        # unit tests
npm run build   # dist/ha-plants-care-card.js
```

## License

[MIT](LICENSE).
