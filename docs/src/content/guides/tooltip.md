---
title: Tooltip (Hover Data)
category: state
---

LayerChart provides a tooltip system for showing data on hover. It has two parts: a `TooltipContext` (integrated into `<Chart tooltip={...}>`) that manages which data point the user is hovering, and `Tooltip` display components (`Tooltip.Root`, `Tooltip.Header`, `Tooltip.List`, `Tooltip.Item`) that render the visual tooltip. The context handles all the pointer tracking and data lookup; the display components are just HTML you can style and compose freely.

## Quick start

Add `tooltipContext` to a `Chart` and render `Tooltip.Root` inside it:

```svelte
<Chart {data} x="date" y="value" tooltipContext={{ mode: 'bisect-x' }}>
	<Layer>
		<Area />
		<Highlight points lines />
	</Layer>
	<Tooltip.Root>
		{#snippet children({ data })}
			<Tooltip.Header value={data.date} format="day" />
			<Tooltip.List>
				<Tooltip.Item label="value" value={data.value} />
			</Tooltip.List>
		{/snippet}
	</Tooltip.Root>
</Chart>
```

The `Highlight` component draws visual indicators (crosshair lines, points) at the hovered data location. It reads from the same tooltip state automatically.

:example{ component="Tooltip" name="basic" }

Simplified charts (`LineChart`, `AreaChart`, `BarChart`, `ScatterChart`) include a default tooltip automatically when you pass `tooltipContext`:

```svelte
<LineChart {data} x="date" y="value" tooltipContext={{ mode: 'bisect-x' }} />
```

## Modes

The `mode` prop on `tooltipContext` controls how the nearest data point is found. Different chart types work best with different modes:

| Mode          | How it works                                           | Best for                                        |
| ------------- | ------------------------------------------------------ | ----------------------------------------------- |
| `bisect-x`    | Binary search along x-axis (requires sorted data)      | Time series, line/area charts                   |
| `bisect-y`    | Binary search along y-axis (requires sorted data)      | Horizontal charts                               |
| `band`        | Full-bandwidth hit targets using transparent paths     | Bar charts, categorical axes                    |
| `bisect-band` | Bisect + band combined                                 | Bar charts with sorted time axis                |
| `bounds`      | Hit detection based on data element bounds             | Duration bars, overlapping ranges               |
| `voronoi`     | Geometric partitioning via Voronoi diagram             | Scatter plots, irregular point layouts          |
| `quadtree`    | Spatial index (faster than voronoi for large datasets) | Scatter plots, geographic points                |
| `quadtree-x`  | Quadtree constrained to x-axis                         | Time series (like bisect-x but spatial)         |
| `quadtree-y`  | Quadtree constrained to y-axis                         | Horizontal charts                               |
| `manual`      | You call `tooltip.show(e, data)` / `tooltip.hide()`    | Geo boundaries, pie/donut slices, custom shapes |

### Choosing a mode

- **Line / area charts** — use `bisect-x` or `quadtree-x`. Both find the closest point along the x-axis. `bisect-x` is simpler; `quadtree-x` works with unsorted data.
- **Bar charts** — use `band` or `bisect-band`. These create full-width hit targets so the user doesn't need to hover precisely on the bar.
- **Scatter plots** — use `voronoi` or `quadtree`. Both find the nearest point in 2D space. `quadtree` is faster for large datasets.
- **Geographic / radial charts** — use `manual` and trigger from `onpointerenter` / `onpointerleave` on your shapes.

### `bisect-x` direction

By default, `bisect-x` finds the closest data point. You can change this with `findTooltipData`:

```svelte
<Chart tooltipContext={{ mode: 'bisect-x', findTooltipData: 'left' }}>
```

| Value       | Behavior                        |
| ----------- | ------------------------------- |
| `'closest'` | Nearest point (default)         |
| `'left'`    | Nearest point to the left only  |
| `'right'`   | Nearest point to the right only |

