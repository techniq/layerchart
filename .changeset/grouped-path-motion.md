---
'layerchart': patch
---

fix(Spline, Area): Animate each path when the mark is split by `z`, which `motion` previously skipped — segments split by a style function are still redrawn outright
