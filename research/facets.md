# Facets — research

Goal: partition a dataset by one or two categorical fields and repeat the plot for each partition
("small multiples"), with **position scales shared across every panel** so the panels are
comparable.

---

## 0. Status (as of 2026-08-15)

**Phases 0–4 are built** (see §4 for what each took) — `fx` / `fy` faceting, per-panel axes with
edge rules, facet-aware tooltips / `Highlight` / brushing. Zoom (`transform`) and Plot's
`facet: 'exclude'` mode remain. The original framing, unchanged:

**Facets are a single `<Chart>`**, subdividing one plot area with `fx` / `fy` band scales — not N
charts wired together. This is what "facet" means to anyone arriving from ggplot2, Vega-Lite, Plot,
or SveltePlot, and it is the only form that gets shared scales for free (see §2).

The consequence for `ChartGroup` is that the two are **orthogonal** and nothing about the group
needs to change — see §3.6.

---

## 1. How other libraries do it

### The grammar-of-graphics lineage

| Library                  | API                                                                                                    | Shared scales                                                                                          | Layout control                                                                           |
| ------------------------ | ------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------- |
| **ggplot2** (the origin) | `facet_wrap(vars(x), nrow, ncol, dir, drop)` and `facet_grid(rows, cols)`                              | `scales = "fixed"` (default) / `"free"` / `"free_x"` / `"free_y"`; `space` sizes panels to their scale | `strip.position` (top/bottom/left/right), `labeller`                                     |
| **Vega-Lite**            | `facet` operator (`{ facet, spec }`), or the `row` / `column` / `facet` encoding channels as shorthand | shared by default; `resolve: { scale: { x: 'independent' } }` per scale/axis/legend                    | `columns` for wrapping, `spacing` (20px default), `align`, `center`, `header` for labels |
| **Observable Plot**      | `fx` / `fy` channels, or plot-level `facet: { data, x, y, margin*, grid, label }`                      | always shared — that's the point                                                                       | `fx`/`fy` are band scales taking `padding`, `round`, `align`                             |
| **SveltePlot**           | `fx` / `fy` channels, mirroring Plot                                                                   | always shared                                                                                          | `fx.paddingInner` / `fx.padding` (0.1 default)                                           |
| **Plotly Express**       | `facet_row`, `facet_col`, `facet_col_wrap`                                                             | axes linked by default; `matches=None` to unlink                                                       | `facet_row_spacing` / `facet_col_spacing` as fractions; subplot titles are annotations   |
| **G2**                   | has faceting (`rect`, `list`, `circle`, `mirror`, `matrix` variants)                                   | —                                                                                                      | — (docs were unreadable; not verified)                                                   |

**Plot's `facet` mark option** is the most refined bit of API in the group — it controls how a
mark's data associates with facets:

| Value                | Behavior                                                                            |
| -------------------- | ----------------------------------------------------------------------------------- |
| `'auto'` _(default)_ | Facet if `fx`/`fy` channels are present                                             |
| `'include'`          | Draw only this facet's subset                                                       |
| `'exclude'`          | Draw everything _not_ in this facet (great for a faded "all other points" backdrop) |
| `'super'`            | One frame spanning all facets                                                       |
| `null` / `false`     | Repeat the whole mark in every facet (reference lines, annotations)                 |

Documented caveats worth stealing awareness of: `include`/`exclude` require the mark's data to be
_parallel_ to the facet data (same length and order) or the wrong rows are drawn; and facet
channels are resolved _before_ mark transforms, so you can't facet on a transform's output.

### SveltePlot's implementation — the closest analogue

Same framework, same grammar, so its structure is the best available evidence of what this costs.
Six source files: `core/Facet.svelte`, `core/FacetGrid.svelte`, `core/FacetAxes.svelte`,
`helpers/facets.ts`, `transforms/facet.ts`, `types/facet.ts`.

- **`FacetGrid`** builds `scaleBand()` for `fx` and `fy` over the full plot area
  (`paddingInner` defaulting to `0.1`, `rangeRound([0, plotWidth])`), then loops
  `{#each fxValues}{#each fyValues}` rendering a `<Facet>` per combination.
- **It then calls `updateDimensions(facetWidth, facetHeight)`** — the plot's dimensions are
  _replaced_ by one facet's box, so every downstream position scale is sized to a single panel.
  This is the central move, and it's what makes the rest fall out.
- **`Facet`** provides a context with two members: `getTestFacet()`, returning a predicate for
  whether a datum belongs to this panel, and `getFacetState()`.