### Radius limit

For `voronoi` and `quadtree` modes, set `radius` to limit the search distance in pixels. Points farther than this distance won't trigger the tooltip:

```svelte
<Chart tooltipContext={{ mode: 'quadtree', radius: 50 }}>
```

## Positioning

`Tooltip.Root` controls where the tooltip appears relative to the hovered data. The `x` and `y` props set the positioning strategy independently per axis:

| Value       | Behavior                                   |
| ----------- | ------------------------------------------ |
| `'pointer'` | Follows the mouse cursor (default)         |
| `'data'`    | Snaps to the hovered data point's position |
| `number`    | Fixed position in pixels                   |

### Pointer following (default)

The tooltip follows the mouse with a small offset to avoid overlapping the cursor:

```svelte
<Tooltip.Root>
```

:example{ component="Tooltip" name="default-mouse-position-with-offset" }

### Data snapping

Snap the tooltip to the data point's chart position. Useful when you want the tooltip anchored to the mark:

```svelte
<Tooltip.Root x="data" y="data" xOffset={8} yOffset={8}>
```

:example{ component="Tooltip" name="data-snapping" }

### Mixed positioning

You can mix strategies per axis. For example, snap horizontally to the data but follow the pointer vertically:

```svelte
<Tooltip.Root x="data" y="pointer">
```

Or fix the tooltip to the top of the chart while tracking horizontally:

```svelte
<Tooltip.Root x="data" y={0}>
```

### Multiple tooltips

You can render multiple `Tooltip.Root` instances. This is useful for placing a tooltip in each axis area:

:example{ component="Tooltip" name="multiple-tooltips-with-fixed-single-axis" }

:example{ component="Tooltip" name="multiple-tooltips-with-fixed-single-axis-scaleband" }

### Offsets

`xOffset` and `yOffset` add space between the tooltip and its anchor position. They default to `10` for pointer mode and `0` for data mode:

```svelte
<Tooltip.Root xOffset={16} yOffset={16}>
```

### Anchor placement

The `anchor` prop controls which corner of the tooltip aligns to the position point. It accepts placement values like `'top-left'` (default), `'bottom-right'`, `'top'`, `'right'`, etc:

```svelte
<Tooltip.Root anchor="bottom-right">
```

:example{ component="Tooltip" name="anchor-location" }

### Portal

By default, `Tooltip.Root` is portaled outside the chart DOM to `document.body` (or a `.PortalTarget` element if one exists). This prevents the tooltip from being clipped by ancestors with `overflow: hidden`.

| Value                         | Behavior                                               |
| ----------------------------- | ------------------------------------------------------ |
| `true`                        | Portal to `.PortalTarget` or `document.body` (default) |
| `false`                       | Render inline within the chart (original behavior)     |
| `{ target: '.my-container' }` | Portal to a specific CSS selector                      |
| `{ target: element }`         | Portal to a specific DOM element                       |
| `{ enabled: false }`          | Same as `false`                                        |

```svelte
<!-- Default: portaled to body -->
<Tooltip.Root>

<!-- Disable portal (inline positioning) -->
<Tooltip.Root portal={false}>

<!-- Portal to a custom target -->
<Tooltip.Root portal={{ target: '.my-tooltip-container' }}>
```

Toggle `portal` off to see the tooltip clipped by the `overflow: hidden` container:

:example{ component="Tooltip" name="portal-overflow" }

### Containment

Tooltips are contained within their chart container by default, flipping sides when they would overflow. The `contained` prop controls this:

| Value         | Behavior                                  |
| ------------- | ----------------------------------------- |
| `'container'` | Stay within the chart container (default) |
| `'window'`    | Stay within the browser viewport          |
| `false`       | No containment — can overflow freely      |

```svelte
<Tooltip.Root contained="window">
```

## Display components

The tooltip content is built from composable sub-components:

### `Tooltip.Header`

