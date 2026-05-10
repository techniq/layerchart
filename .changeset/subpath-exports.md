---
'layerchart': minor
---

breaking: Move heavy-dep components into sub-path exports

The following components are no longer re-exported from `'layerchart'` and must be imported from new sub-paths:

- `'layerchart/geo'` — `GeoCircle`, `GeoClipPath`, `GeoEdgeFade`, `GeoLegend`, `GeoPath`, `GeoPoint`, `GeoProjection`, `GeoRaster`, `GeoSpline`, `GeoTile`, `GeoVisible`, `Graticule`, `TileImage`
- `'layerchart/hierarchy'` — `Tree`, `Treemap`, `Pack`, `Partition`
- `'layerchart/force'` — `ForceSimulation`
- `'layerchart/graph'` — `Dagre`, `Sankey`, `Chord`, `Ribbon`

This isolates each group's external d3 dependency (`@dagrejs/dagre` ~22 KB, `d3-geo` ~15 KB, `d3-force` ~7 KB, `d3-hierarchy` ~6 KB, `d3-sankey` ~6 KB, `d3-chord` ~2 KB) behind an opt-in import — defending against bundlers that don't tree-shake the root barrel cleanly.

`Voronoi`/`Hull` stay at root (already lazy-loaded via `TooltipContext`). `Contour`/`Density`/`Raster`/`BoxPlot`/`Violin`/`Threshold` and high-level charts (`LineChart`, `BarChart`, etc.) remain at root.

**Migration:** update affected imports, e.g.

```diff
-import { Tree, GeoPath, ForceSimulation } from 'layerchart';
+import { Tree } from 'layerchart/hierarchy';
+import { GeoPath } from 'layerchart/geo';
+import { ForceSimulation } from 'layerchart/force';
```
