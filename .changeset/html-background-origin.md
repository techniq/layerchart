---
'layerchart': patch
---

fix(Rect): On the `<Html>` layer, set `background-origin: border-box` so fills/patterns start at the outer edge — previously the CSS `background` shorthand reset origin to `padding-box`, shifting patterns inward by `border-width` when a stroke was applied.
