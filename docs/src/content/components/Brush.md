---
description: Marking component rendering a draggable selection over part of a chart, with its own state — so a chart can carry several independent brushes.
category: interactions
layers: [svg, canvas, html]
related: [BrushContext, Chart]
---

## Usage

Drag to select, drag the middle to move the selection, drag an edge to resize it, and click to clear.

:example{name="basic" showCode}

## Brush vs. BrushContext

There are two brushes, and they answer different questions. Both drive a `BrushState`, and both drag through the same [`brushable`](#brushable) gesture — what differs is what they own.

|              | [`BrushContext`](/docs/components/BrushContext)                       | `Brush`                             |
| ------------ | --------------------------------------------------------------------- | ----------------------------------- |
| Selections   | One, spanning the plot area                                           | One each, and a chart can hold many |
| Setup        | The chart's `brush` prop, or the component                            | A mark, placed in a layer           |
| Renders      | An overlay of `div`s above the chart                                  | `Rect`s in whichever layer it's in  |
| Region       | The plot area                                                         | Wherever you place it               |
| Facets       | Drawn in every panel, keyed to the panel a drag starts in             | Unaware — one region, one selection |
| Integrations | `transform` zooming, tooltip interop                                  | None — you read the state yourself  |
| Styling      | `range` / `handle` props, a `children` snippet, `.lc-brush-*` classes | `classes` for each part             |

**Start with the chart's `brush` prop.** It covers the common case — one selection over the plot, optionally zooming the chart — and it's the one wired into `transform` and tooltips. Because it renders as an overlay rather than inside a layer, it also works the same over svg and canvas charts.

**Reach for `Brush` when one selection isn't enough**, or when the brushable region is smaller than the plot: a strip over each axis in [parallel coordinates](/docs/components/Spline#brushable-parallel-coordinates), a lane along the bottom of a chart. It's a mark, so it draws in the layer it's placed in and takes only the drags that start inside its own region — which is what lets several coexist.

They aren't interchangeable: `Brush` has no facet handling, no `transform` or tooltip interop, and doesn't render the `.lc-brush-range` / `.lc-brush-handle` structure that `BrushContext`'s styling examples build on.

For the gesture with no markup at all — on an element you render yourself — use the [`brushable`](#brushable) attachment underneath both.

## Reading the selection

`bind:state` reads back the `BrushState` the component owns:

```svelte
<script>
	let brush = $state<BrushState>();
</script>

<Brush bind:state={brush} />

{#if brush?.active}
	{brush.x[0]} – {brush.x[1]}
{/if}
```

`x` and `y` hold the selected domain values, and `active` is `false` until there's a selection. `contains(d)` tests a datum (or a point, `{ x, y }`) against it — the way to filter or style marks:

```svelte
<Circle class={brush?.contains(point.data) ? 'fill-primary' : 'fill-neutral/10'} />
```

Pass your own instance as `state={...}` instead when you need it to outlive the component. Either way, the same state can be driven from your code — `move()`, `selectAll()`, and `reset()` all update the drawn selection.

:example{name="programmatic" showCode}

`onChange` fires as the selection changes, with `phase` distinguishing `'start'`, `'brush'`, and `'end'` — use `'end'` to defer expensive work until the drag finishes.

## Axis

`axis` sets which axis the selection spans, and which handles it carries: `'x'` (the default), `'y'`, or `'both'`.

:example{name="vertical" showCode}

`axis="both"` selects a rectangle, with handles on all four edges.

:example{name="two-dimensional" showCode}

## Region

The brushable region defaults to the plot area. `x`, `y`, `width`, and `height` place it somewhere smaller — which is also what lets a chart carry several brushes, since each takes the drags that start within its own region.

:example{name="region" showCode}

[Parallel coordinates](/docs/components/Spline#brushable-parallel-coordinates) puts this to work: a `Brush` per dimension, each a narrow strip over its axis, intersected to filter the lines.

## Layers

`Brush` renders through [`Rect`](/docs/components/Rect), so it draws in whichever layer it's placed in — svg, canvas, or html. Every example above can be switched between them with the toggle at the top of the page.

A canvas layer draws its marks rather than creating an element for each, so the brush hit-tests the pointer instead of attaching listeners. The gesture is identical; what's lost is the per-part cursors (`crosshair`, `move`, the resize arrows), which are CSS on real elements — canvas keeps the layer's own cursor throughout.

The brush doesn't have to share a layer with the marks. Here it sits in an html layer of its own, above an svg one:

:example{name="html" showCode}

## Styling

`classes` targets each part — `root` (the brushable region), `selection`, and `handle`:

```svelte
<Brush classes={{ selection: 'fill-primary/15 stroke-primary/50' }} />
```

`handleSize` (default `8`) sets how wide the resize handles are, in pixels. They straddle each edge of the selection, and are transparent by default — give them a `fill` to show them.

## `brushable`

The gesture on its own, as an [attachment](https://svelte.dev/docs/svelte/@attach) — for when you want the behaviour without any markup from LayerChart:

```svelte
<script>
	import { brushable, BrushState } from 'layerchart';

	let brush = new BrushState(context, { axis: 'y' });
</script>

<rect width={24} height={context.height} {@attach brushable({ state: brush })} />
```

The element's box is the brushable region, and where a drag starts decides what it does — an edge resizes, the middle moves, anywhere else starts a new selection. Options: `state`, `axis`, `mode` (force one behaviour, for an element that _is_ one part of the brush), `bounds`, `origin`, `edgeSize`, `clearThreshold`, and `onChange`.

`brushGesture` is the same gesture as a `pointerdown` handler, for canvas layers and anywhere else without an element to attach to.
