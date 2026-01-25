---
description: Primitive component which adds custom text for labeling, annotation, or commentary.
category: primitives
layers: [svg, canvas, html]
related: []
---

## Examples

### Usage

:example{ name="playground" }

## Along path

`Text` can be used with `Arc`'s `children` snippet and `getArcTextProps` to write along the `inner`, `outer`, or `middle` of the arc path.

The text will smartly orientate based on the direction (clockwise / counter-clockwise) and location (top, bottom, left, right) of the arc

:example{ component="Arc" name="label-direction" }

<!-- ### Word wrap with explicit `\n`

:example{ name="word-wrap-with-explicit-n" } -->
