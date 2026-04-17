---
'layerchart': patch
---

fix(Rect, Circle, Ellipse): Apply `box-sizing: border-box` on the `<Html>` layer so the visual extent equals `width`×`height` (or `r * 2`, `rx * 2`×`ry * 2`) — the border is drawn within that extent instead of added to it, matching SVG bounds.
