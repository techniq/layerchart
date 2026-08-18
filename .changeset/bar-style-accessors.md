---
'layerchart': minor
---

Accept a per-row accessor for `fillOpacity`, `strokeWidth`, and `opacity` on `Bar` / `Bars`, matching `Rect` and `Circle`. A bar hands its `Rect` computed dimensions, so the `Rect` never sees the row and a function was silently dropped; it is resolved on the bar itself now. `fill` / `stroke` are unchanged — a bar's color comes from `c` or its series.
