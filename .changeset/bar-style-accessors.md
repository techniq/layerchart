---
'layerchart': minor
---

feat(Bar|Bars): Accept a per-row accessor for `fillOpacity`, `strokeWidth`, and `opacity`, matching `Rect` and `Circle` — a bar hands its `Rect` computed dimensions, so a function was silently dropped before.
