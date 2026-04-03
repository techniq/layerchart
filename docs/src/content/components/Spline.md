---
description: Marking component which applies data points connected by smooth, curved lines to show trends or patterns over a continuous range.
category: marks
layers: [svg, canvas]
related: [Path, Trail, LineChart]
---

::tip
See also: [LineChart](/docs/components/LineChart) for simplified examples
::

## Usage

:example{ name="basic" showCode }

### Per-segment styling

Pass a function to `stroke`, `fill`, or `opacity` to style each segment independently. Consecutive data points with the same resolved value are grouped into separate path segments.

:example{ name="stroke-grouping" showCode }

### Geo mode

When inside a `GeoProjection` context, Spline automatically renders as a projected geographic path. The `x` and `y` accessors extract longitude/latitude from each data point, which are converted to a GeoJSON `LineString` and rendered via `geoPath(projection)` — providing geodesic interpolation (great circle arcs) and proper antimeridian wrapping.

:example{ name="geo-routes" showCode }

### Playground

:example{ name="playground" }

<!-- ## Playground

:example{ name="playground" }

## Examples

### draw

:example{ name="draw" }

### tweened

:example{ name="tweened" }

### markers / arrows

:example{ name="markers-arrows" }

### basic start and end snippets

:example{ name="basic-start-and-end-snippets" }

### label using start/end snippets

:example{ name="label-using-start-end-snippets" }

### end snippet with draw

:example{ name="end-snippet-with-draw" }

### end slot with draw with value

:example{ name="end-slot-with-draw-with-value" }

- Because the draw transition and tweened store use different timers, there is no guarantee they will start at the same time -->
