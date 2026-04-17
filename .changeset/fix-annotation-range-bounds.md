---
'layerchart': patch
---

fix(AnnotationRange): Don't extend past chart bounds when `x` is omitted on band scales, and treat `null` on either side of `x`/`y` as "extend to chart edge".
