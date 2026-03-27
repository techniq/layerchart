---
'layerchart': major
---

breaking(BrushContext|TransformContext): Rename `bind:brushContext` / `bind:transformContext` to `bind:state`

Both `BrushContext` and `TransformContext` now use `bind:state` instead of their previous named bindings. Additionally, properties on `ChartState` have been renamed:

- `chartContext.brushContext` → `chartContext.brushState`
- `chartContext.transformContext` → `chartContext.transformState`

```diff
- <BrushContext bind:brushContext>
+ <BrushContext bind:state>

- <TransformContext bind:transformContext>
+ <TransformContext bind:state>
```
