---
description: 'Labels in a WebGL chart: drawn over the scene facing the camera, or lying face up on the surface beneath them.'
category: WebGL
related: [Text, guides/webgl]
components:
  - { name: webgl/Text, label: Text }
---

::tip
Part of [`@layerchart/webgl`](/docs/guides/webgl), drawn in a `WebGL` layer. See the [WebGL guide](/docs/guides/webgl) to get started.
::

## Usage

A label at a point (`x` / `y` in pixels, `z` above the floor). By default it's drawn over the scene, upright and crisp however the view turns, styled with `class`. With `facing="up"` it lies on the surface at its height (ex. the tops of boxes), turning and tipping with the view, in `fontSize` and `fill`.

```svelte
<Text
	data={nodes}
	x={(d) => d.x}
	y={(d) => d.y}
	z={40}
	value={(d) => d.name}
	class="text-xs font-semibold"
/>
```

:example{ component="webgl/Polygon" name="tree" }

:example{ component="webgl/Rect" name="treemap" }
