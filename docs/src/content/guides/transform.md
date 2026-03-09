---
title: Transform (Pan & Zoom)
category: state
order: 2
---

LayerChart provides a transform system for panning and zooming charts, maps, and other visualizations. It supports multiple modes depending on the type of visualization: narrowing the data domain for cartesian charts, applying visual transforms for images and maps, or modifying geographic projections for globes.

## Modes

The `transform` prop's `mode` controls how zoom and pan are applied:

| Mode         | What changes                             | Best for                                    |
| ------------ | ---------------------------------------- | ------------------------------------------- |
| `domain`     | The visible data domain narrows/shifts   | Cartesian charts (line, bar, area, scatter) |
| `canvas`     | SVG/Canvas/CSS visual transform          | Maps, images, pack/tree layouts             |
| `projection` | Geo projection translate + scale updated | Maps with projection-based pan/zoom         |
| `rotate`     | Geo projection rotation updated          | Globe rotation (orthographic projections)   |
| `none`       | Disabled (default)                       | No zoom/pan needed                          |

### `domain` mode

Zooming and panning modifies the chart's domain — the range of data values shown on each axis. Scales and axes update automatically. This is the standard mode for cartesian data charts.

```svelte
<BarChart {data} x="date" y="value" transform={{ mode: 'domain', axis: 'x' }} />
```

:example{ component="BarChart" name="pan-zoom" }

The `axis` option restricts which axis is affected:

| Value    | Effect                   |
| -------- | ------------------------ |
| `'x'`    | Horizontal zoom/pan only |
| `'y'`    | Vertical zoom/pan only   |
| `'both'` | Both axes (default)      |

### `canvas` mode

Applies a CSS/SVG transform (translate + scale) to the rendered layers without changing the underlying data. Useful for maps, images, and hierarchical layouts where you want to zoom into the visual output.

:example{ component="TransformContext" name="pan-zoom-svg-image" }

For geographic maps, canvas mode transforms the rendered paths without re-projecting:

:example{ component="GeoPath" name="transform-canvas" }

:::tip
When using canvas mode with maps, compensate for zoom in visual properties like stroke width:

```svelte
<GeoPath strokeWidth={1 / context.transform.scale} />
```

:::

### `projection` mode

Applies transform values directly to the geo projection's `translate()` and `scale()` methods. The projection is re-evaluated on every transform change, keeping geographic coordinates synchronized with the view. This is the standard mode for interactive maps.

When `fitGeojson` is provided, the initial translate and scale are computed automatically to fit the data in the viewport.

```svelte
<Chart
	geo={{ projection: geoMercator, fitGeojson: states }}
	transform={{ mode: 'projection', initialScrollMode: 'scale' }}
/>
```

:example{ component="GeoPath" name="transform-projection" }

### `rotate` mode

Maps transform translate values to the projection's `rotate()` method — `translate.x` becomes yaw (longitude rotation) and `translate.y` becomes pitch (latitude tilt). Drag sensitivity is automatically scaled based on the projection's zoom level.

```svelte
<Chart
	geo={{ projection: geoOrthographic, fitGeojson: countries }}
	transform={{ mode: 'rotate' }}
/>
```

:example{ component="GeoPath" name="translucent-globe" }

## Interactions

### Scroll mode

The `initialScrollMode` option controls what the mouse wheel/trackpad does:

| Value         | Effect                                                |
| ------------- | ----------------------------------------------------- |
| `'scale'`     | Scroll wheel zooms in/out (default for `domain` mode) |
| `'translate'` | Scroll wheel pans                                     |
| `'none'`      | Scroll wheel does nothing (default for `canvas` mode) |

The scroll mode can be changed at runtime via `context.transform.setScrollMode('scale')`.

### Pointer interactions

- **Drag** — pan (click and drag to move the view)
- **Double-click** — zoom in 2x at the click point
- **Shift + double-click** — zoom out 0.5x
- **Pinch-to-zoom** — detected as ctrl+wheel events, always zooms regardless of scroll mode
- **Trackpad horizontal scroll** — pans horizontally in domain mode

The `clickDistance` option (default: `10` pixels) sets the threshold before a pointer movement is treated as a drag rather than a click.

Set `disablePointer: true` to disable all pointer-based interactions (useful when using programmatic zoom only).

### Brush integration

Combining `brush` with `transform` enables brush-to-zoom: the user draws a selection, then the chart zooms to that domain range.

```svelte
<LineChart {data} x="date" y="value" brush transform={{ mode: 'domain', axis: 'x' }} />
```

:example{ component="LineChart" name="brush-pan-zoom" }

## Programmatic control

Access the transform state via the chart context to control zoom/pan from code:

```svelte
<Chart>
	{#snippet children({ context })}
		<button onclick={() => context.transform.zoomIn()}>Zoom In</button>
		<button onclick={() => context.transform.zoomOut()}>Zoom Out</button>
		<button onclick={() => context.transform.reset()}>Reset</button>
	{/snippet}
</Chart>
```

