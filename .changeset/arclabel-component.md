---
'layerchart': minor
---

feat(ArcLabel): New component for positioning text labels on arc segments

`ArcLabel` is a new marking component for placing text (and optional leader lines) relative to an arc. It's used internally by `PieChart` and `ArcChart` when the `labels` prop is set, but can also be rendered directly inside an `Arc` children snippet.

Supported placements:

- `centroid` — at the arc centroid (horizontal text, default)
- `centroid-rotated` — at the centroid, rotated to follow the arc tangent, flipped where needed so text stays upright
- `centroid-radial` — at the centroid, rotated to read along the radial direction (center → outer edge)
- `inner` / `middle` / `outer` — along the inner, medial, or outer arc path (centered via `startOffset: '50%'` by default)
- `callout` — outside the arc with a leader line that bends horizontally to the label

`ArcLabel` accepts a single `offset` prop that is routed to the placement-appropriate radial padding (centroid offset, `innerPadding`/`outerPadding`, or `calloutLineLength`), plus `calloutLineLength` / `calloutLabelOffset` / `calloutPadding` for fine-grained control of callout leader lines. The leader line renders via the `Path` primitive, so it works in both SVG and Canvas chart layers.
