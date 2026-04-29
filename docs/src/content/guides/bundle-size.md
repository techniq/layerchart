---
title: Bundle Size
description: How to reduce LayerChart's footprint in your application bundle
category: advanced
---

LayerChart ships a layer-agnostic, batteries-included API by default — `<Chart>` works with `<Svg>`, `<Canvas>`, and `<Html>` rendering, primitives like `<Circle>` and `<Rect>` auto-detect the surrounding layer, and chart-level features like brushing, tooltips, and tile maps activate when you pass the right prop.

That flexibility has a cost: every consumer of `import { Chart } from 'layerchart'` would otherwise pay for code paths they may never reach. To keep the default bundle small, LayerChart uses three layered strategies:

1. **Lazy-loaded opt-in features** — Heavy features are dynamically imported only when activated
2. **Sub-path exports for heavy dependencies** — Components that pull in big external deps live behind opt-in sub-paths
3. **Per-layer variants** — Almost every component has SVG/Canvas/HTML-specific variants for users who commit to one layer (primitives, compound marks, geo, graph, and the high-level chart wrappers like `<LineChart>`)

The first two cost you nothing — they're transparent. The third is opt-in: you swap an import to get a smaller bundle in exchange for losing layer flexibility on that import.

## What you get for free

The following heavy features are loaded only when you use them, with no code change required from you:

| Feature | When it loads |
| --- | --- |
| `<BrushContext>` (and brush state) | When `<Chart brush={...}>` is set |
| `<TransformContext>` (and transform state) | When `<Chart transform={...}>` is set |
| `<DefaultTooltip>` | When `tooltipContext` is set and you don't provide a custom `tooltip` snippet |
| `Voronoi` hit-detection | When `<TooltipContext mode="voronoi">` is used |
| `Arc` (radial tooltip rects) | When `<TooltipContext mode="bounds">` or `mode="band"` is used inside a radial chart |
| `d3-quadtree` | When `<TooltipContext mode="quadtree">` (or `quadtree-x` / `quadtree-y`) is used |
| `Spline` (radial linear grid) | When `<Chart radial>` with `<Grid radialY="linear">` is used |
| `Bar` highlight overlay | When `<Chart highlight={{ bar: ... }}>` is set |
| `<Points>`, `<Labels>`, `<Legend>`, `<ChartAnnotations>` | When the corresponding prop is set on `<Chart>` |

These additions to your chart cause an extra HTTP fetch the first time the corresponding feature is used. On a fast network this is unnoticeable; on slow networks the chart paints first and the optional feature appears as it loads.

## Sub-path exports for heavy dependencies

Components that bring in large d3 modules or framework-specific libraries are not re-exported from the root `'layerchart'` entry. They live behind opt-in sub-paths so the default barrel doesn't drag those deps into bundlers that don't tree-shake aggressively.

| Sub-path | Components | Heavy dep saved |
| --- | --- | --- |
| `layerchart/geo` | `Geo*` (12), `Graticule`, `TileImage` | `d3-geo` (~15 KB), `d3-tile` |
| `layerchart/hierarchy` | `Tree`, `Treemap`, `Pack`, `Partition` | `d3-hierarchy` (~6 KB) |
| `layerchart/force` | `ForceSimulation` | `d3-force` (~7 KB) |
| `layerchart/graph` | `Dagre`, `Sankey`, `Chord`, `Ribbon` | `@dagrejs/dagre` (~22 KB), `d3-sankey`, `d3-chord` |

If you use these components, just import from the sub-path:

```ts
import { Tree, Treemap } from 'layerchart/hierarchy';
import { GeoPath, GeoProjection } from 'layerchart/geo';
import { ForceSimulation } from 'layerchart/force';
import { Sankey, Dagre } from 'layerchart/graph';
```

If you don't use them, you don't pay for them — the agnostic root export simply doesn't expose them, so even bundlers that mishandle tree-shaking can't accidentally include them.

