---
'layerchart': patch
---

fix(TransformContext): Reactively sync `processTranslate` and `disablePointer` to TransformState when props change. Fixes inverted globe dragging when dynamically switching between flat and globe projections.
