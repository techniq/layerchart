---
title: Brush (Selection)
category: state
---

LayerChart provides a brush system for interactive selection on charts. Brushing lets users drag to select a region, which can drive filtering, zooming, syncing between charts, or any custom behavior. The `BrushState` manages the selection and a `BrushContext` component handles pointer interactions.

## Quick start

Add `brush` to any `Chart` to enable a draggable selection overlay:

```svelte
<Chart {data} x="date" y="value" brush>
```

This renders a visual brush the user can drag to create, move, and resize. By default, clicking on empty space resets the selection.

## Axis

The `axis` option controls which dimension the brush operates on:

| Value    | Effect                              |
| -------- | ----------------------------------- |
| `'x'`    | Horizontal selection only (default) |
| `'y'`    | Vertical selection only             |
| `'both'` | 2D selection (width and height)     |

```svelte
<Chart {data} brush={{ axis: 'both' }}>
```

## Events

Three events fire during a brush gesture:

| Event          | When                                              |
| -------------- | ------------------------------------------------- |
| `onBrushStart` | Pointer down — gesture begins                     |
| `onChange`     | Pointer move — selection is changing              |
| `onBrushEnd`   | Pointer up — gesture finishes (or click-to-reset) |

Each event receives `{ brush: BrushState }`. Use `brush.x` and `brush.y` to read the current selection in domain units, and `brush.active` to check if a selection exists.

```svelte
<Chart
  {data}
  x="date"
  y="value"
  brush={{
    onBrushEnd: (e) => {
      console.log('Selected range:', e.brush.x);
    }
  }}
>
```

There is no separate "reset" event. When the user clicks to clear the selection, `onBrushEnd` fires with `brush.active === false` and `brush.x === [null, null]` — check for this in your handler if you need to distinguish clears from selections.

## Brush-to-zoom

A common pattern is zooming the chart to the brushed region. Call `brush.reset()` after capturing the domain to hide the selection overlay:

```svelte
<Chart
	{data}
	x="date"
	{xDomain}
	y="value"
	brush={{
		onBrushEnd: (e) => {
			xDomain = e.brush.x;
			e.brush.reset();
		}
	}}
/>
```

:example{ component="BrushContext" name="integrated-brush-(x-axis)" }

### Simplified charts

Simplified charts (`LineChart`, `AreaChart`, `BarChart`, `ScatterChart`) set `zoomOnBrush: true` by default, which handles the domain update and reset automatically:

```svelte
<LineChart {data} x="date" y="value" brush />
```

:example{ component="LineChart" name="brush" }

## Syncing charts

Pass `x` (and/or `y`) props to sync a brush to an external domain. When these props change, the brush selection updates reactively. Combined with `onChange`, this creates a two-way sync between charts:

```svelte
<Chart
	{data}
	x="date"
	y="value"
	brush={{
		x: xDomain,
		onChange: (e) => (xDomain = e.brush.x)
	}}
/>
```

This pattern powers focus+context (minimap) layouts where a small overview chart controls the visible range of a detail chart:

:example{ component="BrushContext" name="minimap" }

Multiple charts can share the same `xDomain` state to stay synchronized:

:example{ component="BrushContext" name="synced-brushes" }

## Programmatic control

Access the brush state via the chart context to control it from code. For example use localStorage to [persist the brush range/zoom](/docs/components/LineChart/persist-brush-zoom) between reloads. Below is an example of a custom UI for programmatic control.

```svelte
<Chart {data} x="date" y="value" brush>
	{#snippet children({ context })}
		<button onclick={() => context.brush.move({ x: [startDate, endDate] })}> Select Range </button>
		<button onclick={() => context.brush.selectAll()}>Select All</button>
		<button onclick={() => context.brush.reset()}>Reset</button>
	{/snippet}
</Chart>
```

:example{ component="BrushContext" name="programmatic-control" }

### Methods

| Method             | Description                        |
| ------------------ | ---------------------------------- |
| `move({ x?, y? })` | Set the selection programmatically |
| `reset()`          | Clear the selection                |
| `selectAll()`      | Select the full domain extent      |

### Properties

