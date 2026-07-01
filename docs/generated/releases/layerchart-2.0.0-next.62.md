---
title: "layerchart@2.0.0-next.62"
tag: "layerchart@2.0.0-next.62"
date: "2026-05-01T13:13:56Z"
url: "https://github.com/techniq/layerchart/releases/tag/layerchart%402.0.0-next.62"
draft: false
prerelease: true
author: "github-actions[bot]"
---
### Minor Changes

-   feat(Blur): Add Canvas support ([#449](https://github.com/techniq/layerchart/pull/449))

### Patch Changes

-   perf(Chart): Eliminate per-instance props spread in `ChartState` ([#857](https://github.com/techniq/layerchart/pull/857))

-   fix(SeriesState): Avoid `derived_inert` crash when chart unmounts under a `<svelte:boundary>` ([#855](https://github.com/techniq/layerchart/pull/855))

    The `selectedKeys` sync effect was wrapped in `$effect.root`, creating an isolated scope that survived chart unmount. When the parent chart was destroyed (e.g. an example reloading inside the docs `<svelte:boundary>` after an async `$derived` re-evaluated), the `#series` derived became inert while the orphaned effect kept reading it — producing `Reading a derived belonging to a now-destroyed effect may result in stale values` warnings followed by `TypeError: e.some is not a function`. The effect now lives in the constructor, scoped to the component that instantiated `SeriesState`, so it is torn down with the chart.

-   fix(Arc, RectClipPath, ChartClipPath): Restore on-mount tween animations ([#855](https://github.com/techniq/layerchart/pull/855))

    Two related regressions introduced in the layer-component split (#848) prevented `motion` + `initial*` props from animating on mount.

    **`Arc`** — `motion`, `value`, `initialValue` and the rest of Arc's geometry props (`domain`, `range`, `startAngle`, `endAngle`, `innerRadius`, `outerRadius`, `cornerRadius`, `padAngle`, `track*`, `offset`) were not destructured in `Arc.base.svelte`, so they leaked through `{...restProps}` onto the inner `<Path>`. The forwarded `motion` made `Path` _also_ tween the path-string on top of the end-angle tween that `ArcState` already drives, producing visibly wrong arcs (NaN coordinates, runaway radii). They are now extracted and passed explicitly to `ArcState`.

    **`RectClipPath` / `ChartClipPath`** — `motion`, `initialX`, `initialY`, `initialWidth`, `initialHeight` were declared on the type but never consumed: the path was a plain `$derived` of the static `x`/`y`/`width`/`height` props, so passing `<ChartClipPath initialWidth={0} motion={{ width: { type: 'tween', … } }}>` rendered the final width on mount with no animation. Each dimension now flows through its own `createMotion` (using the corresponding `initial*` value as the animation start), and the path is built from the animated values.

-   perf: Reduce per-tick reactive overhead in `Path` / `Link` (force-simulation graphs) ([#855](https://github.com/techniq/layerchart/pull/855))

    In mark-heavy scenes (force simulations with hundreds of links flowing through `Link → Path`) several reactive structures unconditionally subscribed every `<path>` template updater to props that don't change on a tick, causing per-frame work to scale with the number of props × the number of marks. Each fix below is independent; together they take the lattice (n=20, 760 links) example from ~5–6 fps to ~9 fps during simulation.

    **`PathState.tweenedPathData` now reads only `pathData`, not all Path props.**
    Pre-fix, the getter resolved `pathData` via `getProps()`, a function that constructs an object literal of every reactive Path prop. Each read of `tweenedPathData` (i.e. each per-tick `<path d=...>` update) therefore subscribed the updater to every Path prop and re-read all of them. `PathState` now takes a dedicated `getPathData` getter alongside `getProps`, and the hot-path tween / DOM read only touches `pathData`. `Path.svg.svelte` and `Path.canvas.svelte` pass them as separate getters.

    **`Link.base.svelte` passes a stable `getPathData` function rather than `motionPath.current` directly.**
    Reading `motionPath.current` from `Link.base.svelte`'s template subscribed the entire `<Path>` block to every tick, forcing the parent's prop spread (`{...restProps}`) and `cls(...)` evaluation to re-run on every change. Passing a stable function reference moves the per-tick read inside `<Path>`'s own template, keeping `Link.base.svelte` stable. Requires the new `pathData?: string | (() => string)` form on `Path`.

    **`Path.svg.svelte` allocates `draw`-related state lazily.**

    -   `endPoint = createControlledMotion(..., { type: 'none' })` was created for every `Path`, even when no `draw` transition was configured. Now only created when `draw` is set.
    -   The `$effect` that tracked `tweenedPathData` for `startContent` / `endContent` positioning ran on every `Path`, even when neither prop was provided. Now only registered when at least one is set.
    -   `drawKey` is only ever set when `draw` is configured, so the `{#key c.drawKey}` block is a no-op for paths without a draw transition. The block stays unconditional — splitting it behind `{#if draw}` showed no measurable benefit over leaving the inert subscription in place.

    **`Path.svg.svelte` extracts styling props out of `...rest`.**
    `pathData`, `class`, `fill` / `fillOpacity` / `stroke` / `strokeOpacity` / `strokeWidth` / `opacity` and `motion` are now destructured out of `$props()` rather than left in `...rest`, so the `<path>` element's `{...rest}` spread doesn't re-evaluate every frame when those props change (`pathData` changes on every force-sim tick; `class` is typically a fresh `cls(...)` string per parent render).

    **`Link.base.svelte` drops a redundant prop spread.**
    Removed `{...extractLayerProps(restProps, 'lc-link')}` before `{...restProps}` — the call's only contribution (`class`) was being immediately overridden by the explicit `class={cls('lc-link', …)}` that follows, making the spread pure overhead.

-   perf: Skip mark-info `$effect` for pixel-mode primitives ([#855](https://github.com/techniq/layerchart/pull/855))

    `registerComponent` now probes `markInfo()` once at construction; if the result is initially empty (pixel-mode primitives where `cx`/`cy`/`r`/etc. are numbers rather than string/function accessors), it skips creating the tracking `$effect` entirely. Saves one effect frame per primitive — adds up in mark-heavy scenes (force simulations, scatter plots with hundreds of nodes).

    Trade-off: a primitive that starts in pixel mode and later flips to data mode at runtime (e.g. `cx` mutates from a number to a string) will not register a mark. Mark mode is typically static; if a chart needs runtime data-mode marks, define an explicit `series` on the chart instead.
