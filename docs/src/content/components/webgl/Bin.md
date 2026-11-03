---
description: 'Composite mark grouping two-dimensional points into a grid of hexagons, squares, or triangles, to count or summarize what falls in each cell. In a WebGL layer, each cell stands as tall as its z.'
category: WebGL marks
related: [Bin, GeoBin, guides/webgl]
components:
  - { name: webgl/Bin, label: Bin }
---

::tip
Part of [`@layerchart/webgl`](/docs/guides/webgl), drawn in a `WebGL` layer. See the [WebGL guide](/docs/guides/webgl) to get started.
::

## Usage

Rows grouped into hexagons (or squares, or triangles) of the plot, or of the map as projected, as LayerChart's [Bin](/docs/components/Bin) groups them. Each cell stands up `z` tall (ex. its `count`), colored by its count unless given a `fill`. Every cell is the same shape, so thousands draw as one.

```svelte
<WebGL>
	<Bin size={20} z="count" tooltip />
</WebGL>
```

:example{ name="hexbin" }

## On a map

:example{ name="walmart" }

`weight` counts each row by a value (ex. the people in a cell of gridded population), and `gap` stands the cells apart.

:example{ name="state-population" }
