---
description: Interaction component manages and displays tooltips allowing dynamic information to appear in response to user interactions.
section: interactions
layers: ['svg', 'canvas']
related: ['components/TooltipContext', 'components/Highlight']
---

<script lang="ts">
  import Example from '$lib/components/Example.svelte';
</script>

## Examples

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

- x: scaleTime, y: scaleLinear
- quadtree-x recommended. bisect-x, voronoi, and quadtree supported. bounds and band to be improved

<Example name="area" />

### Stacked Area

- x: scaleTime, y: scaleLinear (multi/stack)
- voronoi and quadtree recommended. bisect-x supported. bounds and band to be improved

<Example name="stacked-area" />

### Single Date / Time

- x: scaleTime, y: scaleBand
- bisect-x recommended. band, voronoi, and quadtree supported

<Example name="single-date-time" />

### Duration

- x: scaleTime (multi), y: scaleBand
- bisect-band or bounds recommended. band supported (when no overlap on same band). bisect supported (when no overlap on time scale). voronoi and quadtree partially supported (using first point)

<Example name="duration" />

### Multiple (overlapping) Durations

- x: scaleTime (multi), y: scaleBand
- bounds recommended. voronoi and quadtree partially supported (using first point)

<Example name="multiple-overlapping-durations" />

### Simple Bars

- x: scaleBand, y: scaleLinear
- band or bounds recommended. bisect-x supported. voronoi and quadtree partially support (using value / bar top)

<Example name="simple-bars" />

### Multiple (overlapping) Bars

- x: scaleBand, y: scaleLinear
- band or bounds recommended. bisect-x supported. voronoi and quadtree partially support (using value / bar top)

<Example name="multiple-overlapping-bars" />

### Scatter Plot

- x: scaleLinear, y: scaleLinear
- voronoi or quadtree recommended

<Example name="scatter-plot" />
