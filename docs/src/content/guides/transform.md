---
title: Transform (Pan & Zoom)
category: state
---

LayerChart provides a transform system for panning and zooming charts, maps, and other visualizations. It supports multiple modes depending on the type of visualization: narrowing the data domain for cartesian charts, applying visual transforms for images and maps, or modifying geographic projections for maps and globes.

## Modes

The `transform` prop's `mode` controls how zoom and pan are applied:

| Mode         | What changes                           | Best for                                          |
| ------------ | -------------------------------------- | ------------------------------------------------- |
| `domain`     | The visible data domain narrows/shifts | Cartesian charts (line, bar, area, scatter)       |
| `canvas`     | SVG/Canvas/CSS visual transform        | Maps, images, pack/tree layouts                   |
| `projection` | Geo projection                         | Maps and globes with projection-based interaction |
| `none`       | Disabled (default)                     | No zoom/pan needed                                |

### `domain` mode

Zooming and panning modifies the chart's domain — the range of data values shown on each axis. Scales and axes update automatically. This is the standard mode for cartesian data charts.

```svelte
<BarChart {data} x="date" y="value" transform={{ mode: 'domain', axis: 'x' }} />
```

:example{ component="BarChart" name="pan-zoom" }

For categorical (band scale) data, domain mode rescales the band range — bars grow proportionally as you zoom and pan smoothly across categories. Panning is automatically constrained to data boundaries:

:example{ component="BarChart" name="pan-zoom-band" }

A gradient-filled rectangle with full-chart grid axes, demonstrating both-axis zoom with `scaleExtent` up to 40x:

:example{ component="TransformContext" name="pan-zoom-axes" }

<!-- A bubble chart with zoomable axes, showing GDP per capita vs life expectancy by continent:

:example{ component="ScatterChart" name="zoomable-bubble" } -->

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

Updates the geo projection based on transform interactions. The projection is re-evaluated on every transform change, keeping geographic coordinates synchronized with the view.

Which projection properties are updated is controlled by the `apply` option and auto-detected from the projection type:

| Projection type                                 | Default `apply`                                      | Behavior                |
| ----------------------------------------------- | ---------------------------------------------------- | ----------------------- |
| Flat maps (`geoMercator`, `geoAlbersUsa`, etc.) | `{ translate: true, scale: true, rotation: false }`  | Drag pans, scroll zooms |
| Globe projections (`geoOrthographic`, etc.)     | `{ rotation: true, scale: false, translate: false }` | Drag rotates the globe  |

Auto-detection uses the projection's `clipAngle` — projections with a default clip angle (like orthographic) are treated as globes. Override with explicit `apply` values when needed.

When `fitGeojson` is provided and translate mode is active, the initial translate and scale are computed automatically to fit the data in the viewport.

```svelte
<!-- Flat map: pan/zoom (auto-detected) -->
<Chart
	geo={{ projection: geoMercator, fitGeojson: states }}
	transform={{ mode: 'projection', scrollMode: 'scale' }}
/>
```

:example{ component="GeoPath" name="transform-projection" }

```svelte
<!-- Globe: rotation (auto-detected from geoOrthographic) -->
<Chart
	geo={{ projection: geoOrthographic, fitGeojson: countries }}
	transform={{ mode: 'projection' }}
/>
```

:example{ component="GeoPath" name="translucent-globe" }

To enable zoom on a globe alongside rotation:

```svelte
<Chart
	geo={{ projection: geoOrthographic, fitGeojson: countries }}
	transform={{ mode: 'projection', apply: { rotation: true, scale: true } }}
/>
```

## Interactions

### Scroll mode

The `scrollMode` option controls what the mouse wheel/trackpad does:

| Value         | Effect                                                |
| ------------- | ----------------------------------------------------- |
| `'scale'`     | Scroll wheel zooms in/out (default for `domain` mode) |
| `'translate'` | Scroll wheel pans                                     |
| `'none'`      | Scroll wheel does nothing (default for `canvas` mode) |

The scroll mode is reactive and can be changed at runtime via `context.transform.scrollMode = 'scale'`.

### Scroll activation key

