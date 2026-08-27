---
'layerchart': patch
---

fix(Chart): Treat an explicit but empty `series` array as authoritative, rather than deriving implicit series from the marks it just rendered (the two never settled, locking the page)