- **`FacetState` carries edge flags** — `left`, `top`, `right`, `bottom`, plus `topEmpty`,
  `bottomEmpty`, `leftEmpty`, `rightEmpty`. These exist purely so axes render only on outer edges
  (and on inner edges adjacent to a gap).
- **`getEmptyFacets()`** tracks `fx × fy` combinations with no rows, since a crossed facet grid is
  usually sparse.
- **Pointer/tooltip is keyed per facet.** `facetKey(fx, fy)` is documented as the key for "the
  keyed tree map in Pointer/HTMLTooltip" — i.e. **one search structure per panel**. And
  `invertBand()` exists because `d3.scaleBand` has no `.invert()`: given a pixel, iterate the
  domain (they note O(n) with n < 20 typically) to find which facet the pointer is in.

### Cross-cutting lessons

1. **Shared position scales are the entire point.** Every library defaults to shared and treats
   independent scales as the opt-out. Don't build per-facet domains first.
2. **The layout is two band scales.** Universally. `fx`/`fy` over the plot area, panels sized to
   `bandwidth()`, panels translated to the band start.
3. **Facet-relative dimensions, not facet-relative code.** SveltePlot swaps the dimensions and
   leaves marks untouched. Anything that hard-codes "the plot is the full width" breaks.
4. **Axes need edge awareness, not per-panel axes.** Outer edges only, plus the empty-neighbour
   cases. This is where the fiddly detail lives.
5. **Hit-testing is per facet.** Resolve which panel the pointer is in (band inversion), then
   search only that panel's rows. A global nearest-datum search returns points from other panels.
6. **Sparse grids are normal.** Crossing two fields usually leaves empty cells; Plot added
   `facetAnchor` (v0.6.3) specifically for axis placement around them.

---

## 2. Where LayerChart stands today

No facet support, and no small-multiples helper.

### What already exists (more than expected)

- **Position scale ranges already accept a function of the box** —
  `xRange` / `yRange` may be `({ width, height }) => number[]`
  (`utils/chart.ts:479`, `getDefaultRange`). Sizing scales to a panel needs no new machinery.
- **`Group` translates children on every layer.** SVG `transform`, canvas via `ctx.translate()`
  inside the render tree (`components/Group/Group.base.svelte:14`), and HTML. **Facet layout is a
  solved primitive, including on canvas** — which is the part that usually isn't.
- **Domains already span the whole dataset.** `flatData` derives from `props.data`
  (`states/chart.svelte.ts:507`), and marks with their own `data` _extend_ it via `MarkInfo`
  rather than narrowing it. So filtering marks per panel does **not** shrink the shared domain —
  scales come out shared for free. This is the single biggest advantage of the single-chart model.
- **`Highlight` repeats across facets at no cost.** It derives everything from `ctx.tooltip.data`
  plus `ctx.xScale` / `ctx.yScale` (`components/Highlight/Highlight.shared.svelte.ts:131,136-155`),
  so one inside each facet's translated `Group` draws the crosshair in the right place in every
  panel, canvas included.
- **`ChartClipPath`** exists for per-panel clipping.
- **The lazy-context pattern** (`Chart.base.svelte:463-475`) is the precedent for making faceting
  cost non-faceted charts nothing.

### What blocks it

| Blocker                                     | Where                                                     | Notes                                                                                                                       |
| ------------------------------------------- | --------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| No `fx` / `fy` scales or layout             | —                                                         | New, but mechanical; `ChartState` already has a per-axis scale/domain/range family to copy                                  |
| `width` / `height` are the whole plot       | `states/chart.svelte.ts:706` (`$derived(this.box.width)`) | Everything downstream reads these. Redefining them as the _facet_ box is the highest-leverage change — see §3.1             |
| Single tooltip hit area over the whole plot | `components/tooltip/TooltipContext.svelte:731`            | Rendered once, in `Chart.base.svelte`'s `inner()` snippet, wrapping everything                                              |
| Datum resolution is global                  | `utils/tooltip.ts:130-144`                                | Bisects `ctx.flatData` across all panels; `quadtree*` modes need one tree per panel                                         |
| `Axis` reads full-plot dimensions           | `components/Axis/Axis.shared.svelte.ts:256-259,433-445`   | Tick placement follows `ctx.xRange`/`yRange` (fine), but orientation length and label centring use `ctx.width`/`ctx.height` |
| Brush assumes one plot area                 | `components/BrushContext.svelte:205-212,335-338`          | Same shape of problem as the tooltip                                                                                        |

---

## 3. Proposal

### 3.1 Redefine `width` / `height` as the facet box

Follow SveltePlot's `updateDimensions`. `box` stays the full plot area (container minus padding);
`width` / `height` become one panel's dimensions, equal to `box.width` / `box.height` when not
faceting.

