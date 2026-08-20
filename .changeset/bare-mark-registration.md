---
'layerchart': patch
---

fix(Chart): Register a mark that names nothing but the stack it draws, so a bare `<Bars />` over long data reaches the domain instead of being dropped as empty.
