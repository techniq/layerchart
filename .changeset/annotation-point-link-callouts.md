---
'layerchart': minor
---

feat(AnnotationPoint): Add `link` prop for ring-note style callouts, plus geo projection support

- Pass `link={true}` or `link={{ type: 'beveled', radius: 20, ... }}` etc. to draw a `<Link>` from the ring edge to the label. Any `Link` prop (`type`, `curve`, `sweep`, `radius`, `bend`, `class`, ...) can be passed through.
- Inside a geo `<Chart>`, `x`/`y` are now interpreted as `[lon, lat]` and projected directly, so `AnnotationPoint` can be used on maps.
