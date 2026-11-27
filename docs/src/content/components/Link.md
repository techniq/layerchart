---
description: Marking component which draws a line or curve between two points to highlight or connect data. Supports pixel coords (`x1/y1/x2/y2`) and data-driven coords (hierarchy/sankey/force).
category: primitives
layers: [svg, canvas]
related: [Spline, Tree, Sankey, ForceSimulation, AnnotationPoint]
components:
  - { name: Link }
  - { name: webgl/Link, label: Link (WebGL) }
---

### Playground

:example{ name="playground" }

### Types

:example{ name="types" }

### Curves

:example{ name="curves" }

## WebGL

In a [`WebGL`](/docs/components/WebGL) layer, from [`@layerchart/webgl`](/docs/guides/webgl), links can rise or arch between their ends. See the [WebGL guide](/docs/guides/webgl) to get started.

A line per row, straight or arched (`arc`), placed as the core [`Link`](/docs/components/Link) places it. `x1` / `y1` and `x2` / `y2` are its ends, as data properties or functions of the row through the chart's scales (longitude and latitude on a map), or numbers in pixels; the end defaults to the start. `z1` / `z2` raise them, through the chart's `z` scale or in pixels: ex. a pin's stem from the floor up to its head.

```svelte
<Link data={pins} x1="lon" y1="lat" z2="population" />
```

Without `x1` / `y1`, each row is a link from its `source` node to its `target`, at their `x` / `y` in pixels: ex. a hierarchy's `links()`.

:example{ name="pin-map" }