Shows a prominent value, typically the x-axis label (date, category):

```svelte
<Tooltip.Header value={data.date} format="day" />
```

The `format` prop accepts format types like `'day'`, `'month'`, `'integer'`, `'decimal'`, `'currency'`, etc. Add a `color` prop to show a color dot.

### `Tooltip.List`

A grid container that aligns label-value pairs:

```svelte
<Tooltip.List>
	<Tooltip.Item label="Revenue" value={data.revenue} format="currency" />
	<Tooltip.Item label="Users" value={data.users} format="integer" />
</Tooltip.List>
```

### `Tooltip.Item`

A single label-value row. The `color` prop shows a color indicator:

```svelte
<Tooltip.Item label="Apples" value={data.apples} color="red" />
```

| Prop         | Type                            | Description               |
| ------------ | ------------------------------- | ------------------------- |
| `label`      | `string \| number \| Snippet`   | Left-side label           |
| `value`      | `any`                           | Right-side value          |
| `format`     | `FormatType \| FormatConfig`    | Value formatting          |
| `valueAlign` | `'left' \| 'right' \| 'center'` | Alignment of value column |
| `color`      | `string`                        | Color dot indicator       |

### `Tooltip.Separator`

A visual divider between groups of items:

```svelte
<Tooltip.List>
	<Tooltip.Item label="Revenue" value={data.revenue} />
	<Tooltip.Separator />
	<Tooltip.Item label="Total" value={data.total} />
</Tooltip.List>
```

### Custom content

Since tooltips are just HTML, you can render anything inside `Tooltip.Root`:

:example{ component="Tooltip" name="custom-content" }

## Variants

The `variant` prop controls the tooltip's visual style:

| Value       | Appearance                            |
| ----------- | ------------------------------------- |
| `'default'` | Dark background, light text (default) |
| `'invert'`  | Light background, dark text           |
| `'none'`    | No built-in styling — fully custom    |

:example{ component="Tooltip" name="invert-variant" }

## Motion

Tooltip position changes are animated with a spring by default. Control this with the `motion` prop:

```svelte
<!-- Spring (default) -->
<Tooltip.Root motion="spring">

<!-- Tween -->
<Tooltip.Root motion={{ type: 'tween', duration: 200 }}>

<!-- Disable animation -->
<Tooltip.Root motion={false}>
```

:example{ component="Tooltip" name="disable-motion" }

## Color indicators

Show color swatches in tooltip items to match series colors:

:example{ component="Tooltip" name="color-swatch" }

Using theme colors:

:example{ component="Tooltip" name="color-swatch-using-theme" }

## With series

When using multi-series charts, the tooltip state includes a `series` array with the value for each series at the hovered point. Simplified charts render this automatically:

```svelte
<LineChart
	{data}
	x="date"
	series={[
		{ key: 'apples', color: 'red' },
		{ key: 'bananas', color: 'yellow' }
	]}
	tooltipContext={{ mode: 'bisect-x' }}
/>
```

For custom tooltips with series data, iterate over the series in your snippet:

```svelte
<Tooltip.Root>
	{#snippet children({ data, series })}
		<Tooltip.Header value={data.date} format="day" />
		<Tooltip.List>
			{#each series as s}
				<Tooltip.Item label={s.label} value={s.value} color={s.color} />
			{/each}
		</Tooltip.List>
	{/snippet}
</Tooltip.Root>
```

:example{ component="Tooltip" name="stacked-area" }

## Tooltip locking

Set `locked` to keep the tooltip open and prevent it from updating when the pointer moves. This is useful for interactive tooltips with clickable content:

```svelte
<Chart tooltipContext={{ mode: 'bisect-x', locked: true }}>
	<Tooltip.Root pointerEvents>
		{#snippet children({ data })}
			<a href="/detail/{data.id}">View details</a>
		{/snippet}
	</Tooltip.Root>
</Chart>
```

