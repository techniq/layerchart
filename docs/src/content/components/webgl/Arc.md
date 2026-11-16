---
description: 'Primitive component which draws a curved segment on a chart to represent portions of a whole or highlight specific data ranges. In a WebGL layer, it stands up by its z.'
category: WebGL marks
related: [Arc, guides/webgl]
components:
  - { name: webgl/Arc, label: Arc }
---

::tip
Part of [`@layerchart/webgl`](/docs/guides/webgl), drawn in a `WebGL` layer. See the [WebGL guide](/docs/guides/webgl) to get started.
::

## Usage

An arc with the core [Arc](/docs/components/Arc) props: from `startAngle` to `endAngle` (ex. a slice from `d3.pie()`), or to a `value` through its `domain` and `range`, over a `track`. Radii are pixels, fractions of the chart's radius, or offsets from it, as the core are, and `class` styles it as on any core mark. It's centered in the plot (where the core draws inside a centered `Layer` or `Group`); `x` / `y` move it. `z` stands it up, as on an `isometric` chart; without one it lies flat.

:example{ name="pie" }

The core [concentric gauges](/docs/components/Arc/concentric) example, unchanged but for `z`:

:example{ name="concentric" }
