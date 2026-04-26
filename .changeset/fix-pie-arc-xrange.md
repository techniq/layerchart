---
'layerchart': patch
---

fix: Pie and Arc components now correctly use Chart's `xRange` prop for angle degrees instead of the computed viewport pixel range, and compute radius from chart dimensions instead of scale range
