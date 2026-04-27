---
title: Bundle Size
description: How to reduce LayerChart's footprint in your application bundle
category: advanced
---

LayerChart ships a layer-agnostic, batteries-included API by default — `<Chart>` works with `<Svg>`, `<Canvas>`, and `<Html>` rendering, primitives like `<Circle>` and `<Rect>` auto-detect the surrounding layer, and chart-level features like brushing, tooltips, and tile maps activate when you pass the right prop.

That flexibility has a cost: every consumer of `import { Chart } from 'layerchart'` would otherwise pay for code paths they may never reach. To keep the default bundle small, LayerChart uses three layered strategies:

1. **Lazy-loaded opt-in features** — Heavy features are dynamically imported only when activated
2. **Sub-path exports for heavy dependencies** — Components that pull in big external deps live behind opt-in sub-paths
3. **Per-layer primitive variants** — Layer-agnostic primitives have SVG/Canvas/HTML-specific variants for users who commit to one layer

The first two cost you nothing — they're transparent. The third is opt-in: you swap an import to get a smaller bundle in exchange for losing layer flexibility on that import.

## What you get for free

The following heavy features are loaded only when you use them, with no code change required from you:

| Feature | When it loads |
| --- | --- |
| `<BrushContext>` (and brush state) | When `<Chart brush={...}>` is set |
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

## Per-layer primitive variants (opt-in)

Layer-agnostic primitives — components like `<Circle>`, `<Rect>`, `<Line>`, `<Path>`, `<Text>` — auto-detect the surrounding layer (`<Svg>`, `<Canvas>`, or `<Html>`) and render appropriately. To do this they bundle all three rendering paths.

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

### When per-layer is worth it

- ✅ You're building many charts in a single layer (most likely SVG)
- ✅ You're shipping to a bandwidth-sensitive context (mobile, embedded views, AMP-style pages)
- ✅ You want to sketch out the absolute minimum bundle for a specific use case

### When to stay on the agnostic API

- 🤷 You mix layers in the same project (some charts SVG, some Canvas)
- 🤷 Your bundle savings would be small relative to the rest of your app
- 🤷 You value the flexibility to swap a chart's rendering layer later without touching imports

### Components currently split

| Primitive | Svg-only saves | Canvas-only saves | Html-only saves |
| --- | --- | --- | --- |
| `Circle` | ~4 KB gz (~25%) | ~1 KB gz (~7%) | ~4 KB gz (~22%) |
| `Text` | ~13 KB gz (~45%) | ~2 KB gz (~8%) | ~13 KB gz (~46%) |

More primitives (`Rect`, `Line`, `Path`, `Bar`) are planned. The pattern follows the same shape — we'll add to the table as they land.

## Worst case: importing everything

If you `import * as LayerChart from 'layerchart'` (or your bundler can't tree-shake at all), you'll pay for the entire surface area of the root barrel — currently around 240 KB gz across all components. The strategies above exist precisely to keep this from happening for typical consumers.

If you're not sure what your bundle looks like in practice, run a tool like [`rollup-plugin-visualizer`](https://github.com/btd/rollup-plugin-visualizer) or `vite build --mode=production` with source maps and inspect the output.

## Reference: scenario sizes

The numbers below are gzipped totals from LayerChart's own bundle analyzer. They represent the cost of importing the listed components from `'layerchart'` (or the sub-path when noted), measured against a minimal Svelte app with Svelte's own runtime treated as external.

| Scenario | Imports | Gzipped |
| --- | --- | --- |
| `core` | `Chart`, `Svg` | ~106 KB |
| `line-chart` | `Chart`, `Svg`, `Line`, `Axis`, `Grid` | ~106 KB |
| `geo` (sub-path) | `Chart`, `Svg`, `GeoProjection`, `GeoPath`, `GeoPoint` | ~109 KB |
| `force` (sub-path) | `Chart`, `Svg`, `ForceSimulation`, `Link`, `Circle`, `Text` | ~114 KB |
| `dagre` (sub-path) | `Chart`, `Svg`, `Dagre`, `Link`, `Circle`, `Text` | ~129 KB |
| `circle-svg` (per-layer) | `Circle` from `layerchart/svg` | ~13 KB |
| `circle-agnostic` | `Circle` from `layerchart` | ~17 KB |
| `text-svg` (per-layer) | `Text` from `layerchart/svg` | ~16 KB |
| `text-agnostic` | `Text` from `layerchart` | ~29 KB |

`core` is what every chart pays. The other rows show what specific feature additions cost on top.

## Background: how LayerChart minimizes baseline cost

If you want to dig deeper, every release of LayerChart runs an automated bundle analyzer ([`bundle-analyzer/`](https://github.com/techniq/layerchart/tree/main/bundle-analyzer) in the repo) across ~25 representative scenarios and posts the per-scenario size to PR comments. The CI guards against unintended bundle regressions and lets us continue to land lazy-loading and code-split improvements without slowing the default chart down.