Each sub-path also re-exports the layer-agnostic helpers you'd need alongside its specialty components (e.g. `Chart`, `Tooltip`, `Axis`, `Highlight`, scales, layouts). For typical usage you can stay on a single sub-path import line for an entire chart.

## `<ChartCore>` for non-cartesian charts (opt-in)

`<Chart>` includes the standard cartesian frame: `<Layer>`, `<Axis>`, `<Grid>`, `<Rule>`, `<Highlight>`, and `<ChartClipPath>`. Those are baked into `Chart`'s import graph so cartesian users get them automatically. But if you're rendering a geo map, a custom layout, or any chart that doesn't need axes/grids, that import chain is dead weight.

`<ChartCore>` is a bare-bones variant that provides the chart context, sizing, brush, transform, and tooltip plumbing — but skips `ChartChildren` and everything it pulls in. You provide your own primitives directly via the `children` snippet:

```svelte
<script>
  import { ChartCore, Svg, GeoProjection, GeoPath } from 'layerchart/svg';
</script>

<ChartCore data={countries}>
  {#snippet children({ context })}
    <Svg>
      <GeoProjection projection={geoMercator} fitGeojson={countries}>
        <GeoPath geojson={countries} fill="steelblue" />
      </GeoProjection>
    </Svg>
  {/snippet}
</ChartCore>
```

A typical geo chart drops from ~87 KB gz with `<Chart>` to ~55 KB gz with `<ChartCore>` (a ~32 KB gz / ~37% saving) because the entire `Axis` / `Grid` / `Rule` / `Highlight` / `ChartClipPath` / `Layer` chain is no longer in the import graph.

`<ChartCore>` is exported from each layer sub-path (`layerchart`, `layerchart/svg`, `layerchart/canvas`, `layerchart/html`). The component itself is layer-agnostic — the layer is whatever you put inside the `children` snippet — so the sub-path choice only affects what other components (like `<Svg>` or `<GeoPath>`) tree-shake to.

