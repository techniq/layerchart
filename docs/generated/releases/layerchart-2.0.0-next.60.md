---
title: "layerchart@2.0.0-next.60"
tag: "layerchart@2.0.0-next.60"
date: "2026-04-29T18:27:59Z"
url: "https://github.com/techniq/layerchart/releases/tag/layerchart%402.0.0-next.60"
draft: false
prerelease: true
author: "github-actions[bot]"
---
### Minor Changes

-   breaking: Move heavy-dep components into sub-path exports ([#845](https://github.com/techniq/layerchart/pull/845))

    The following components are no longer re-exported from `'layerchart'` and must be imported from new sub-paths:

    -   `'layerchart/geo'` — `GeoCircle`, `GeoClipPath`, `GeoEdgeFade`, `GeoLegend`, `GeoPath`, `GeoPoint`, `GeoProjection`, `GeoRaster`, `GeoSpline`, `GeoTile`, `GeoVisible`, `Graticule`, `TileImage`
    -   `'layerchart/hierarchy'` — `Tree`, `Treemap`, `Pack`, `Partition`
    -   `'layerchart/force'` — `ForceSimulation`
    -   `'layerchart/graph'` — `Dagre`, `Sankey`, `Chord`, `Ribbon`

    This isolates each group's external d3 dependency (`@dagrejs/dagre` ~22 KB, `d3-geo` ~15 KB, `d3-force` ~7 KB, `d3-hierarchy` ~6 KB, `d3-sankey` ~6 KB, `d3-chord` ~2 KB) behind an opt-in import — defending against bundlers that don't tree-shake the root barrel cleanly.

    `Voronoi`/`Hull` stay at root (already lazy-loaded via `TooltipContext`). `Contour`/`Density`/`Raster`/`BoxPlot`/`Violin`/`Threshold` and high-level charts (`LineChart`, `BarChart`, etc.) remain at root.

    **Migration:** update affected imports, e.g.

    ```diff
    -import { Tree, GeoPath, ForceSimulation } from 'layerchart';
    +import { Tree } from 'layerchart/hierarchy';
    +import { GeoPath } from 'layerchart/geo';
    +import { ForceSimulation } from 'layerchart/force';
    ```

### Patch Changes

-   perf: Lazy-load opt-in features in `core` path ([#845](https://github.com/techniq/layerchart/pull/845))

    5 components/dependencies that previously sat in every `<Chart>` user's sync graph are now dynamically imported only when the corresponding feature is used:

    -   `BrushContext` in `Chart` — only loads when `<Chart brush={...}>` is set (default `undefined`)
    -   `DefaultTooltip` in `ChartChildren` — only loads when `tooltipContext` is set and no custom `tooltip` snippet is provided
    -   `d3-quadtree` in `TooltipContext` — only loads when `mode` is `'quadtree'`, `'quadtree-x'`, or `'quadtree-y'`
    -   `Spline` in `Grid` — only loads when rendering radial linear grid lines (`<Chart radial>` with `radialY="linear"`)
    -   `Bar` in `Highlight` — only loads when `<Chart highlight={{ bar: ... }}>` is set (default `false`)

    Result: **~10 KB gz off `core`** (115.6 → 105.25 KB) and comparable savings on every cartesian/geo/graph/hierarchy scenario, with no impact on rendered output for users who already opt into these features.

    Also switches internal `@layerstack/svelte-actions` imports from the barrel (`@layerstack/svelte-actions`) to sub-paths (`@layerstack/svelte-actions/styles`, `@layerstack/svelte-actions/portal`). No production bundle effect — bundlers already tree-shake the unused `popover.js` — but it stops the Svelte REPL/CDN from eagerly fetching `@floating-ui/dom` (popover's transitive dep) when consumers load `layerchart` from a CDN.
