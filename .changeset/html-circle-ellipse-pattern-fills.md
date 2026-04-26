---
'layerchart': minor
---

feat(Circle, Ellipse): Support pattern/gradient `fill` values on the `<Html>` layer by switching from `background-color` to the `background` shorthand (with `background-origin: border-box` to keep patterns aligned under the border). Accepts values produced by `<Pattern>` / `<LinearGradient>` in HTML mode.
