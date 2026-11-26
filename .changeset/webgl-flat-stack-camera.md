---
'@layerchart/webgl': patch
---

fix: A flat chart with very many marks (ex. a `Calendar`'s `Rect` per day) draws them all, its camera above every mark's layer
