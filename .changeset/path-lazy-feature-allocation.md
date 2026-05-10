---
'layerchart': patch
---

perf: Reduce per-tick reactive overhead in `Path` / `Link` (force-simulation graphs)

In mark-heavy scenes (force simulations with hundreds of links flowing through `Link → Path`) several reactive structures unconditionally subscribed every `<path>` template updater to props that don't change on a tick, causing per-frame work to scale with the number of props × the number of marks. Each fix below is independent; together they take the lattice (n=20, 760 links) example from ~5–6 fps to ~9 fps during simulation.

**`PathState.tweenedPathData` now reads only `pathData`, not all Path props.**
Pre-fix, the getter resolved `pathData` via `getProps()`, a function that constructs an object literal of every reactive Path prop. Each read of `tweenedPathData` (i.e. each per-tick `<path d=...>` update) therefore subscribed the updater to every Path prop and re-read all of them. `PathState` now takes a dedicated `getPathData` getter alongside `getProps`, and the hot-path tween / DOM read only touches `pathData`. `Path.svg.svelte` and `Path.canvas.svelte` pass them as separate getters.

**`Link.base.svelte` passes a stable `getPathData` function rather than `motionPath.current` directly.**
Reading `motionPath.current` from `Link.base.svelte`'s template subscribed the entire `<Path>` block to every tick, forcing the parent's prop spread (`{...restProps}`) and `cls(...)` evaluation to re-run on every change. Passing a stable function reference moves the per-tick read inside `<Path>`'s own template, keeping `Link.base.svelte` stable. Requires the new `pathData?: string | (() => string)` form on `Path`.

**`Path.svg.svelte` allocates `draw`-related state lazily.**

- `endPoint = createControlledMotion(..., { type: 'none' })` was created for every `Path`, even when no `draw` transition was configured. Now only created when `draw` is set.
- The `$effect` that tracked `tweenedPathData` for `startContent` / `endContent` positioning ran on every `Path`, even when neither prop was provided. Now only registered when at least one is set.
- `drawKey` is only ever set when `draw` is configured, so the `{#key c.drawKey}` block is a no-op for paths without a draw transition. The block stays unconditional — splitting it behind `{#if draw}` showed no measurable benefit over leaving the inert subscription in place.

**`Path.svg.svelte` extracts styling props out of `...rest`.**
`pathData`, `class`, `fill` / `fillOpacity` / `stroke` / `strokeOpacity` / `strokeWidth` / `opacity` and `motion` are now destructured out of `$props()` rather than left in `...rest`, so the `<path>` element's `{...rest}` spread doesn't re-evaluate every frame when those props change (`pathData` changes on every force-sim tick; `class` is typically a fresh `cls(...)` string per parent render).

**`Link.base.svelte` drops a redundant prop spread.**
Removed `{...extractLayerProps(restProps, 'lc-link')}` before `{...restProps}` — the call's only contribution (`class`) was being immediately overridden by the explicit `class={cls('lc-link', …)}` that follows, making the spread pure overhead.
