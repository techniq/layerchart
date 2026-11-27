---
description: Primitive component which adds custom text for labeling, annotation, or commentary.
category: primitives
layers: [svg, canvas, html]
related: []
components:
  - { name: Text }
  - { name: webgl/Text, label: Text (WebGL) }
---

## Usage

### Pixel mode

Pass numeric or CSS string values for `x` and `y` to position text at exact locations.

:example{ name="playground" }

### Data mode

Pass string property names or accessor functions to `x` and `y` to position text from data. The `value` prop can be a string property name, function, or literal. The component renders one text element per data item.

:example{ name="data-mode" showCode }

### Color via ordinal scale

Use `fill` with a data property name to color each text through the chart's color scale.

:example{ name="color-via-ordinal-scale" showCode }

### Color via threshold scale

Use a threshold scale to color text based on value ranges.

:example{ name="color-via-threshold-scale" showCode }

### Segments

Use the `segments` prop to render inline text with mixed styles (different font sizes, weights, or colors). Each segment gets its own `class` for styling. Works across SVG, Canvas, and HTML layers.

:example{ name="segments" showCode }

### Font size

Pass `fontSize` (number = pixels, or any CSS length string) to size text. When set, `verticalAnchor="middle"` centers correctly at any size — `capHeight` defaults to `fontSize * 0.71`, so per-item scaled labels share a common visual baseline. An explicit `capHeight` still wins.

```svelte
<Text fontSize={24} verticalAnchor="middle" textAnchor="middle" value="Hello" />
```

For a per-datum scaled use case (text size driven by another value), see the [Dodge text-beeswarm example](/docs/components/Dodge/text-beeswarm).

## Use cases

### Truncate text of axis labels

Sometimes your axis labels overwhelm the available space. You can use `truncate` to limit the text to a maximum length.

:example{ name="truncate-axis-labels" }

### Word wrap with text of axis labels

You can use explicit newlines (`\n`) in the text value to force a word wrap. This works regardless of the layer you are using.

:::note
Note you can change the rendering layer with the toggle at the top of the page.
:::

:example{ name="word-wrap-axis-labels" }

### Along path

`Text` can be used with `Arc`'s `children` snippet and `getArcTextProps` to write along the `inner`, `outer`, or `middle` of the arc path.

The text will smartly orientate based on the direction (clockwise / counter-clockwise) and location (top, bottom, left, right) of the arc

:example{ component="Arc" name="label-direction" }

:::note
Only supported in `Svg` layers.
:::

## WebGL

In a [`WebGL`](/docs/components/WebGL) layer, from [`@layerchart/webgl`](/docs/guides/webgl), text lies on the surface beneath it, or faces the viewer. See the [WebGL guide](/docs/guides/webgl) to get started.

A label per row, placed as the core [`Text`](/docs/components/Text) places it: `x`, `y`, and `z` are data properties or functions of the row, through the chart's scales (longitude and latitude on a map), or numbers in pixels. `value` is a property, a function, or the text itself.

By default a label lies on the surface at its height (ex. the tops of boxes), turning and tipping with the view, in `fontSize` and `fill`. With `viewport` it faces the viewer instead, drawn over the scene upright and crisp however the view turns, styled with `class`.

```svelte
<Text data={nodes} x="x" y="y" z={40} value="name" viewport class="text-xs font-semibold" />
```

For a layout already in pixels (ex. a tree), place a label per node by numbers.

:example{ component="Polygon" name="tree" }

:example{ component="Rect" name="treemap" }
