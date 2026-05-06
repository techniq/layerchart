---
'layerchart': patch
---

fix(Spline): Allow CSS class `opacity` to fade lines on the Canvas layer. `Spline` was always passing `opacity={1}` to the underlying `Path` when no series fade was active, which became `constantStyles.opacity = 1` in the canvas renderer and shadowed the value resolved from a user's `class` (e.g. `class="opacity-20"`). Now skip passing `opacity` when the computed series fade is the no-fade default, so the class can take effect — matching SVG behavior where CSS class rules override the presentation attribute.