By default, scroll/wheel events are processed immediately. To prevent accidental zoom/pan when scrolling the page, require a modifier key to be held:

```svelte
<Chart
	transform={{
		mode: 'canvas',
		scrollMode: 'scale',
		scrollActivationKey: 'meta'
	}}
/>
```

| Value       | Key                               |
| ----------- | --------------------------------- |
| `'meta'`    | ⌘ Command (Mac) / ⊞ Win (Windows) |
| `'alt'`     | ⌥ Option / Alt                    |
| `'control'` | Control                           |
| `'shift'`   | Shift                             |

When set, scroll events without the key held are ignored (no `preventDefault`), allowing normal page scrolling.

:example{ component="TransformContext" name="scroll-activation-key" }

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

### Overview brush

A separate overview chart below the main chart can act as a navigation control. The overview shows the full dataset with a brush that reflects the main chart's visible region. Zooming or panning the main chart updates the brush; dragging the brush scrolls the main chart.

Bind the main chart's `context` to read its `xDomain`, then pass it as the overview brush's `x` prop. On brush change, call `zoomToBrush()` to sync back:

:example{ component="LineChart" name="pan-zoom-with-overview" }

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

Use `setScale()` and `reset()` to build animated zoom controls, like this solar system visualization that lets you explore planet distances:

:example{ component="TransformContext" name="planet-distances" }

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

The same patterns work at world scale — click a country to zoom in:

:example{ component="GeoPath" name="transform-world-projection" }

:example{ component="GeoPath" name="transform-world-canvas" }

Click a state to zoom with seamless tile layers that load progressively at each zoom level:

:example{ component="GeoTile" name="zoomable-seamless-layers" }

For hierarchical layouts, click a circle to zoom into it using `zoomTo` with `disablePointer` and animated motion:

:example{ component="Pack" name="basic" }

Load progressively more detailed data as the user zooms in, using the visible domain to sample the appropriate level of detail:

:example{ component="LineChart" name="pan-zoom-dynamic-data" }

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

For globe projections using rotation, the translate values represent rotation angles (yaw/pitch in degrees). A custom `constrain` function can clamp the pitch to prevent flipping the globe:

```svelte
<Chart
	geo={{ projection: geoOrthographic, fitGeojson: countries }}
	transform={{
		mode: 'projection',
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

### Inertia (momentum)

Enable `inertia` to let the view coast after a drag release, based on the velocity of the gesture. The existing motion system (spring or tween) handles the deceleration animation.

```svelte
<Chart
	transform={{
		mode: 'projection',
		motion: 'spring',
		inertia: true
	}}
/>
```

Pass `true` for sensible defaults, or an options object for fine-tuning:

| Option           | Type     | Default    | Description                                                 |
| ---------------- | -------- | ---------- | ----------------------------------------------------------- |
| `decay`          | `number` | `0.99`     | Decay factor (0–1). Higher = further coast distance.        |
| `minVelocity`    | `number` | `0.1`      | Minimum velocity (px/ms) to trigger inertia.                |
| `maxVelocity`    | `number` | `Infinity` | Maximum velocity (px/ms) cap. Prevents wild throws.         |
| `velocityWindow` | `number` | `160`      | Time window (ms) to measure velocity from pointer movement. |

```svelte
<Chart
	transform={{
		mode: 'canvas',
		motion: 'spring',
		inertia: { decay: 0.92, minVelocity: 0.05 }
	}}
/>
```

For a map-like feel with capped velocity:

```svelte
<Chart
	transform={{
		mode: 'projection',
		motion: { type: 'tween', duration: 800, easing: cubicOut },
		inertia: { decay: 0.99, maxVelocity: 1.4 }
	}}
