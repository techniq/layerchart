---
'layerchart': minor
---

breaking(Brush): Redesign brush API

**Breaking changes:**

- Remove `mode` prop ('integrated' | 'separated') — sync behavior is now driven by presence of `x`/`y` props
- Remove `resetOnEnd` — call `e.brush.reset()` in your `onBrushEnd` handler instead
- Remove `ignoreResetClick` — replaced by `clickToReset` (default `true`)
- Remove `onReset` event — check `brush.active === false` in `onBrushEnd`/`onChange` instead

**New features:**

- Add `BrushState.move({ x?, y? })` for programmatic selection control (like d3's `brush.move()`)
- Add `BrushState.selectAll()` to select the full domain extent
- Add `BrushState.reset()` to clear the selection
- Add `clickToReset` prop (default `true`)
- Add `zoomOnBrush` prop on Chart for simplified charts to opt into brush-to-zoom
- Move domain clamping, edge adjustment, and range computation logic into `BrushState` class
- Add `BrushChartContext` interface for easier testing
