---
description: Clipping component which defines a clipping region to constrain the rendering of chart elements within a specified shape or boundary.
category: clipping
layers: [svg, canvas, html]
related: [ChartClipPath, CircleClipPath, GeoClipPath, RectClipPath, Threshold]
order: 1
---

## Examples

### Basic

Clip a patterned `<Rect>` to a circular `path` — only content *inside* the shape renders.

:example{name="basic" showCode}

### Inverted

Set `invert` to render content *outside* the clip shape — useful for cutouts and masks.

:example{name="inverted" showCode}
