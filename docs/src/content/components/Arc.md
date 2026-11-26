---
description: Primitive component which draws a curved segment on a chart to represent portions of a whole or highlight specific data ranges.
category: primitives
layers: [svg, canvas]
related: [Pie, ArcChart, PieChart]
components:
  - { name: Arc }
  - { name: webgl/Arc, label: Arc (WebGL) }
---

::tip
See also: [ArcChart](/docs/components/ArcChart) and [PieChart](/docs/components/PieChart) for simplified examples
::

## Usage

:example{ name="partial-arc" showCode }

### Text along path

`Arc` can be used with the `children` snippet, `getArcTextProps`, and `Text` to write text along the `inner`, `outer`, or `middle` of the arc path.

The text will smartly orientate based on the direction (clockwise / counter-clockwise) and location (top, bottom, left, right) of the arc

:example{ name="label-direction" }

### Playground

:example{ name="playground" }

## WebGL

In a [`WebGL`](/docs/components/WebGL) layer, from [`@layerchart/webgl`](/docs/guides/webgl), it stands up by its z. See the [WebGL guide](/docs/guides/webgl) to get started.

An arc with the core [Arc](/docs/components/Arc) props: from `startAngle` to `endAngle` (ex. a slice from `d3.pie()`), or to a `value` through its `domain` and `range`, over a `track`. Radii are pixels, fractions of the chart's radius, or offsets from it, as the core are, and `class` styles it as on any core mark. It's centered in the plot (where the core draws inside a centered `Layer` or `Group`); `x` / `y` move it. `z` stands it up, as on an `isometric` chart; without one it lies flat.

:example{ name="pie" }

The core [concentric gauges](/docs/components/Arc/concentric) example, unchanged but for `z`:

:example{ name="concentric-3d" }