Enable `pointerEvents` on `Tooltip.Root` so the tooltip content can receive clicks and hovers (disabled by default to avoid interfering with chart interactions).

## Delayed hiding

Set `hideDelay` (in milliseconds) to keep the tooltip visible briefly after the pointer leaves. This gives users time to move their cursor to the tooltip content:

```svelte
<Chart tooltipContext={{ mode: 'bisect-x', hideDelay: 300 }}>
```

## Touch events

The `touchEvents` prop controls how touch interactions behave on mobile. It maps to the CSS `touch-action` property:

| Value     | Behavior                                                       |
| --------- | -------------------------------------------------------------- |
| `'pan-y'` | Vertical scrolling allowed, horizontal shows tooltip (default) |
| `'pan-x'` | Horizontal scrolling allowed                                   |
| `'none'`  | All touch triggers tooltip (may block scrolling)               |
| `'auto'`  | Browser default touch behavior                                 |

## Externally accessing tooltip data

Use `bind:context` on `Chart` to read tooltip state from outside:

```svelte
<script>
	let context = $state();
</script>

{#if context?.tooltip.data}
	<p>Hovering: {context.tooltip.data.date}</p>
{/if}

<Chart bind:context {data} x="date" y="value" tooltipContext={{ mode: 'bisect-x' }}>...</Chart>
```

:example{ component="Tooltip" name="externally-access-tooltip-data" }

You can also access tooltip state inside snippet props:

```svelte
<Chart {data} tooltipContext={{ mode: 'bisect-x' }}>
	{#snippet children({ context })}
		{#if context.tooltip.data}
			<text>{context.tooltip.data.value}</text>
		{/if}
	{/snippet}
</Chart>
```

## Manual mode

For shapes that don't map neatly to x/y coordinates (geo boundaries, pie slices, custom SVG), use `manual` mode and call `show`/`hide` yourself:

```svelte
<Chart tooltipContext={{ mode: 'manual' }}>
	{#snippet children({ context })}
		<GeoPath
			geojson={feature}
			onpointerenter={(e) => context.tooltip.show(e, feature.properties)}
			onpointerleave={(e) => context.tooltip.hide(e)}
		/>
	{/snippet}
	<Tooltip.Root>
		{#snippet children({ data })}
			<Tooltip.Header value={data.name} />
		{/snippet}
	</Tooltip.Root>
</Chart>
```

### Built-in `tooltip` prop

Several shape components have a built-in `tooltip` boolean prop that wires up `show`/`hide` automatically, so you don't need to write pointer handlers yourself. Pass the associated `data` prop to set what data the tooltip receives:

```svelte
<Chart tooltipContext={{ mode: 'manual' }}>
	<Pie {data} tooltip />
	<Tooltip.Root>
		{#snippet children({ data })}
			<Tooltip.Header value={data.name} />
			<Tooltip.List>
				<Tooltip.Item label="value" value={data.value} />
			</Tooltip.List>
		{/snippet}
	</Tooltip.Root>
</Chart>
```

Components with the `tooltip` prop:

| Component  | Typical use case                                |
| ---------- | ----------------------------------------------- |
| `Arc`      | Gauge / donut segments                          |
| `Bar`      | Individual bars in custom layouts               |
| `Pie`      | Pie chart slices (sets `tooltip` on each `Arc`) |
| `GeoPath`  | Map regions / geographic boundaries             |
| `Ribbon`   | Chord diagram ribbons                           |
| `Calendar` | Calendar heatmap cells                          |

## Debug mode

Enable `debug` to visualize the hit targets for the current mode. This renders the voronoi cells, quadtree regions, band paths, or bounding boxes so you can see exactly what area triggers each data point:

```svelte
<Chart tooltipContext={{ mode: 'voronoi', debug: true }}>
```

## Raise target

Set `raiseTarget` to bring the hovered element to the front of the SVG rendering order. Useful when marks overlap and you want the hovered one on top:

