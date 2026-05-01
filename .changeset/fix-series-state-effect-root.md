---
'layerchart': patch
---

fix(SeriesState): Avoid `derived_inert` crash when chart unmounts under a `<svelte:boundary>`

The `selectedKeys` sync effect was wrapped in `$effect.root`, creating an isolated scope that survived chart unmount. When the parent chart was destroyed (e.g. an example reloading inside the docs `<svelte:boundary>` after an async `$derived` re-evaluated), the `#series` derived became inert while the orphaned effect kept reading it — producing `Reading a derived belonging to a now-destroyed effect may result in stale values` warnings followed by `TypeError: e.some is not a function`. The effect now lives in the constructor, scoped to the component that instantiated `SeriesState`, so it is torn down with the chart.
