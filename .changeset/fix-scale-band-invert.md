---
'layerchart': patch
---

fix(scaleBandInvert): Account for range offset in band scale inversion. Previously assumed range started at 0, causing incorrect pixel-to-category mapping when the scale range was transformed.