```svelte
<Chart tooltipContext={{ mode: 'voronoi', raiseTarget: true }}>
```

## Click handling

Add an `onclick` handler to `tooltipContext` to respond to clicks on data points:

```svelte
<Chart
  tooltipContext={{
    mode: 'quadtree',
    onclick: (e, { data }) => {
      console.log('Clicked:', data);
    }
  }}
>
```

## TooltipState properties

| Property                   | Type              | Description                                    |
| -------------------------- | ----------------- | ---------------------------------------------- |
| `data`                     | `T \| null`       | The hovered data point (or null)               |
| `x`                        | `number`          | Pointer x position in chart coordinates        |
| `y`                        | `number`          | Pointer y position in chart coordinates        |
| `series`                   | `TooltipSeries[]` | Series values at the hovered point             |
| `isHoveringTooltipArea`    | `boolean`         | Whether the pointer is in the tooltip area     |
| `isHoveringTooltipContent` | `boolean`         | Whether the pointer is over the tooltip itself |

### Methods

| Method              | Description                                |
| ------------------- | ------------------------------------------ |
| `show(event, data)` | Show tooltip with given data (manual mode) |
| `hide(event?)`      | Hide the tooltip                           |

## Quick reference

| Use case              | Configuration                                             | Example                                                                                           |
| --------------------- | --------------------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| Basic tooltip         | `tooltipContext={{ mode: 'bisect-x' }}`                   | [basic](/docs/components/Tooltip/basic)                                                           |
| Pointer following     | `<Tooltip.Root>` (default)                                | [default-mouse-position-with-offset](/docs/components/Tooltip/default-mouse-position-with-offset) |
| Data snapping         | `<Tooltip.Root x="data" y="data">`                        | [data-snapping](/docs/components/Tooltip/data-snapping)                                           |
| Multiple tooltips     | Multiple `<Tooltip.Root>` with fixed axes                 | [multiple-tooltips](/docs/components/Tooltip/multiple-tooltips-with-fixed-single-axis)            |
| Scatter plot          | `tooltipContext={{ mode: 'quadtree' }}`                   | [scatter-plot](/docs/components/Tooltip/scatter-plot)                                             |
| Stacked area          | Series + `tooltipContext={{ mode: 'bisect-x' }}`          | [stacked-area](/docs/components/Tooltip/stacked-area)                                             |
| Custom content        | Any HTML inside `Tooltip.Root`                            | [custom-content](/docs/components/Tooltip/custom-content)                                         |
| Invert variant        | `<Tooltip.Root variant="invert">`                         | [invert-variant](/docs/components/Tooltip/invert-variant)                                         |
| Color swatches        | `<Tooltip.Item color="...">`                              | [color-swatch](/docs/components/Tooltip/color-swatch)                                             |
| External data access  | `bind:context` on `Chart`                                 | [externally-access-tooltip-data](/docs/components/Tooltip/externally-access-tooltip-data)         |
| Anchor placement      | `<Tooltip.Root anchor="bottom-right">`                    | [anchor-location](/docs/components/Tooltip/anchor-location)                                       |
| Disable animation     | `<Tooltip.Root motion={false}>`                           | [disable-motion](/docs/components/Tooltip/disable-motion)                                         |
| Bar chart tooltip     | `tooltipContext={{ mode: 'band' }}`                       | [simple-bars](/docs/components/Tooltip/simple-bars)                                               |
| Manual mode (geo/pie) | `tooltipContext={{ mode: 'manual' }}` + `show()`/`hide()` |                                                                                                   |

## API reference

- [Tooltip](/docs/components/Tooltip) — display component API and props (`Tooltip.Root`, `Tooltip.Header`, `Tooltip.List`, `Tooltip.Item`, `Tooltip.Separator`)
- [TooltipContext](/docs/components/TooltipContext) — interaction component API and props
- [Highlight](/docs/components/Highlight) — visual highlight indicators
