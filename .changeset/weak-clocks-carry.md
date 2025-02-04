---
'layerchart': patch
---

fix(canvas render): Always paint fill when explicitly defined (`rgb(0,0,0)` would match the default computedStyles color and be ignored)
