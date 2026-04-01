---
'layerchart': minor
---

feat: Unified component tree for Canvas rendering with proper Group transform scoping. Fixes #662

- New `registerComponentNode({ name, kind, canvasRender })` API replaces both `registerCanvasComponent` and the `InsideCompositeMark` boolean context with a single unified component tree.
- Canvas rendering now walks the tree recursively with proper `save()`/`restore()` scoping, fixing Group transforms (translate, opacity) leaking to sibling components instead of only affecting children.
- Composite marks (Area, Threshold, Hull, Labels, Grid) register as `'composite-mark'` nodes, automatically preventing child marks from registering with the chart without manual `_skipRegistration` props.
- Removed `retainState` and `name` from `ComponentRender` type — Group's transform scoping is handled by tree position, and component names live on the tree node.