### Methods

| Method                          | Description                               |
| ------------------------------- | ----------------------------------------- |
| `zoomIn()`                      | Zoom in by 1.25x from center              |
| `zoomOut()`                     | Zoom out by 0.8x from center              |
| `reset()`                       | Restore initial scale and translate       |
| `translateCenter()`             | Center the view (translate to 0,0)        |
| `zoomTo(center, rect?)`         | Zoom to fit a point or bounding rectangle |
| `setScale(value, options?)`     | Set scale directly                        |
| `setTranslate(point, options?)` | Set translate directly                    |
| `setScrollMode(mode)`           | Change scroll mode at runtime             |

### Properties

| Property     | Type                               | Description                                  |
| ------------ | ---------------------------------- | -------------------------------------------- |
| `scale`      | `number`                           | Current zoom scale (1 = no zoom)             |
| `translate`  | `{ x, y }`                         | Current pan offset                           |
| `moving`     | `boolean`                          | Is the transform animating or being dragged? |
| `dragging`   | `boolean`                          | Is the user actively dragging?               |
| `scrollMode` | `'scale' \| 'translate' \| 'none'` | Current scroll mode                          |

### `zoomTo` for feature zoom

A common pattern for maps and hierarchical layouts is to zoom to a specific feature or node:

```svelte
<GeoPath
	geojson={feature}
	onclick={(e, geoPath) => {
		const [[left, top], [right, bottom]] = geoPath.bounds(feature);
		const x = (left + right) / 2;
		const y = (top + bottom) / 2;
		context.transform.zoomTo({ x, y }, { width: right - left + 20, height: bottom - top + 20 });
	}}
/>
```

Click a state to zoom into it using projection-based `setScale` and `setTranslate`:

:example{ component="GeoPath" name="transform-projection" }

The same click-to-zoom pattern using canvas mode, where the visual transform is applied without re-projecting:

:example{ component="GeoPath" name="transform-canvas" }

Click a state to zoom with seamless tile layers that load progressively at each zoom level:

:example{ component="GeoTile" name="zoomable-seamless-layers" }

For hierarchical layouts, click a circle to zoom into it using `zoomTo` with `disablePointer` and animated motion:

:example{ component="Pack" name="basic" }

## Constraints

Constraints limit how far users can zoom and pan. They work across all modes.

### `scaleExtent` — limit zoom range

Clamps the zoom scale factor to `[minScale, maxScale]`. A scale of `1` is the default, values greater than `1` zoom in, values less than `1` zoom out.

```svelte
<BarChart
	{data}
	x="date"
	y="value"
	transform={{ mode: 'domain', axis: 'x', scaleExtent: [1, 10] }}
/>
```

`scaleExtent: [1, 10]` means the user can zoom in up to 10x but cannot zoom out past the initial view.

:example{ component="BarChart" name="pan-zoom-scale-extent" }

This works identically for geo canvas transforms:

:example{ component="GeoPath" name="transform-canvas-scale-extent" }

### `domainExtent` — constrain in data space

For `mode: 'domain'` charts, `domainExtent` lets you express constraints in data units rather than pixel/transform space. This is useful when you want to say things like "don't pan before January 2020" or "always show at least 7 days."

```svelte
<LineChart
	{data}
	x="date"
	y="value"
	transform={{
		mode: 'domain',
		axis: 'x',
		scaleExtent: [1, 50],
		domainExtent: {
			x: {
				min: 'data',
				max: 'data',
				minRange: 7 * 24 * 60 * 60 * 1000
			}
		}
	}}
/>
```

Each axis (`x` or `y`) supports:

| Property   | Type                       | Description                                                                         |
| ---------- | -------------------------- | ----------------------------------------------------------------------------------- |
| `min`      | `number \| Date \| 'data'` | Minimum domain value (pan boundary). `'data'` = initial data min.                   |
| `max`      | `number \| Date \| 'data'` | Maximum domain value (pan boundary). `'data'` = initial data max.                   |
| `minRange` | `number`                   | Minimum visible range in data units (max zoom in). For dates, this is milliseconds. |

Using `'data'` for `min`/`max` is the most common pattern — it prevents panning past the data boundaries without hardcoding values.

:example{ component="LineChart" name="pan-zoom-domain-extent" }

### `constrain` — custom constraint function

For full control, provide a `constrain` function that receives the proposed `{ scale, translate }` and returns corrected values. Called after `scaleExtent` and `translateExtent` are applied.

```svelte
<LineChart
	{data}
	x="date"
	y="value"
	transform={{
		mode: 'domain',
		axis: 'x',
		constrain: ({ scale, translate }) => ({
			scale: Math.max(1, Math.min(20, scale)),
			translate: {
				x: Math.min(0, translate.x),
				y: 0
			}
		})
	}}
/>
```

