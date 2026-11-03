---
description: 'Marking component drawing an arc in a WebGL chart, standing up by `z`: a slice of a pie, or a gauge running to its `value` over a track.'
category: WebGL marks
related: [Arc, guides/webgl]
components:
  - { name: webgl/Arc, label: Arc }
---

::tip
Part of [`@layerchart/webgl`](/docs/guides/webgl), drawn in a `WebGL` layer. See the [WebGL guide](/docs/guides/webgl) to get started.
::

## Usage

An arc with LayerChart's [Arc](/docs/components/Arc) props: from `startAngle` to `endAngle` (ex. a slice from `d3.pie()`), or to a `value` through its `domain` and `range`, over a `track`. Radii are pixels, fractions of the chart's radius, or offsets from it, as LayerChart's are, and `class` styles it as on any LayerChart mark. It's centered in the plot (where LayerChart's draws inside a centered `Layer` or `Group`); `x` / `y` move it. `z` stands it up, as on an `isometric` chart; without one it lies flat.

:example{ name="pie" }

LayerChart's concentric gauges, unchanged but for `z`:

:example{ name="concentric" }