/>
```

Inertia works with all transform modes and respects `translateExtent`, `constrain`, and other constraints.

:example{ component="GeoPath" name="transform-globe-inertia" }

## Controls

The `TransformContextControls` component provides a UI overlay with zoom/pan buttons and scroll mode selector:

```svelte
<Chart transform={{ mode: 'canvas', scrollMode: 'scale' }}>
	{#snippet children()}
		<TransformContextControls />
		<!-- chart content -->
	{/snippet}
</Chart>
```

It supports placement (`'top-left'`, `'top-right'`, `'bottom-left'`, etc.), orientation (`'horizontal'` or `'vertical'`), and selective display of controls via the `show` prop.

## Quick reference

| Use case               | Configuration                                             | Example                                                                                 |
| ---------------------- | --------------------------------------------------------- | --------------------------------------------------------------------------------------- |
| Pan/zoom a time series | `transform={{ mode: 'domain', axis: 'x' }}`               | [pan-zoom](/docs/components/BarChart/pan-zoom)                                          |
| Pan/zoom categories    | `transform={{ mode: 'domain', axis: 'x' }}` (band scale)  | [pan-zoom-band](/docs/components/BarChart/pan-zoom-band)                                |
| Pan/zoom both axes     | `transform={{ mode: 'domain', scaleExtent: [1, 40] }}`    | [pan-zoom-axes](/docs/components/TransformContext/pan-zoom-axes)                        |
| Limit zoom depth       | `scaleExtent: [1, 10]`                                    | [pan-zoom-scale-extent](/docs/components/BarChart/pan-zoom-scale-extent)                |
| Keep data in view      | `domainExtent: { x: { min: 'data', max: 'data' } }`       | [pan-zoom-domain-extent](/docs/components/LineChart/pan-zoom-domain-extent)             |
| Minimum visible range  | `domainExtent: { x: { minRange: 7 * 86400000 } }`         | [pan-zoom-domain-extent](/docs/components/LineChart/pan-zoom-domain-extent)             |
| Pan/zoom a map (CSS)   | `transform={{ mode: 'canvas', scrollMode: 'scale' }}`     | [transform-canvas](/docs/components/GeoPath/transform-canvas)                           |
| Pan/zoom a map (geo)   | `transform={{ mode: 'projection', scrollMode: 'scale' }}` | [transform-projection](/docs/components/GeoPath/transform-projection)                   |
| World map (CSS)        | Canvas mode + world countries                              | [transform-world-canvas](/docs/components/GeoPath/transform-world-canvas)               |
| World map (geo)        | Projection mode + world countries                          | [transform-world-projection](/docs/components/GeoPath/transform-world-projection)       |
| Globe rotation         | `transform={{ mode: 'projection' }}` (auto-detected)      | [translucent-globe](/docs/components/GeoPath/translucent-globe)                         |
| Geo map zoom limits    | `scaleExtent: [1, 8]`                                     | [transform-canvas-scale-extent](/docs/components/GeoPath/transform-canvas-scale-extent) |
| Globe pitch clamping   | `constrain` with `Math.max(-90, ...)`                     | [transform-globe-constrain](/docs/components/GeoPath/transform-globe-constrain)         |
| Brush-to-zoom          | `brush` + `transform={{ mode: 'domain' }}`                | [brush-pan-zoom](/docs/components/LineChart/brush-pan-zoom)                             |
| Brush-to-zoom (band)   | `brush` + `transform` on band scale                       | [brush-pan-zoom-band](/docs/components/BarChart/brush-pan-zoom-band)                   |
| Overview brush         | Separate chart with `brush.x` synced to `context.xDomain` | [pan-zoom-with-overview](/docs/components/LineChart/pan-zoom-with-overview)             |
| Programmatic zoom only | `disablePointer: true` with `zoomTo()` calls              | [basic](/docs/components/Pack/basic)                                                    |
| Animated transforms    | `motion: { type: 'tween', duration: 800 }`                | [basic](/docs/components/Pack/basic)                                                    |
| Dynamic data loading   | Derive data from `context.xDomain` visible range          | [pan-zoom-dynamic-data](/docs/components/LineChart/pan-zoom-dynamic-data)               |
| Drag inertia           | `inertia: true` with `motion: 'spring'`                   | [transform-globe-inertia](/docs/components/GeoPath/transform-globe-inertia)             |
| Require key to scroll  | `scrollActivationKey: 'meta'`                             | [scroll-activation-key](/docs/components/TransformContext/scroll-activation-key)        |

## API reference

- [TransformContext](/docs/components/TransformContext) — component API and props