| Property | Type                   | Description                                              |
| -------- | ---------------------- | -------------------------------------------------------- |
| `x`      | `BrushDomainType`      | Current x selection `[min, max]` or `[null, null]`       |
| `y`      | `BrushDomainType`      | Current y selection `[min, max]` or `[null, null]`       |
| `active` | `boolean`              | Whether a selection exists                               |
| `axis`   | `'x' \| 'y' \| 'both'` | Which axes the brush operates on                         |
| `range`  | `BrushRange`           | Selection in pixel coordinates `{ x, y, width, height }` |

## Configuration

### `clickToReset`

Controls whether clicking on empty space clears the brush. Defaults to `true`. Set to `false` when you have click handlers on marks and want to prevent accidental resets:

```svelte
<Chart {data} brush={{ clickToReset: false }}>
```

### `handleSize`

Size in pixels of the invisible drag handles on the edges of the selection. Defaults to `5`:

```svelte
<Chart {data} brush={{ handleSize: 8 }}>
```

### Double-click behavior

- **Double-click on empty space** — selects the full domain (`selectAll()`)
- **Double-click on the selection** — resets the brush (`reset()`)
- **Double-click on a handle** — extends that edge to the domain boundary

## Styling

Customize the brush appearance with the `classes` prop:

```svelte
<Chart
	{data}
	brush={{
		classes: {
			range: 'bg-secondary/10',
			handle: 'bg-secondary/50'
		}
	}}
/>
```

:example{ component="BrushContext" name="simple-styling" }

:example{ component="BrushContext" name="striped-background" }

## With tooltips

Brush and tooltip interactions can coexist. The brush handles pointer events for drag gestures while tooltips respond to hover:

:example{ component="BrushContext" name="tooltip-interop" }

## With transform (pan & zoom)

Combining `brush` with `transform={{ mode: 'domain' }}` enables brush-to-zoom with subsequent pan/zoom. The brush selection zooms the chart, then the user can pan and scroll-zoom within the selection:

```svelte
<LineChart {data} x="date" y="value" brush transform={{ mode: 'domain', axis: 'x' }} />
```

:example{ component="LineChart" name="brush-pan-zoom" }

An overview chart below the main chart can act as a navigation scrollbar. The overview brush reflects the main chart's visible region and dragging it pans/zooms the main chart:

:example{ component="LineChart" name="pan-zoom-with-overview" }

## Quick reference

| Use case                | Configuration                                            | Example                                                                       |
| ----------------------- | -------------------------------------------------------- | ----------------------------------------------------------------------------- |
| Visual brush            | `brush`                                                  | [basic](/docs/components/BrushContext/basic)                                  |
| Brush-to-zoom           | `brush={{ onBrushEnd: (e) => { ... e.brush.reset() } }}` | [integrated-brush](</docs/components/BrushContext/integrated-brush-(x-axis)>) |
| Simplified chart zoom   | `brush` on LineChart/AreaChart/etc.                      | [brush](/docs/components/LineChart/brush)                                     |
| Brush on categories     | `brush` on BarChart with band scale                      | [brush-band](/docs/components/BarChart/brush-band)                            |
| Minimap (focus+context) | `brush={{ x: xDomain, onChange: ... }}`                  | [minimap](/docs/components/BrushContext/minimap)                              |
| Synced multi-chart      | Shared `xDomain` state with `x` and `onChange`           | [sync-brushes](/docs/components/BrushContext/synced-brushes)                  |
| Programmatic control    | `context.brush.move()`, `.reset()`, `.selectAll()`       | [programmatic-control](/docs/components/BrushContext/programmatic-control)    |
| Brush + pan/zoom        | `brush` + `transform={{ mode: 'domain' }}`               | [brush-pan-zoom](/docs/components/LineChart/brush-pan-zoom)                   |
| Brush + pan/zoom (band) | `brush` + `transform` on band scale                      | [brush-pan-zoom-band](/docs/components/BarChart/brush-pan-zoom-band)          |
| Overview + pan/zoom     | `brush.x` synced to main chart's `context.xDomain`       | [pan-zoom-with-overview](/docs/components/LineChart/pan-zoom-with-overview)   |
| Point selection         | `brush={{ axis: 'both', onChange: ... }}`                | [selection](/docs/components/BrushContext/selection)                          |
| Custom styling          | `brush={{ classes: { range: '...', handle: '...' } }}`   | [simple-styling](/docs/components/BrushContext/simple-styling)                |
| Disable click-to-reset  | `brush={{ clickToReset: false }}`                        |                                                                               |

## API reference

- [BrushContext](/docs/components/BrushContext) — component API and props
