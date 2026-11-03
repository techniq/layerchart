---
description: 'Interaction component manages and displays tooltips allowing dynamic information to appear in response to user interactions. In a WebGL layer, it marks the hovered row with a point facing the viewer, traced on the floor and back walls.'
category: WebGL
related: [Highlight, Tooltip, guides/webgl]
components:
  - { name: webgl/Highlight, label: Highlight }
---

::tip
Part of [`@layerchart/webgl`](/docs/guides/webgl), drawn in a `WebGL` layer. See the [WebGL guide](/docs/guides/webgl) to get started.
::

## Usage

The tooltip's row (or `data`), marked as LayerChart's [Highlight](/docs/components/Highlight) marks it on an `isometric` chart, with the same props: `points` rings it with a circle facing the viewer, `lines` trace its position across the floor and, with a `z`, across and up each back wall (`axis` picks which), and `shadows` put a spot beneath it on the floor and level with it on each wall. Pass props to style each, ex. `points={{ r: 8, fill: 'none' }}`.

```svelte
<WebGL>
	<Highlight lines shadows axis="both" />
	<Points tooltip />
	<Highlight points />
</WebGL>
```

On a flat `WebGL` chart, LayerChart's own `Highlight` in an `Svg` layer over it works as well (ex. [scatter](/docs/components/webgl/Points/scatter)).

:example{ component="webgl/Points" name="scatter-3d" }
