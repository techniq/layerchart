---
description: Interaction component manages and displays tooltips allowing dynamic information to appear in response to user interactions.
section: interactions
layers: [svg, canvas]
related: [TooltipContext, Highlight]
---

<script lang="ts">
  import Example from '$lib/components/Example.svelte';
</script>

Tooltips have 2 parts, the `TooltipContext` (which is integrated into `<Chart tooltip={...})>`
and used for data selection and state management, `Tooltip` components (`Tooltip.Root`, `Tooltip.Header`, `Tooltip.List`, and `Tooltip.Item`) which are used for visual display.

# Features

- HTML first
- Can be interactive (clickable / hover)
- Smart placement (contained in container, window, etc)
- Multiple instances supported
- Different modes (bisect, band, voronoi, path/shape, quadtree, hit canvas)

## Modes

There are multiple tooltip modes for different situations, which can be controlled by passing `<Chart tooltip={{ mode: '...' }}>`.

## `bisect-x` | `bisect-y`

Finds the closest data point along a give axis based on your pointer position.

### `band`

Uses transparent `<path>` to enable full-bandwidth hit targets (i.e not just the bar itself). This is especially useful for very small values (short bars) and consistent scrubbing across the data.

### `voronoi`

Path based, easier to reason about than quadtree. Supports max `radius`

### `quadtree`

In memory and typically faster than `voronoi`. Supports max `radius`

Useful for point-based visualizations such as geographic points and scatter plots

### `manual`

Useful for shape based triggering such as on geo boundaries and radial charts with arc slices (ex. pie chart).

You can call `tooltip.show(e, DATA)` and `tooltip.hide()` recommended within `onpointerenter`, `onpointermove`, and `onpointerleave`

Canvas layers leverage an integrated "hit canvas" which enables the same shape-based triggering as you are accustomed with Svg.

## Location

Tooltips can be positions based on

- Pointer position
- Data location
- Fixed
  Each of these are set on a per-axis bases, allowing:
- Tooltip following pointer on both axis (i.e. stays next to pointer)
- Tooltip "snaps" to each data point as the pointer moves
- Tooltip stays within the axis/padding but trackings the pointer left/right (a axis) or up/down (y axis)
- Fixed tooltip location (ex. top left) regardless of pointer or data

```html
<Tooltip.Root x={"pointer"|"data"|number} y={"pointer"|"data"|number}>
```

Offsets are available (`xOffset`, `yOffset`) to not overlap data (or provide more space for course pointer devices such as a finger).

You can render any number of `Tooltip` instances, which can be useful to have one in each axis area

Tooltips can be contained within the chart container, window/viewport, or none. When contained, the tooltip will "swap sides" instead of moving outside the container.

```html
<Tooltip.Root contained={"container"|"window"|"none"}>
```

Tooltip locking

Delayed closing

Anchor placement

Externally access tooltip data

```html
<Chart bind:tooltipContext></Chart>
```

<!-- ## Examples

### Basic

<Example name="basic" />

### Custom content

<Example name="custom-content" />

### Color swatch

<Example name="color-swatch" />

### Color swatch using theme

<Example name="color-swatch-using-theme" />

### Invert variant

<Example name="invert-variant" />

### Position

#### Default (mouse position with offset)

<Example name="default-mouse-position-with-offset" />

#### Data Snapping

<Example name="data-snapping" />

#### Multiple Tooltips with Fixed Single Axis

<Example name="multiple-tooltips-with-fixed-single-axis" />

#### Multiple Tooltips with Fixed Single Axis (scaleBand)

<Example name="multiple-tooltips-with-fixed-single-axis-scaleband" />

### Disable motion

<Example name="disable-motion" />

### Anchor location

<Example name="anchor-location" />

### Externally access tooltip data

<Example name="externally-access-tooltip-data" />

## Chart Types

### Area

> x: scaleTime, y: scaleLinear

> quadtree-x recommended. bisect-x, voronoi, and quadtree supported. bounds and band to be improved

<Example name="area" />

### Stacked Area

> x: scaleTime, y: scaleLinear (multi/stack)

> voronoi and quadtree recommended. bisect-x supported. bounds and band to be improved

<Example name="stacked-area" />

### Single Date / Time

> x: scaleTime, y: scaleBand

> bisect-x recommended. band, voronoi, and quadtree supported

<Example name="single-date-time" />

### Duration

> x: scaleTime (multi), y: scaleBand

> bisect-band or bounds recommended. band supported (when no overlap on same band). bisect supported (when no overlap on time scale). voronoi and quadtree partially supported (using first point)

<Example name="duration" />

### Multiple (overlapping) Durations

> x: scaleTime (multi), y: scaleBand

> bounds recommended. voronoi and quadtree partially supported (using first point)

<Example name="multiple-overlapping-durations" />

### Simple Bars

> x: scaleTime, y: scaleLinear

> band or bounds recommended. bisect-x supported. voronoi and quadtree partially support (using value / bar top)

<Example name="simple-bars" />

### Multiple (overlapping) Bars

> x: scaleTime, y: scaleLinear

> band or bounds recommended. bisect-x supported. voronoi and quadtree partially support (using value / bar top)

<Example name="multiple-overlapping-bars" />

### Scatter Plot

> x: scaleLinear, y: scaleLinear

> voronoi or quadtree recommended

<Example name="scatter-plot" /> -->
