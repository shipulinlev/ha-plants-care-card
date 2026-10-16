# Plant Care Cards

Lovelace dashboard cards for the [`plant_care`](https://github.com/shipulinlev/ha-plant-care) Home Assistant integration.

- `custom:plant-care-card`: one plant, with its next watering and next feeding.
- `custom:plant-care-area-card`: every plant in one area, most urgent first.

> Work in progress. The cards are placeholders until the layouts in `docs/design/` are implemented.

## Install

### HACS

1. HACS → ⋮ → **Custom repositories** → add this repository, category **Dashboard**.
2. Install **Plant Care Cards** and reload the browser.

### Manual

Copy `ha-plants-card.js` from the latest release to `/config/www/`. Then add it as a dashboard resource: `/local/ha-plants-card.js`, type **JavaScript module**.

## Configuration

```yaml
type: custom:plant-care-card
device_id: <plant device id>
layout: header # header | side | countdown
date_format: relative # relative | absolute
show_interval: true
image: /local/plants/monstera.jpg # optional
```

```yaml
type: custom:plant-care-area-card
area: living_room
layout: list # list | grid
date_format: relative
```

## Development

```sh
npm install
npm run dev     # dev harness with a mock hass: every layout, light and dark
npm test        # unit tests
npm run build   # dist/ha-plants-card.js
```

`docs/design/` holds the design handoff. Open `Plant Card.dc.html` in a browser to compare it with the harness.
