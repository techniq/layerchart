---
'layerchart': patch
---

fix(Arc, RectClipPath, ChartClipPath): Restore on-mount tween animations

Two related regressions introduced in the layer-component split (#848) prevented `motion` + `initial*` props from animating on mount.

**`Arc`** — `motion`, `value`, `initialValue` and the rest of Arc's geometry props (`domain`, `range`, `startAngle`, `endAngle`, `innerRadius`, `outerRadius`, `cornerRadius`, `padAngle`, `track*`, `offset`) were not destructured in `Arc.base.svelte`, so they leaked through `{...restProps}` onto the inner `<Path>`. The forwarded `motion` made `Path` *also* tween the path-string on top of the end-angle tween that `ArcState` already drives, producing visibly wrong arcs (NaN coordinates, runaway radii). They are now extracted and passed explicitly to `ArcState`.

**`RectClipPath` / `ChartClipPath`** — `motion`, `initialX`, `initialY`, `initialWidth`, `initialHeight` were declared on the type but never consumed: the path was a plain `$derived` of the static `x`/`y`/`width`/`height` props, so passing `<ChartClipPath initialWidth={0} motion={{ width: { type: 'tween', … } }}>` rendered the final width on mount with no animation. Each dimension now flows through its own `createMotion` (using the corresponding `initial*` value as the animation start), and the path is built from the animated values.