:example{ component="LineChart" name="pan-zoom-custom-constrain" }

#### Globe rotation constraints

For globe projections using `mode: 'rotate'`, the translate values represent rotation angles (yaw/pitch in degrees). A custom `constrain` function can clamp the pitch to prevent flipping the globe:

```svelte
<Chart
	geo={{ projection: geoOrthographic, fitGeojson: countries }}
	transform={{
		mode: 'rotate',
		constrain: ({ scale, translate }) => ({
			scale,
			translate: {
				x: translate.x,
				y: Math.max(-90, Math.min(90, translate.y))
			}
		})
	}}
/>
```

:example{ component="GeoPath" name="transform-globe-constrain" }

### `translateExtent` — pixel-space pan bounds

Constrains panning to a bounding box in pixel coordinates `[[minX, minY], [maxX, maxY]]`. Most useful for `canvas` mode transforms where you want to prevent panning beyond specific pixel boundaries.

```svelte
<Chart
	transform={{
		mode: 'canvas',
		translateExtent: [
			[0, 0],
			[800, 600]
		]
	}}
/>
```

For `domain` mode, prefer `domainExtent` which lets you express bounds in data units.

### How constraints compose

When multiple constraint options are provided, they are applied in order:

1. `scaleExtent` — clamps scale
2. `translateExtent` — clamps translate
3. `domainExtent` — clamps in domain space (converted to a `constrain` function internally)
4. `constrain` — final custom adjustment

A user-provided `constrain` function runs after all other constraints, giving it the final say.

## Motion / animation

Transform changes can be animated using the `motion` prop:

```svelte
<!-- Tween animation -->
<Chart
	transform={{
		mode: 'canvas',
		motion: { type: 'tween', duration: 800, easing: cubicOut }
	}}
/>

<!-- Spring animation -->
<Chart
	transform={{
		mode: 'domain',
		motion: { type: 'spring' }
	}}
/>
```

During drag and wheel interactions, motion is automatically set to instant so the view follows the pointer without lag.

## Controls

The `TransformContextControls` component provides a UI overlay with zoom/pan buttons and scroll mode selector:

```svelte
<Chart transform={{ mode: 'canvas', initialScrollMode: 'scale' }}>
	{#snippet children()}
		<TransformContextControls />
		<!-- chart content -->
	{/snippet}
</Chart>
```

It supports placement (`'top-left'`, `'top-right'`, `'bottom-left'`, etc.), orientation (`'horizontal'` or `'vertical'`), and selective display of controls via the `show` prop.

## Quick reference

| Use case               | Configuration                                                    | Example                                                                                 |
| ---------------------- | ---------------------------------------------------------------- | --------------------------------------------------------------------------------------- |
| Pan/zoom a time series | `transform={{ mode: 'domain', axis: 'x' }}`                      | [pan-zoom](/docs/components/BarChart/pan-zoom)                                          |
| Limit zoom depth       | `scaleExtent: [1, 10]`                                           | [pan-zoom-scale-extent](/docs/components/BarChart/pan-zoom-scale-extent)                |
| Keep data in view      | `domainExtent: { x: { min: 'data', max: 'data' } }`              | [pan-zoom-domain-extent](/docs/components/LineChart/pan-zoom-domain-extent)             |
| Minimum visible range  | `domainExtent: { x: { minRange: 7 * 86400000 } }`                | [pan-zoom-domain-extent](/docs/components/LineChart/pan-zoom-domain-extent)             |
| Pan/zoom a map (CSS)   | `transform={{ mode: 'canvas', initialScrollMode: 'scale' }}`     | [transform-canvas](/docs/components/GeoPath/transform-canvas)                           |
| Pan/zoom a map (geo)   | `transform={{ mode: 'projection', initialScrollMode: 'scale' }}` | [transform-projection](/docs/components/GeoPath/transform-projection)                   |
| Globe rotation         | `transform={{ mode: 'rotate' }}`                                 | [translucent-globe](/docs/components/GeoPath/translucent-globe)                         |
| Geo map zoom limits    | `scaleExtent: [1, 8]`                                            | [transform-canvas-scale-extent](/docs/components/GeoPath/transform-canvas-scale-extent) |
| Globe pitch clamping   | `constrain` with `Math.max(-90, ...)`                            | [transform-globe-constrain](/docs/components/GeoPath/transform-globe-constrain)         |
| Brush-to-zoom          | `brush` + `transform={{ mode: 'domain' }}`                       | [brush-pan-zoom](/docs/components/LineChart/brush-pan-zoom)                             |
| Programmatic zoom only | `disablePointer: true` with `zoomTo()` calls                     | [basic](/docs/components/Pack/basic)                                                    |
| Animated transforms    | `motion: { type: 'tween', duration: 800 }`                       | [basic](/docs/components/Pack/basic)                                                    |
