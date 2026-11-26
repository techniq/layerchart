---
description: Marking component which plots individual data points on a graph to show distribution, relationships, or clusters without connecting lines.
category: marks
layers: [svg, canvas, html]
related: [ScatterChart]
components:
  - { name: Points }
  - { name: webgl/Points, label: Points (WebGL) }
---

::tip
See also: [ScatterChart](/docs/components/ScatterChart) for simplified examples
::

## Usage

:example{ name="basic" showCode }

### Color

To change the color you can use two main approaches: discrete color settings (`fill`, `class`) or value-based color scales.

#### Discrete

Color can be set for all points using the `fill` and `stroke` props...

:example{ name="color-via-fill" showCode }

...or using `class` to set fill and stroke via CSS.

:example{ name="color-via-class" showCode }

#### Value

To color points based on each point's value, you can use the color scale.

For example, to color based on thresholds (e.g. red: <50, yellow: 50-90, green: >90)

:example{ name="color-via-threshold-scale" showCode }

You can also color points based the comparison of two values in your data.

:example{ name="color-via-ordinal-scale" showCode }

## WebGL

In a [`WebGL`](/docs/components/WebGL) layer, from [`@layerchart/webgl`](/docs/guides/webgl), each point is a sphere (a disc when flat), and can glow or wear an image. See the [WebGL guide](/docs/guides/webgl) to get started.

A sphere per row, at its `x`, `y`, and `z`. `r` sets the radius in pixels, else the chart's `r` scale.

```svelte
<Chart {data} x="x" y="y" z="z" view={perspective}>
	<WebGL>
		<Points r={6} tooltip />
	</WebGL>
</Chart>
```

:example{ name="scatter-3d" }

### Glow and images

`glow` draws each sphere in its own color whatever the lights (ex. a star), and `image` wraps each in an equirectangular image (ex. a planet), turned by `rotate` and leaning by `tilt`.

:example{ name="solar-system" }

Tens of thousands of glowing points, placed along spiral arms and colored from the middle out, turning slowly (drag to look from another angle).

:example{ name="galaxy" }

### Flat

Without a view, points are discs, for many thousands of them.

:example{ name="scatter" }

The grid, axes, and highlight can be core's own `Svg` layers instead, with only the points in WebGL:

:example{ name="scatter-with-svg" }
