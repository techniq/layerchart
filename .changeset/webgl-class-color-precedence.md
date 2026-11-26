---
'@layerchart/webgl': patch
---

fix: A class's own fill or stroke (ex. `fill-primary/20`) wins over a mark's `fill` / `stroke` prop, as CSS does in core's layers
