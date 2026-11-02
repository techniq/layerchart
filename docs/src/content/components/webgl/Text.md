---
description: 'Labels in a WebGL chart: lying on the surface beneath them, or facing the viewer over the scene.'
category: WebGL
related: [Text, guides/webgl]
components:
  - { name: webgl/Text, label: Text }
---

::tip
Part of [`@layerchart/webgl`](/docs/guides/webgl), drawn in a `WebGL` layer. See the [WebGL guide](/docs/guides/webgl) to get started.
::

## Usage

A label per row, placed as LayerChart's [`Text`](/docs/components/Text) places it: `x`, `y`, and `z` are data properties or functions of the row, through the chart's scales (longitude and latitude on a map), or numbers in pixels. `value` is a property, a function, or the text itself.

By default a label lies on the surface at its height (ex. the tops of boxes), turning and tipping with the view, in `fontSize` and `fill`. With `viewport` it faces the viewer instead, drawn over the scene upright and crisp however the view turns, styled with `class`.

```svelte
<Text data={nodes} x="x" y="y" z={40} value="name" viewport class="text-xs font-semibold" />
```

For a layout already in pixels (ex. a tree), place a label per node by numbers.

:example{ component="webgl/Polygon" name="tree" }

:example{ component="webgl/Rect" name="treemap" }
