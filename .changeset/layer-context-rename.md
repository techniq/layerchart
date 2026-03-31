---
'layerchart': major
---

breaking: Rename render context APIs to layer context

- `getRenderContext()` → `getLayerContext()`
- `setRenderContext()` → `setLayerContext()`
- `supportedContexts` prop → `layers` prop on components
- Internal `layout/` directory moved to `layers/` (affects deep imports)

```diff
- import { getRenderContext } from 'layerchart'
+ import { getLayerContext } from 'layerchart'
```
