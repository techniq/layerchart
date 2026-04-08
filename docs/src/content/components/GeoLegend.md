---
description: Geographic scale bar showing real-world distance for the current `Chart` projection. Inspired by Harry Stevens' d3-geo-scale-bar.
category: geo
layers: [html]
related: [Legend, CircleLegend]
---

## Usage

`GeoLegend` reads the active geo projection from the chart context and computes a "nice" round distance that fits within the chart, drawing a labeled scale bar with tick subdivisions. Pass `units="mi"` to display miles instead of the default kilometers, or set `distance` for an explicit value.

The bar reactively updates as the user pans/zooms — both `transform.mode: 'canvas'` and `transform.mode: 'projection'` are supported.

### Projection transform mode

:example{ name="basic" showCode }

### Canvas transform mode

:example{ name="canvas-mode" showCode }

### Variants

`variant` controls the visual style of the bar: `'bracket'` (default — top rule with downward tick brackets) or `'alternating'` (filled/unfilled segments between ticks).

:example{ name="variants" showCode }

### Ticks

Use `ticks` to control the number of subdivisions. Set `ticks={1}` to show only the endpoints (`0` and the final value).

:example{ name="ticks" showCode }

### Tick format

`tickFormat` accepts any [`@layerstack/utils`](https://github.com/techniq/layerstack/tree/main/packages/utils) format key (e.g. `"metric"`, `"integer"`), a `FormatConfig` object, or a custom `(value) => string` function. The default appends the unit on the last tick only.

:example{ name="tick-format" showCode }

### Stacked units

Use `labelPlacement="top"` to place labels above the bar so two legends with different units (e.g. kilometers and miles) can be stacked tightly with their bars touching.

:example{ name="stacked-units" showCode }

## Reference point

The pixels-per-unit ratio is measured at a single reference point on the projection — by default, the center of the chart's plot area (`[width / 2, height / 2]`). For conformal projections like Mercator where scale varies with latitude, the legend is only accurate at that reference point. Pass an explicit `referencePoint` in chart pixel coordinates to anchor the measurement elsewhere (e.g. near the legend itself, or over your region of interest).
