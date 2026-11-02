---
description: 'Marking component drawing a box per row in a WebGL chart, from pixel x, y, width, and height, z tall.'
category: WebGL marks
related: [Rect, guides/webgl]
components:
  - { name: webgl/Rect, label: Rect }
---

::tip
Part of [`@layerchart/webgl`](/docs/guides/webgl), drawn in a `WebGL` layer. See the [WebGL guide](/docs/guides/webgl) to get started.
::

## Usage

A box per row from pixel `x` / `y` / `width` / `height`, `z` tall: ex. a treemap's tiles.

```svelte
<Rect
	data={tiles}
	x={(d) => d.x0}
	y={(d) => d.y0}
	width={(d) => d.x1 - d.x0}
	height={(d) => d.y1 - d.y0}
	z={(d) => d.depth * 12}
/>
```

:example{ name="treemap" }