Everything that positions marks, builds scales, or draws a `Highlight` then works unmodified,
because it already works relative to `width`/`height` and gets offset by the enclosing facet
`Group`. This is one small change that buys most of §1's lesson 3.

It needs an **audit of every `ctx.width` / `ctx.height` consumer** to split "how big is a panel"
from "how big is the plot". The known full-plot consumers are the tooltip hit area, the brush hit
area, and `Axis` label centring.

### 3.2 `fx` / `fy` accessors + a `facet` options object

Matches both Plot and LayerChart's own conventions (`x`, `y`, `z`, `r`, `c` accessors; `brush`,
`transform`, `geo` option objects):

```svelte
<Chart {data} x="date" y="value" fx="species" facet={{ padding: 0.1 }}>
```

`ChartState` gains `fxScale` / `fyScale` (band scales over `box`), `facetWidth` / `facetHeight`
(`bandwidth()`), and a `facets` array of `{ fx, fy, x, y, width, height, left, top, right, bottom, empty }`
— the edge flags being SveltePlot's, since they're what per-facet axes need.

### 3.3 Per-facet data via context

A `FacetContext` exposing the current panel's key, edge flags, and its **already-filtered** rows.
Marks default to it exactly as they default to `ctx.data` today, so most marks need no change. A
mark that should repeat in every panel (a reference rule, an annotation) passes its own `data`,
which is Plot's `facet: null`.

Plot's `exclude` mode is worth having eventually — the faded all-other-points backdrop is one of
the most compelling facet idioms — but it isn't needed for a first pass.

### 3.4 Tooltip

`TooltipState` stays **singular per chart**. With `Highlight` inside each panel (§2), that yields
**crosshair in every facet, tooltip content in the hovered one** — which is the Grafana
shared-crosshair distinction the group already models with `pointer: { tooltip: false }`.

Two pieces of real work:

1. **Hit region per facet.** Either render the tooltip's hit area inside each facet `Group` (which,
   with §3.1, sizes itself correctly with no extra math), or keep one region and resolve the panel
   by inverting the `fx`/`fy` band scales — SveltePlot needs an `invertBand` helper for this
   because `scaleBand` has no `invert`.
2. **Scope resolution to the panel.** `findDatum` / `findDatumByValue` take the facet's rows rather
   than `ctx.flatData`, and `quadtree*` modes key one tree per facet.

Phase 0 of the chart-sync work already extracted `findDatumByValue` / `dataCoords` into
`utils/tooltip.ts` against a narrow `ctx` shape, so (2) is mostly a matter of what gets passed in.

### 3.5 Axes, brush, zoom

Axes: an explicit box/range override plus the edge rules from §3.2. Brush: same shape of problem as
the tooltip, and deferrable. Zoom (`transform`): Plotly links facet axes by default and makes
unlinking opt-in — worth copying, and it's also the cheap option since one shared scale means one
transform.

### 3.6 Relationship to `ChartGroup`

**Nothing changes.** A faceted chart is one `Chart` with one `id`, so a group of faceted charts
already works, and the shared-base-domain gap that small-multiples-via-`ChartGroup` would have
needed does not arise — inside one chart `flatData` spans every panel (§2).

Two notes for whoever builds this:

- ~~A **group-driven pointer on a faceted chart should be crosshair-only**~~ — not needed. The
  tooltip does have an obvious home: the panel holding the row it resolved to. `dataCoords` offsets
  into that panel, and `Highlight.inPanel` puts the point there too, so a faceted follower behaves
  like any other. `TooltipState.suppressed` stays for `pointer: { tooltip: false }`.
- `ChartGroupPointer.source` identifies a **chart**, not a panel. If per-facet identity ever needs
  to reach the group, that's where it goes — but don't add it speculatively.

---

## 4. Suggested phasing

| Phase | Scope                                                                                                               | Independently valuable?                      |
| ----- | ------------------------------------------------------------------------------------------------------------------- | -------------------------------------------- |
| **0** | Redefine `width`/`height` as the facet box; audit and fix full-plot consumers                                       | No — but unblocks everything, and is small   |
| **1** | `fx`/`fy` accessors, band scales, `FacetContext`, facet `Group` layout, per-facet marks — **static faceted charts** | **Yes** — this is the feature for most users |
| **2** | Per-facet axes with edge rules, facet labels / headers, empty-facet handling                                        | Yes                                          |
| **3** | Tooltip + highlight facet-awareness (hit regions, scoped resolution, per-facet quadtrees)                           | Yes — **built**                              |
| **4** | Brush **(built)**; zoom/transform and Plot's `facet: 'exclude'` mode remain                                         | Yes                                          |

