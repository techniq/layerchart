---
'layerchart': minor
---

feat(Axis): Add `tickOcclusion` to drop ticks whose labels would overlap, measured at the size they render (including rotation), with `priority` of `'end'` (default), `'start'`, or `'start-end'` to choose which survive
