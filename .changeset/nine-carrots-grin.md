---
'layerchart': patch
---

fix(Bar): Clamp radius to width/height to not cause artifacts with small values (including `0`) when rounding a single edge. Fixes #383
