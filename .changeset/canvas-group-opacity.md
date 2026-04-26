---
'layerchart': patch
---

fix(canvas): Compose globalAlpha multiplicatively so Group opacity propagates to children

Canvas `renderPathData` was overwriting `ctx.globalAlpha` with absolute values for element opacity, fill opacity, and stroke opacity. This meant a parent `<Group opacity={0.2}>` had no effect on child marks rendered on canvas — the child's own opacity (defaulting to 1) would replace the inherited value.

Now all three sites multiply against the current `globalAlpha`, which correctly composes with ancestor Group opacity set via `save()`/`restore()` scoping. Also removes double-application of element `opacity` inside the fill/stroke blocks (it's already applied at the element level).
