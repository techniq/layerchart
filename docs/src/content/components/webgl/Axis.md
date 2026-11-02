---
description: "Tick labels along an edge of a WebGL chart's plot box: bottom for x, left for y, back for z."
category: WebGL
related: [Axis, guides/webgl]
components:
  - { name: webgl/Axis, label: Axis }
---

::tip
Part of [`@layerchart/webgl`](/docs/guides/webgl), drawn in a `WebGL` layer. See the [WebGL guide](/docs/guides/webgl) to get started.
::

## Usage

Tick labels along an edge: `bottom` for `x`, `left` for `y`, and `back` for `z` (up the corner behind the plot). Labels are drawn over the scene, upright and crisp however the view turns, and keep to the edges in front.

```svelte
<WebGL>
	<Axis placement="bottom" label="x" />
	<Axis placement="left" label="y" />
	<Axis placement="back" label="z" />
	<Points />
</WebGL>
```

:example{ component="webgl/Points" name="scatter" }

:example{ component="webgl/Spline" name="temperatures" }