Phases 0–2 are the bulk of the _value_ and the minority of the _risk_, because the primitives
exist. Phase 3 touches the two most interaction-heavy files in the library and is where the
schedule will actually go.

**What Phases 3–4 actually took** (all built):

- `FacetState.panelAt(x, y)` (the point → panel lookup, testing panel rects since `scaleBand` has
  no `invert`) and `panelFor(datum)` (keyed, O(1)). Both interactions resolve through these.
- One hit region, not one per panel. `TooltipContext` and `BrushContext` each sized their overlay
  to `ctx.width`/`height` — which Phase 0 redefined as *one panel* — so both were confined to the
  first panel before this. They now span `ctx.box` and resolve the panel from the point.
- **One quadtree per panel.** Panels share the scales, so their points occupy the same coordinates;
  a single tree returns the nearest across all of them. Offsetting each point by its panel instead
  was tried first and breaks `quadtree-x`/`-y`, where the flattened axis makes a neighbouring
  panel's point closer than the hovered panel's.
- `bounds`/`band` rects and the `voronoi` diagram render *inside* the layer, so they were already
  repeating per panel — they just needed their rows narrowed to the panel.
- `Highlight` stays in the hovered panel by default — crosshair included. Drawing the crosshair in
  every panel was tried first (the Grafana shared-crosshair reading) and reverted: it left `lines`
  and `points` with different defaults, so `facetAll` only governed half the component. One switch
  now means "the hovered *position*, in every panel", and covers the tooltip as well.
- Tooltips shown *by value or data* rather than by point — `tooltip.show({ value })`, and every
  `ChartGroup` follower — needed `dataCoords` offset into the row's panel, or they positioned as
  if every row were in the first panel. This is what §3.6's "no obvious home" concern turned out
  to need; suppressing the follower's tooltip was not necessary.
- The brush gesture belongs to the panel it *starts* in, and the selection it produces is a range
  of the shared scales — so it applies to, and is drawn in, every panel.

---

## 5. Open questions

1. **Independent scales** (`scales: 'free'` / `resolve: 'independent'`). Out of scope initially —
   shared scales are the point — but the API should leave room.
2. **Wrap vs grid.** `facet_wrap` / Plot's `columns` (a 1-D sequence flowed into 2-D) is a separate
   layout from the `fx × fy` cross. Ship the cross first?
3. **Simplified charts.** Do `LineChart` / `BarChart` accept `fx`/`fy`, or is faceting
   composable-only to begin with?
4. **Canvas hit-testing.** `Group` translates the canvas render tree, but per-facet pointer
   resolution on canvas needs checking against the existing event dispatch.
5. **Legends.** Already one per `Chart` and shared — confirm nothing assumes full-plot width.
6. **Default highlight behaviour** — crosshair in every panel, or only the hovered one? §3.4
   proposes every panel; worth validating against real dashboards.
7. **Sparse grids.** Empty `fx × fy` combinations and the axis placement around them
   (Plot's `facetAnchor`).
8. **Motion.** Domain motion (`ChartState._xDomainMotion`) and facet count changing at runtime.
9. **Pixel panel gaps.** `facet.padding` is a fraction of a panel (Plot parity — `fx` / `fy` are
   band scales, default `0.1`), so the gap shrinks as panels are added, and the same value gives
   different x/y gaps on a non-square plot. Vega-Lite (`spacing: 20`) and ggplot2 (`panel.spacing`)
   use pixels instead. Deferred: `padding: 20` could mean pixels under the `< 1` fraction /
   `>= 1` pixel convention already used for `Arc` radius — `paddingInner = gap * n / (size + gap)`.

---

## Sources

- [Observable Plot — Facets](https://observablehq.com/plot/features/facets)
- [SveltePlot source](https://github.com/svelteplot/svelteplot) — `packages/svelteplot/src/core/{Facet,FacetGrid,FacetAxes}.svelte`, `src/helpers/facets.ts`, `src/types/facet.ts`
- [Vega-Lite — Facet](https://vega.github.io/vega-lite/docs/facet.html) · [`resolve`](https://vega.github.io/vega-lite/docs/resolve.html)
- [ggplot2 — `facet_wrap`](https://ggplot2.tidyverse.org/reference/facet_wrap.html) · [`facet_grid`](https://ggplot2.tidyverse.org/reference/facet_grid.html)
- [Plotly Express — Facet and trellis plots](https://plotly.com/python/facet-plots/)
- [G2 — Facet](https://g2.antv.antgroup.com/en/manual/core/facet/overview) (not verified — page did not render for extraction)
