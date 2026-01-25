---
description: Primitive component which adds custom text for labeling, annotation, or commentary.
category: primitives
layers: [svg, canvas, html]
related: []
---

## Examples

### Usage

:example{ name="playground" }

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
