---
description: 'Marking component drawing a line between two points per row in a WebGL chart, straight or arched.'
category: WebGL marks
related: [Link, guides/webgl]
components:
  - { name: webgl/Link, label: Link }
---

::tip
Part of [`@layerchart/webgl`](/docs/guides/webgl), drawn in a `WebGL` layer. See the [WebGL guide](/docs/guides/webgl) to get started.
::

## Usage

A line per row, straight or arched (`arc`), placed as LayerChart's [`Link`](/docs/components/Link) places it. `x1` / `y1` and `x2` / `y2` are its ends, as data properties or functions of the row through the chart's scales (longitude and latitude on a map), or numbers in pixels; the end defaults to the start. `z1` / `z2` raise them, through the chart's `z` scale or in pixels: ex. a pin's stem from the floor up to its head.

```svelte
<Link data={pins} x1="lon" y1="lat" z2="population" />
```

Without `x1` / `y1`, each row is a link from its `source` node to its `target`, at their `x` / `y` in pixels: ex. a hierarchy's `links()`.

:example{ name="pin-map" }
