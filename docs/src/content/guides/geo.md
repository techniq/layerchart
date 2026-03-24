---
title: Geo (Maps & Projections)
category: state
---

LayerChart provides a geographic system for rendering maps, globes, and spatial data. The `GeoState` manages a d3 projection and fits it to the chart dimensions, a `GeoContext` makes the projection available to descendant components, and a set of geo primitives (`GeoPath`, `GeoPoint`, `GeoTile`, `GeoCircle`, `GeoSpline`) render geographic features using that projection.

## Quick start

Add `geo` to any `Chart` to enable geographic rendering:

```svelte
<script lang="ts">
	import { Chart, GeoPath, Layer } from 'layerchart';
	import { geoAlbersUsa } from 'd3-geo';
	import { feature } from 'topojson-client';
</script>

<Chart geo={{ projection: geoAlbersUsa, fitGeojson: geojson }}>
	<Layer>
		{#each geojson.features as feature}
			<GeoPath geojson={feature} class="fill-surface-content/10 stroke-surface-content" />
		{/each}
	</Layer>
</Chart>
```

The `geo` prop creates a `GeoState` internally, configures the projection, fits it to the chart dimensions, and provides it via context to all geo components.

:example{ component="GeoPath" name="us-country-map" }

## Projections

The `projection` prop accepts an uncalled [d3 projection](https://d3js.org/d3-geo/projection). LayerChart calls it internally and configures scale, translate, rotation, and clipping based on the other geo props and the chart dimensions.

```svelte
<Chart geo={{ projection: geoMercator, fitGeojson: countries }}>
```

### Common projections

| Projection         | Type     | Use case                            |
| ------------------ | -------- | ----------------------------------- |
| `geoAlbersUsa`     | Flat map | US-focused maps (includes AK/HI)    |
| `geoMercator`      | Flat map | Web maps, tile layers               |
| `geoEqualEarth`    | Flat map | World maps with equal-area accuracy |
| `geoOrthographic`  | Globe    | Interactive globes                  |
| `geoNaturalEarth1` | Flat map | World maps with natural appearance  |

Globe projections (those with a default `clipAngle`, like `geoOrthographic`) are auto-detected for transform mode selection — see the [Transform guide](/docs/guides/transform#projection-mode) for details.

### Projection playground

Explore all available projections and their parameters interactively:

:example{ component="GeoContext" name="projection-playground" }

## Fitting to data

The `fitGeojson` prop auto-scales and translates the projection to fit the provided GeoJSON within the chart dimensions:

```svelte
<Chart geo={{ projection: geoAlbersUsa, fitGeojson: states }}>
```

Without `fitGeojson`, you must manually configure `scale` and `translate` on the projection. With `fitGeojson`, the projection calls `fitSize([width, height], geojson)` automatically.

<!-- ### Fixed aspect ratio

For server-side rendering or fixed-size maps, set `fixedAspectRatio` to use a constant size instead of the chart's responsive dimensions:

```svelte
<Chart geo={{ projection: geoMercator, fitGeojson: countries, fixedAspectRatio: 2 }}>
``` -->

## Rendering components

LayerChart provides dedicated geo components for common geographic elements, as well as [geo-enabled primitives](/docs/guides/primitives#geo-mode) for flexible positioning using projections.

### Primitives in geo mode

When a primitive (`Circle`, `Rect`, `Line`, `Text`, etc.) is placed inside a geo projection context, positional x/y props automatically resolve through the projection instead of chart scales. This lets you plot geographic data directly without wrapper components:

```svelte
<Chart data={cities} r="population" rRange={[2, 20]}>
	<GeoProjection projection={geoNaturalEarth1} fitGeojson={geojson}>
		<Layer>
			<GeoPath {geojson} class="fill-surface-200 stroke-surface-content/20" />
			<Circle cx="longitude" cy="latitude" r="population" class="fill-primary" />
		</Layer>
	</GeoProjection>
</Chart>
```

Props like `cx`/`cy` are projected as `[longitude, latitude]` pairs, while non-positional props (`r`, `fill`, `stroke`) continue to resolve through their chart scales. See the [Primitives guide — Geo Mode](/docs/guides/primitives#geo-mode) for full details.

### `GeoPath` — boundaries and shapes

Renders GeoJSON features as SVG `<path>` elements (or canvas paths). This is the primary component for country borders, state outlines, and any geographic shape.

```svelte
{#each geojson.features as feature}
	<GeoPath geojson={feature} class="fill-surface-content/10 stroke-surface-content" />
{/each}
```

:example{ component="GeoPath" name="choropleth" }

`GeoPath` also supports:

- **Tooltips** — set `tooltip` to wire up pointer events automatically
- **Click handlers** — `onclick` receives the event and the `geoPath` instance for computing bounds
- **Custom curves** — pass a d3 `curve` factory for non-standard path rendering
- **Geo transforms** — apply `geoTransform` for straight lines on projected maps

### `GeoPoint` — locations

Plots a point at a geographic coordinate. Accepts `lat` and `long` props and projects them through the current projection:

```svelte
{#each cities as city}
	<GeoPoint lat={city.lat} long={city.long} r={4} class="fill-primary" />
{/each}
```

:example{ component="GeoPoint" name="us-state-capitals" }

Use the `children` snippet for custom markers at each point:

```svelte
<GeoPoint lat={city.lat} long={city.long}>
	{#snippet children({ x, y })}
		<text {x} {y}>{city.name}</text>
	{/snippet}
</GeoPoint>
```

:example{ component="GeoPoint" name="icons" }

### `GeoTile` — map tiles

Renders raster map tiles (OpenStreetMap, etc.) that sync with the projection's scale and translate:

```svelte
<GeoTile url={(x, y, z) => `https://tile.openstreetmap.org/${z}/${x}/${y}.png`} />
```

:example{ component="GeoTile" name="basic" }

Tiles integrate with transform for zoomable maps:

:example{ component="GeoTile" name="zoomable-seamless-layers" }

### `GeoCircle` — circular regions

Draws a circle on the globe defined by a center coordinate and radius in degrees:

```svelte
<GeoCircle center={[-122.4, 37.8]} radius={5} class="fill-primary/20 stroke-primary" />
```

:example{ component="GeoCircle" name="earthquake-globe" }

### `GeoSpline` — curved connections

Renders a smooth arc between two geographic points, useful for flight paths and connection maps:

```svelte
<GeoSpline link={{ source: [-122.4, 37.8], target: [2.3, 48.9] }} class="stroke-primary" />
```

The `loft` prop controls how high the arc rises above the surface (default `1.0`):

:example{ component="GeoSpline" name="world-map" }

## Rotation

Set initial rotation on the projection using the `rotate` prop with yaw (longitude), pitch (latitude), and roll:

```svelte
<Chart
	geo={{
		projection: geoOrthographic,
		fitGeojson: countries,
		rotate: { yaw: -100, pitch: -40, roll: 0 }
	}}
/>
```

For interactive rotation, use `transform={{ mode: 'projection' }}` — see the [Transform guide](/docs/guides/transform#projection-mode).

:example{ component="GeoPath" name="animated-globe" }

## Clipping

### `clipAngle`

Controls the angular extent of the visible hemisphere for globe projections. Set to `90` for a standard hemisphere:

```svelte
<Chart geo={{ projection: geoOrthographic, clipAngle: 90 }}>
```

### `clipExtent`

Restricts rendering to a rectangular pixel region:

```svelte
<Chart geo={{ projection: geoMercator, clipExtent: [[0, 0], [width, height]] }}>
```

## Tooltips on maps

Set `tooltip` on each `GeoPath` to wire up pointer events automatically. The default tooltipContext `manual` mode is used, where each shape calls `show`/`hide` on pointer enter/leave:

```svelte
<Chart geo={{ projection: geoAlbersUsa, fitGeojson: states }}>
	<Layer>
		{#each states.features as feature}
			<GeoPath geojson={feature} tooltip />
		{/each}
	</Layer>
	<Tooltip.Root>
		{#snippet children({ data })}
			<Tooltip.Header value={data.properties.name} />
		{/snippet}
	</Tooltip.Root>
</Chart>
```

:example{ component="GeoPath" name="tooltip" }

For more on tooltip modes and configuration, see the [Tooltip guide](/docs/guides/tooltip).

## Pan & zoom on maps

Geographic pan/zoom is handled by the transform system. There are two main approaches:

### Projection mode

The projection itself is updated on every transform change, keeping geographic coordinates accurate:

```svelte
<Chart
	geo={{ projection: geoMercator, fitGeojson: states }}
	transform={{ mode: 'projection', scrollMode: 'scale' }}
/>
```

:example{ component="GeoPath" name="transform-projection" }

### Canvas mode

Applies a CSS/SVG transform to the rendered output without re-projecting. Faster but less geographically accurate at extreme zoom levels:

```svelte
<Chart
	geo={{ projection: geoAlbersUsa, fitGeojson: states }}
	transform={{ mode: 'canvas', scrollMode: 'scale' }}
/>
```

:example{ component="GeoPath" name="transform-canvas" }

### Globe rotation

Globe projections auto-detect rotation mode — dragging rotates the globe instead of panning:

```svelte
<Chart
	geo={{ projection: geoOrthographic, fitGeojson: countries }}
	transform={{ mode: 'projection' }}
/>
```

:example{ component="GeoPath" name="translucent-globe" }

For full details on constraints, inertia, and programmatic zoom, see the [Transform guide](/docs/guides/transform).

## Secondary projections with `GeoProjection`

The `geo` prop on `Chart` provides the primary projection context. Use the `GeoProjection` component to create a secondary projection scope for overlay effects like a translucent globe:

```svelte
<Chart geo={{ projection: geoOrthographic, fitGeojson: countries }}>
	<Layer>
		<!-- Primary projection renders country outlines -->
		{#each countries.features as feature}
			<GeoPath geojson={feature} />
		{/each}
	</Layer>

	<!-- Secondary projection with different clipAngle for back-face -->
	<GeoProjection projection={geoOrthographic} fitGeojson={countries} clipAngle={180}>
		<Layer>
			{#each countries.features as feature}
				<GeoPath geojson={feature} class="fill-surface-content/5" />
			{/each}
		</Layer>
	</GeoProjection>
</Chart>
```

:example{ component="GeoPath" name="translucent-globe" }

## Context access

### Within a snippet

```svelte
<Chart geo={{ projection: geoMercator, fitGeojson: countries }}>
	{#snippet children({ context })}
		<!-- context.geo.projection is the configured d3 projection -->
	{/snippet}
</Chart>
```

### Within a custom component

```svelte
<script lang="ts">
	import { getGeoContext } from 'layerchart';
	const geo = getGeoContext();
	// geo.projection — the d3 projection instance
	// geo.fitSizeRange — the [width, height] used for fitSize
</script>
```

### External to Chart

```svelte
<script lang="ts">
	import { type ChartState } from 'layerchart';
	let context = $state<ChartState>(null!);
	// context.geo.projection available here
</script>

<Chart bind:context geo={{ projection: geoMercator, fitGeojson: countries }}>
	<!-- ... -->
</Chart>
```

## GeoState properties

| Property       | Type               | Description                              |
| -------------- | ------------------ | ---------------------------------------- |
| `projection`   | `GeoProjection`    | The configured d3 projection instance    |
| `fitSizeRange` | `[number, number]` | The `[width, height]` used for `fitSize` |
| `chartWidth`   | `number`           | Current chart width (synced from Chart)  |
| `chartHeight`  | `number`           | Current chart height (synced from Chart) |

### Configuration props (`GeoStateProps`)

| Prop               | Type                                   | Description                                                  |
| ------------------ | -------------------------------------- | ------------------------------------------------------------ |
| `projection`       | `() => GeoProjection`                  | D3 projection factory (pass uncalled, e.g. `geoMercator`)    |
| `fitGeojson`       | `GeoPermissibleObjects`                | GeoJSON to fit the projection to                             |
| `fixedAspectRatio` | `number`                               | Fixed aspect ratio instead of responsive chart dimensions    |
| `clipAngle`        | `number`                               | Angular extent of visible hemisphere (degrees)               |
| `clipExtent`       | `[[number, number], [number, number]]` | Rectangular pixel clipping region                            |
| `rotate`           | `{ yaw, pitch, roll }`                 | Initial rotation in degrees                                  |
| `scale`            | `number`                               | Manual projection scale (overrides fitGeojson scale)         |
| `translate`        | `[number, number]`                     | Manual projection translate (overrides fitGeojson translate) |
| `center`           | `[number, number]`                     | Projection center `[longitude, latitude]`                    |
| `reflectX`         | `boolean`                              | Mirror the projection horizontally                           |
| `reflectY`         | `boolean`                              | Mirror the projection vertically                             |

## Quick reference

| Use case              | Configuration                                             | Example                                                                       |
| --------------------- | --------------------------------------------------------- | ----------------------------------------------------------------------------- |
| US map                | `geo={{ projection: geoAlbersUsa, fitGeojson }}`          | [us-country-map](/docs/components/GeoPath/us-country-map)                     |
| Choropleth            | `GeoPath` + color scale                                   | [choropleth](/docs/components/GeoPath/choropleth)                             |
| World globe           | `geo={{ projection: geoOrthographic, fitGeojson }}`       | [translucent-globe](/docs/components/GeoPath/translucent-globe)               |
| Animated globe        | `rotate` + animation                                      | [animated-globe](/docs/components/GeoPath/animated-globe)                     |
| Map with points       | `GeoPoint` with `lat`/`long`                              | [us-state-capitals](/docs/components/GeoPoint/us-state-capitals)              |
| Map with tiles        | `GeoTile` with tile URL                                   | [basic](/docs/components/GeoTile/basic)                                       |
| Zoomable tile map     | `GeoTile` + `transform={{ mode: 'projection' }}`          | [zoomable-seamless-layers](/docs/components/GeoTile/zoomable-seamless-layers) |
| Curved connections    | `GeoSpline` with `link`                                   | [world-map](/docs/components/GeoSpline/world-map)                             |
| Map tooltips          | `tooltipContext` + `GeoPath tooltip`                      | [tooltip](/docs/components/GeoPath/tooltip)                                   |
| Pan/zoom (projection) | `transform={{ mode: 'projection', scrollMode: 'scale' }}` | [transform-projection](/docs/components/GeoPath/transform-projection)         |
| Pan/zoom (canvas)     | `transform={{ mode: 'canvas', scrollMode: 'scale' }}`     | [transform-canvas](/docs/components/GeoPath/transform-canvas)                 |
| Globe rotation        | `transform={{ mode: 'projection' }}` + `geoOrthographic`  | [translucent-globe](/docs/components/GeoPath/translucent-globe)               |
| Globe with inertia    | `transform={{ mode: 'projection', inertia: true }}`       | [transform-globe-inertia](/docs/components/GeoPath/transform-globe-inertia)   |
| Bubble map            | `GeoPath` + scaled circles                                | [bubble-map](/docs/components/GeoPath/bubble-map)                             |
| Spike map             | `GeoPath` + spike marks                                   | [spike-map](/docs/components/GeoPath/spike-map)                               |
| Secondary projection  | `<GeoProjection>` component                               | [translucent-globe](/docs/components/GeoPath/translucent-globe)               |
| State with counties   | Nested GeoJSON features                                   | [us-state-with-counties](/docs/components/GeoPath/us-state-with-counties)     |

## API reference

- [GeoContext](/docs/components/GeoContext) — projection context component (also available via `<Chart geo={...}>`)
- [GeoProjection](/docs/components/GeoProjection) — secondary projection context component
- [GeoPath](/docs/components/GeoPath) — geographic shape rendering
- [GeoPoint](/docs/components/GeoPoint) — geographic point plotting
- [GeoTile](/docs/components/GeoTile) — raster map tiles
- [GeoCircle](/docs/components/GeoCircle) — circular geographic regions
- [GeoSpline](/docs/components/GeoSpline) — curved geographic connections
