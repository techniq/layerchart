---
'layerchart': minor
---

feat: Per-layer variants for primitives, compound marks, and high-level charts (`layerchart/svg`, `layerchart/canvas`, `layerchart/html`)

Layer-agnostic components auto-detect the surrounding `<Svg>`, `<Canvas>`, or `<Html>` layer and bundle every render path. The new sub-path exports expose layer-specific variants so consumers committed to a single rendering layer can opt into a smaller bundle.

```ts
// Default: agnostic, dispatches at runtime — works in any layer
import { Rect, Circle, Text, Path, LineChart } from 'layerchart';

// SVG-only — skips canvas + html branches
import { Rect, Circle, Text, Path, LineChart } from 'layerchart/svg';

// Canvas-only
import { Rect, Circle, Text, LineChart } from 'layerchart/canvas';

// HTML-only — drops canvas + svg overhead (some primitives are ~95% smaller)
import { Rect, Circle, Text, Pattern, LinearGradient } from 'layerchart/html';
```

Each agnostic component (e.g. `Rect.svelte`) now dispatches to the corresponding per-layer variant under the hood (`Rect.svg.svelte`, `Rect.canvas.svelte`, `Rect.html.svelte`) — no breaking change for existing consumers.

### What's split

**Primitives (13)** — the basic graphics building blocks
`Circle`, `Text`, `Rect`, `Line`, `Path`, `Ellipse`, `Polygon`, `Group`, `Image`, `ClipPath`, `Pattern`, `LinearGradient`, `RadialGradient`

**Compound marks (~30)** — chart axes, marks, annotations, and chart-relative shapes
`Axis`, `Grid`, `Rule`, `Highlight`, `Layer`, `ChartChildren`, `ChartClipPath`, `CircleClipPath`, `Bars`, `Bar`, `Spline`, `Area`, `Pie`, `Arc`, `ArcLabel`, `Points`, `Cell`, `Frame`, `Threshold`, `Trail`, `Vector`, `Link`, `Labels`, `AnnotationLine`, `AnnotationPoint`, `AnnotationRange`, `Hull`, `Density`, `Voronoi`, `Contour`, `Raster`, `Violin`, `BoxPlot`, `Calendar`, `Month`

**Geo components (`layerchart/geo`)**
`GeoPath`, `GeoSpline`, `GeoPoint`, `GeoCircle`, `GeoTile`, `TileImage`, `Graticule`, `GeoClipPath`, `GeoEdgeFade`

**Graph components (`layerchart/graph`)**
`Ribbon`

**High-level chart wrappers** — pre-composed charts with built-in tooltips, highlights, and series handling
`LineChart`, `AreaChart`, `BarChart`, `ScatterChart`, `PieChart`, `ArcChart`

The geo, graph, hierarchy, and force sub-paths also re-export every layer-agnostic helper they previously included, so a single `from 'layerchart/svg'` import covers a typical SVG chart end-to-end without falling back to `'layerchart'`.

### Standout per-layer wins (gz, vs agnostic baseline)

**Primitives where the per-layer rendering is dramatically simpler:**
- `Pattern` html: 14.81 → 0.92 KB (-94%) — HTML implementation is just CSS-string generation
- `LinearGradient` html: 14.38 → 0.53 KB (-96%)
- `Image` canvas: 14.95 → 3.73 KB (-75%)
- `Text` svg/html: 29.13 → ~16 KB (-45%)
- `Circle` / `Rect` / `Ellipse` / `Line` / `Path`: ~22–27% smaller per-layer

**Compound marks:** typically 8–15% gz savings per-layer; outliers like `Highlight` (-30% canvas) and `Cell` (-22% svg) are larger because their HTML/canvas vs. SVG paths diverge significantly.

**High-level charts:** ~10–12% gz savings (~5–11 KB) when imported from `layerchart/svg` or `layerchart/canvas`. A single-layer LineChart drops from 92.5 KB → 81.9 KB gz on the SVG path.

For a consumer who migrates all imports to a single layer, cumulative savings across primitives and compound marks are 60–80 KB gz.

### Behavior

Identical to the agnostic versions: visual output, props, types, and bindable refs all match. The dispatcher pattern adds ~0.2 KB per primitive to `core` for users on the agnostic API (transitive cost from `Highlight` / `Axis` / `Chart`) — a worthwhile tradeoff for the opt-in per-layer savings.

See the updated ["Bundle Size" guide](https://layerchart.com/docs/guides/bundle-size) for the full table, tradeoffs, and when to opt into per-layer imports.
