---
'layerchart': minor
---

breaking(Arc): Center arc text along path by default for `inner`/`middle`/`outer` positions

`getArcTextProps('inner' | 'middle' | 'outer')` now defaults to `startOffset: '50%'` with `textAnchor: 'middle'`, centering the text along the arc path rather than anchoring it at the arc start. When an explicit `startOffset` is provided, the anchor falls back to `'start'` so the text begins at that position (matching prior behavior for callers that set a start offset).
