---
'layerchart': patch
---

feat(skeleton): Resolve surface colors via `light-dark()` so the Skeleton presets follow `color-scheme` (the `.dark` toggle, or `prefers-color-scheme` when unpinned), and fix the surface scale collapsing to a single shade — surfaces now graduate from 100 (lightest) to 300 (darkest) in both light and dark
