---
description: "Commonly used component which draws horizontal and vertical lines respecting scales across a chart to enhance readability and help align data points with axis values. In a WebGL layer, it lines the plot box's floor and back walls."
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
