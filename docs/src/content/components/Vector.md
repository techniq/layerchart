---
description: Primitive component which draws directional arrows or spikes at data points to show magnitude and direction.
category: primitives
layers: [svg, canvas]
related: [Line, Circle, GeoPath]
components:
  - { name: Vector }
  - { name: webgl/Vector, label: Vector (WebGL) }
---

## Usage

### Basic

Place vectors at specific pixel positions with configurable rotation and length.

:example{ name="basic" showCode }

### Anchor

Control where the position point sits relative to the vector: `"start"` (base), `"middle"` (center, default for arrow), or `"end"` (tip).

:example{ name="anchor" showCode }

### Shapes

Compare built-in shapes (`arrow`, `spike`) with proportional and fixed sizing, plus custom shapes via the `children` snippet. When `width` is not set, it scales proportionally with length.

:example{ name="shapes" showCode }

### Data mode

Pass string property names to `x`, `y`, `length`, and `rotate` to drive vectors from data. Length is resolved through `rScale`.

:example{ name="data-mode" showCode }

### Wind map

A geographic wind map showing wind speed and direction over Western Europe using real meteorological data.

:example{ name="wind-map" showCode }

### Election wind map

A geographic wind map showing 2020 US presidential election results by county. Blue spikes lean left for Democratic wins, red spikes lean right for Republican wins, with length proportional to vote margin.

:example{ name="election-wind-map" showCode }

## WebGL

In a [`WebGL`](/docs/components/WebGL) layer, from [`@layerchart/webgl`](/docs/guides/webgl), they lie on the floor. See the [WebGL guide](/docs/guides/webgl) to get started.

Arrows (`shape="arrow"`), filled arrows (`'arrow-filled'`), or spikes (`'spike'`) with the core [Vector](/docs/components/Vector) props: placed at `x` / `y`, `length` long (through the chart's `r` scale), and turned `rotate` degrees clockwise from up the plot.

In a 3D view, each is a solid arrow (or cone) that can point any way: `z` places it in the box (through the chart's `z` scale), and `tilt` points it up out of the floor (`90` straight up). Flat, it lies on the floor as core draws it.

```svelte
<Vector x="x" y="y" z="z" length="magnitude" rotate="direction" tilt="tilt" />
```

:example{ name="field" }
