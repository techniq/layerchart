---
description: "The floor and walls of a WebGL chart's plot box, with lines at the scales' ticks."
category: WebGL
related: [Grid, guides/webgl]
components:
  - { name: webgl/Grid, label: Grid }
---

::tip
Part of [`@layerchart/webgl`](/docs/guides/webgl), drawn in a `WebGL` layer. See the [WebGL guide](/docs/guides/webgl) to get started.
::

## Usage

The floor and the two walls behind the plot, with lines at the scales' ticks. The walls move to the far sides as the view turns.

```svelte
<WebGL>
	<Grid />
	<Points />
</WebGL>
```

:example{ component="webgl/Points" name="scatter-3d" }

Set `x`, `y`, or `z` to `false` to leave out a direction's lines (ex. `<Grid z={false} />`).

:example{ component="webgl/Bin" name="hexbin" }
