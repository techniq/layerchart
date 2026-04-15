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

### `clip` snippet

For shapes that can't be expressed as a single SVG path `d` string (multiple elements, non-path primitives like `<circle>` / `<rect>`, or per-layer customization), use the `clip` snippet to render arbitrary SVG content inside the `<clipPath>`. The union of the rendered shapes defines the clip region.

Note: the `clip` snippet is SVG-only — canvas and HTML layers require the `path` prop.

:example{name="clip-snippet" showCode}

### `useId`

Reference an existing shape (already rendered elsewhere in the SVG) as the clip region by passing its element id to `useId`. Internally this emits a `<use href="#...">` inside the `<clipPath>`, so the same shape drives both the visible render and the clip without duplicating its geometry.

Useful for keeping a visible outline and its clip region in sync, or for reusing a shared `<defs>` shape across multiple clips. See also the [GeoPath timezones](/docs/components/GeoPath#timezones) example, which reuses a `"globe"` `<GeoPath>` as the daylight clip region.

:example{name="use-id" showCode}
