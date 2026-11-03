---
description: 'Primitive component which draws directional arrows or spikes at data points to show magnitude and direction. In a WebGL layer, they lie on the floor.'
category: WebGL marks
related: [Vector, guides/webgl]
components:
  - { name: webgl/Vector, label: Vector }
---

::tip
Part of [`@layerchart/webgl`](/docs/guides/webgl), drawn in a `WebGL` layer. See the [WebGL guide](/docs/guides/webgl) to get started.
::

## Usage

Arrows (`shape="arrow"`), filled arrows (`'arrow-filled'`), or spikes (`'spike'`) with LayerChart's [Vector](/docs/components/Vector) props: placed at `x` / `y`, `length` long (through the chart's `r` scale), and turned `rotate` degrees clockwise from up the plot.

In a 3D view, each is a solid arrow (or cone) that can point any way: `z` places it in the box (through the chart's `z` scale), and `tilt` points it up out of the floor (`90` straight up). Flat, it lies on the floor as LayerChart draws it.

```svelte
<Vector x="x" y="y" z="z" length="magnitude" rotate="direction" tilt="tilt" />
```

:example{ name="field" }