When to use `<ChartCore>`:
- ✅ Geo maps (you'll render `<GeoProjection>` + `<GeoPath>` directly, no axes needed)
- ✅ Custom force-directed or hierarchy layouts that compose their own primitives
- ✅ Pre-rendered SVG/canvas content that just needs chart context for sizing
- 🤷 Cartesian charts — keep using `<Chart>`; you'd just have to re-add Axis/Grid/etc. yourself

## Per-layer variants (opt-in)

Almost every layer-agnostic component — primitives like `<Circle>` / `<Rect>` / `<Text>`, compound marks like `<Axis>` / `<Bars>` / `<Spline>`, geo components like `<GeoPath>`, and the high-level chart wrappers like `<LineChart>` — auto-detects the surrounding layer (`<Svg>`, `<Canvas>`, or `<Html>`) and renders appropriately. To do this they bundle every rendering path.

If you know your chart only renders to one layer, you can opt into a layer-specific variant:

```ts
// Default: agnostic, ~17 KB gz, works with Svg/Canvas/Html
import { Circle } from 'layerchart';

// SVG-only, ~13 KB gz (~25% smaller)
import { Circle } from 'layerchart/svg';

// Canvas-only
import { Circle } from 'layerchart/canvas';

// HTML-only, ~13 KB gz
import { Circle } from 'layerchart/html';
```

The agnostic version (`Circle.svelte`) dispatches to the appropriate per-layer variant under the hood at runtime, so you can mix per-layer and agnostic imports in the same chart — the resolved code path is identical.

The `layerchart/svg`, `layerchart/canvas`, and `layerchart/html` sub-paths re-export every layer-agnostic helper too (layouts, scales, tooltip primitives, etc.), so a single per-layer import path can cover a typical chart end-to-end.

### When per-layer is worth it

- ✅ You're building many charts in a single layer (most likely SVG)
- ✅ You're shipping to a bandwidth-sensitive context (mobile, embedded views, AMP-style pages)
- ✅ You want to sketch out the absolute minimum bundle for a specific use case

### When to stay on the agnostic API

- 🤷 You mix layers in the same project (some charts SVG, some Canvas)
- 🤷 Your bundle savings would be small relative to the rest of your app
- 🤷 You value the flexibility to swap a chart's rendering layer later without touching imports

### Primitives

| Primitive | Svg-only saves | Canvas-only saves | Html-only saves |
| --- | --- | --- | --- |
| `Circle` | ~4 KB gz (~23%) | ~1 KB gz (~7%) | ~4 KB gz (~22%) |
| `Text` | ~13 KB gz (~45%) | ~2 KB gz (~8%) | ~13 KB gz (~46%) |
| `Rect` | ~4 KB gz (~23%) | ~1 KB gz (~7%) | ~4 KB gz (~23%) |
| `Line` | ~4 KB gz (~22%) | ~3 KB gz (~14%) | ~5 KB gz (~27%) |
| `Path` | ~3 KB gz (~15%) | ~4 KB gz (~20%) | n/a (no HTML variant) |
| `Ellipse` | ~4 KB gz (~23%) | ~1 KB gz (~7%) | ~4 KB gz (~23%) |
| `Polygon` | ~3 KB gz (~16%) | ~1 KB gz (~3%) | n/a (no HTML variant) |
| `Group` | ~0.5 KB gz (~13%) | ~1 KB gz (~22%) | ~0.5 KB gz (~12%) |
| `Image` | ~1 KB gz (~8%) | **~11 KB gz (~75%)** | ~2 KB gz (~11%) |
| `ClipPath` | ~0.5 KB gz (~27%) | ~0.8 KB gz (~40%) | ~0.7 KB gz (~36%) |
| `Pattern` | ~4 KB gz (~26%) | ~1 KB gz (~9%) | **~14 KB gz (~94%)** |
| `LinearGradient` | ~4 KB gz (~26%) | ~1 KB gz (~7%) | **~14 KB gz (~96%)** |
| `RadialGradient` | ~4 KB gz (~25%) | ~0.8 KB gz (~6%) | n/a (no HTML variant) |

Notice the dramatic per-layer savings for components like `Pattern` and `LinearGradient` on HTML — the HTML implementation is just CSS-string generation (no canvas API or SVG element overhead), so the per-layer variant is ~95% smaller than agnostic.

### Compound marks

These are the chart-relative shapes built on top of primitives — bars, splines, areas, axes, points, annotations, etc. Per-layer savings here are typically 8–15% gz; outliers like `Highlight` (-30% canvas), `Cell` (-22% svg), and `CircleClipPath` (-37% canvas) are larger because their HTML/canvas vs. SVG paths diverge significantly.

| Component | Svg-only saves | Canvas-only saves | Html-only saves |
| --- | --- | --- | --- |
| `Axis` | ~5 KB gz (~13%) | ~6 KB gz (~14%) | ~7 KB gz (~15%) |
| `Highlight` | ~2 KB gz (~23%) | ~3 KB gz (~30%) | ~2 KB gz (~21%) |
| `Bars` / `Bar` | ~3 KB gz (~8%) | ~3–4 KB gz (~8–9%) | n/a |
| `Spline` | ~3 KB gz (~11%) | ~4 KB gz (~16%) | n/a |
| `Area` | ~3 KB gz (~11%) | ~4 KB gz (~15%) | n/a |
| `Pie` / `Arc` / `ArcLabel` | ~3 KB gz (~8–9%) | ~4 KB gz (~12–13%) | n/a |
| `Points` | ~4 KB gz (~20%) | ~1 KB gz (~5%) | ~4 KB gz (~20%) |
| `Cell` | ~5 KB gz (~22%) | ~2 KB gz (~11%) | ~5 KB gz (~22%) |
| `Frame` | ~4 KB gz (~22%) | ~1 KB gz (~6%) | ~4 KB gz (~22%) |
| `Threshold` | ~3 KB gz (~11%) | ~5 KB gz (~15%) | n/a |
| `Trail` / `Vector` / `Link` | ~3 KB gz (~11–13%) | ~3–4 KB gz (~15–17%) | n/a |
| `AnnotationLine` / `AnnotationPoint` / `AnnotationRange` | ~3–4 KB gz (~9–11%) | ~3–6 KB gz (~9–14%) | n/a |
| `Labels` | ~4 KB gz (~12%) | ~4 KB gz (~10%) | ~5 KB gz (~13%) |
| `ChartClipPath` | ~0.5 KB gz (~5%) | ~0.8 KB gz (~7%) | ~0.8 KB gz (~6%) |
| `CircleClipPath` | ~0.5 KB gz (~25%) | ~0.8 KB gz (~37%) | ~0.7 KB gz (~33%) |
| `Density` / `Contour` / `Raster` | ~1–3 KB gz (~3–8%) | ~1–3 KB gz (~4–8%) | `Raster` only on html (~4%) |
| `Violin` / `BoxPlot` | ~4 KB gz (~13–16%) | ~3–4 KB gz (~12–13%) | n/a |
| `Calendar` / `Month` | ~1–3 KB gz (~3–10%) | ~2 KB gz (~5–7%) | n/a |
| `Hull` / `Voronoi` | ~0 KB | ~0–0.5 KB gz | n/a |

`Hull` and `Voronoi` show no per-layer wins because their cost is dominated by the d3 algorithm rather than the rendering path.

### Geo components

Geo marks live on `layerchart/geo` (and `layerchart/geo`-prefixed variants like `layerchart/svg` re-export them too).

| Component | Svg-only saves | Canvas-only saves |
| --- | --- | --- |
| `GeoPath` | ~3 KB gz (~12%) | ~5 KB gz (~18%) |
| `GeoSpline` | ~3 KB gz (~10%) | ~4 KB gz (~14%) |
| `GeoPoint` | ~3 KB gz (~18%) | ~1 KB gz (~6%) |
| `GeoCircle` | ~3 KB gz (~12%) | ~5 KB gz (~17%) |
| `GeoTile` / `TileImage` | ~3 KB gz (~9%) | ~2 KB gz (~5–6%) |
| `Graticule` | ~3 KB gz (~12%) | ~3 KB gz (~11%) |
| `GeoClipPath` | ~0.3 KB gz (~7%) | ~0.6 KB gz (~13%) |
| `GeoEdgeFade` | ~0.5 KB gz (~2%) | ~0.7 KB gz (~3%) |

### High-level chart wrappers

`<LineChart>`, `<AreaChart>`, `<BarChart>`, `<ScatterChart>`, `<PieChart>`, and `<ArcChart>` are pre-composed charts — they include `<Chart>` itself plus the appropriate marks, tooltip wiring, highlight handling, and series management. Importing a high-level chart from a per-layer sub-path skips both the chart wrapper's layer dispatch *and* every primitive/mark it composes, so the savings are larger than any single primitive.

| Chart | Agnostic | `from 'layerchart/svg'` | `from 'layerchart/canvas'` |
| --- | --- | --- | --- |
| `LineChart` | 89.6 KB gz | 79.0 KB gz (-12%) | 80.7 KB gz (-10%) |
| `AreaChart` | 87.3 KB gz | 81.2 KB gz (-7%) | 82.8 KB gz (-5%) |
| `BarChart` | 85.4 KB gz | 79.2 KB gz (-7%) | 80.9 KB gz (-5%) |
| `ScatterChart` | 84.5 KB gz | 78.1 KB gz (-8%) | 79.8 KB gz (-6%) |
| `PieChart` | 91.9 KB gz | 85.3 KB gz (-7%) | 86.9 KB gz (-5%) |
| `ArcChart` | 90.7 KB gz | 84.2 KB gz (-7%) | 85.9 KB gz (-5%) |

```ts
// Agnostic — supports Svg / Canvas / Html
import { LineChart } from 'layerchart';

// SVG-only
import { LineChart } from 'layerchart/svg';

// Canvas-only
import { LineChart } from 'layerchart/canvas';
```

There is no `layerchart/html` variant for the high-level charts because the marks they compose (`<Spline>`, `<Bars>`, `<Area>`, `<Pie>`, `<Arc>`) don't have a pure HTML rendering. Importing `LineChart` from `layerchart/html` falls back to the agnostic dispatcher.

## Worst case: importing everything

If you `import * as LayerChart from 'layerchart'` (or your bundler can't tree-shake at all), you'll pay for the entire surface area of the root barrel — currently around 232 KB gz across all components. The strategies above exist precisely to keep this from happening for typical consumers.

If you're not sure what your bundle looks like in practice, run a tool like [`rollup-plugin-visualizer`](https://github.com/btd/rollup-plugin-visualizer) or `vite build --mode=production` with source maps and inspect the output.

## Reference: scenario sizes

The numbers below are gzipped totals from LayerChart's own bundle analyzer. They represent the cost of importing the listed components from `'layerchart'` (or the sub-path when noted), measured against a minimal Svelte app with Svelte's own runtime treated as external.

| Scenario | Imports | Gzipped |
| --- | --- | --- |
| `base` | `Chart` | ~83 KB |
| `base-svg` (per-layer) | `Chart`, `Svg` from `layerchart/svg` | ~77 KB |
| `base-canvas` (per-layer) | `Chart`, `Canvas` from `layerchart/canvas` | ~79 KB |
| `base-html` (per-layer) | `Chart`, `Html` from `layerchart/html` | ~79 KB |
| `core` | `ChartCore` (no Axis/Grid/Highlight) | ~51 KB |
| `core-svg` (per-layer) | `ChartCore`, `Svg` from `layerchart/svg` | ~51 KB |
| `core-geo` | `ChartCore`, `Svg`, `GeoProjection`, `GeoPath` | ~55 KB |
| `line-chart` | `Chart`, `Svg`, `Line`, `Axis`, `Grid` | ~83 KB |
| `LineChart` | high-level `LineChart` | ~90 KB |
| `LineChart-svg` (per-layer) | high-level `LineChart` from `layerchart/svg` | ~79 KB |
| `geo` (sub-path) | `Chart`, `Svg`, `GeoProjection`, `GeoPath`, `GeoPoint` | ~87 KB |
| `force` (sub-path) | `Chart`, `Svg`, `ForceSimulation`, `Link`, `Circle`, `Text` | ~94 KB |
| `dagre` (sub-path) | `Chart`, `Svg`, `Dagre`, `Link`, `Circle`, `Text` | ~109 KB |
| `circle-svg` (per-layer) | `Circle` from `layerchart/svg` | ~13 KB |
| `circle-agnostic` | `Circle` from `layerchart` | ~17 KB |
| `text-svg` (per-layer) | `Text` from `layerchart/svg` | ~16 KB |
| `text-agnostic` | `Text` from `layerchart` | ~29 KB |

`base` is the cost of `<Chart>` (with the cartesian frame baked in) — what every cartesian chart pays. `core` is the cost of `<ChartCore>` — what geo and custom-layout charts pay instead.

## Background: how LayerChart minimizes baseline cost

If you want to dig deeper, every release of LayerChart runs an automated bundle analyzer ([`bundle-analyzer/`](https://github.com/techniq/layerchart/tree/main/bundle-analyzer) in the repo) across ~25 representative scenarios and posts the per-scenario size to PR comments. The CI guards against unintended bundle regressions and lets us continue to land lazy-loading and code-split improvements without slowing the default chart down.
