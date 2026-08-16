# Chart synchronization — research

Goal: synchronize state between two or more charts — tooltip/crosshair first, but also brush,
zoom/domain, legend highlight & visibility, and data selection — with an API that also works for
consumers that are **not** a `<Chart>`.

---

## 0. Status (as of 2026-08-14)

Phases 0–2 and the **series half of Phase 3** are **built, tested, and documented**. Sections 1–2
below are the original research and still accurate; section 3 onward is the original *proposal* and
has been overtaken in places by what actually shipped — trust the code and
`docs/src/content/guides/chart-group.md` over it.

**Shipped**

- **Phase 0** — value-addressed tooltips: `tooltip.show({ point, value, data })` plus the extracted
  `findDatumByValue` / `dataCoords` in `utils/tooltip.ts`.
- **Phase 1** — `ChartGroupState`, `<ChartGroup>`, `group` / `groupOptions` props, user-settable
  chart `id`, the `pointer` slice.
- **Phase 2** — `brush` and `domain` slices.
- **Phase 3a** — `series` slice: legend highlight and visibility, plus `SeriesState.setHighlight` /
  `highlightSource` / `onHighlightChange`.
- Seven examples under `docs/src/examples/components/ChartGroup/` and a guide.

**Design rules that emerged** (each is commented at its site — don't re-derive them):

- Publishing is an **event**, subscribing is a **derivation**. Publishing can't be an effect: two
  charts briefly hold locally-shown data while a pointer moves between them, and state alone
  can't say which one the pointer actually moved to.
- Group state is `$state.raw`. `$state` deep-proxies, so a datum read back out is never `===` the
  one that went in — which silently breaks identity guards and `flatData.indexOf`.
- Calling `BrushState.move()` / `reset()` inside an effect needs `untrack` — they read `x`/`y` and
  write them, so the effect invalidates itself.
- Precedence lists can't express **recency**. An applied group domain releases the chart's own
  earlier brush zoom so the most recent interaction wins.
- `clearPointer` is owner-gated (every chart's effect evaluates it); `clearBrush` / `clearDomain`
  are not (only a deliberate gesture reaches them).
- Any method added to a state class needs a matching entry in `ChartState`'s `#fallback*` objects,
  or it throws on first paint while the lazy context loads.
- A slice with two independent channels needs a **source per channel**, not per slice — `series`
  carries `highlightSource` and `visibilitySource` so a chart owning the highlight stays its owner
  while another toggles visibility.
- Group slices are named after the chart state they mirror — `group.series` reads like
  `context.series`, `group.brush` like `context.brush`. That symmetry is worth more than making
  every slice share one `{ active, source }` envelope type: splitting `series` into `highlight` /
  `visibility` slices to fit such an envelope was tried and reverted, because it broke the
  correspondence and `group.highlight.key` reads worse than `group.series.highlightKey`.
- Share visibility as **hidden** keys, not visible ones, and merge rather than replace. A chart only
  ever speaks for the keys it has; publishing *visible* keys would have a chart with an unrelated
  metric repeatedly claim everything else is hidden.
- Highlight publishing is an event (`SeriesState.onHighlightChange`) for the same reason as the
  pointer; visibility publishing is a plain `$effect`, because hiding a series is a deliberate
  toggle rather than a gesture two charts can be mid-way through at once.

**Open, roughly by priority**

1. **Phase 3b** — `selection` slice (cross-filtering). Not started, and the shape is still open:
   there is no chart-side "selected data" concept for a subscriber to drive, so it's either shared
   state plus helpers that consumers wire up themselves (the Crosstalk model), or it grows a
   chart-side selection first.
2. `transform={{ mode: 'domain' }}` charts publish their zoom but don't apply a shared one — the
   transform narrows the domain itself, so the two fight. Documented in the guide.
3. ~~Duplicate user-supplied `id`s are indistinguishable as `source`; no guard or warning.~~
   `ChartGroupState.join()` now tracks member ids and `console.warn`s on a collision (`Logger`
   stays silent unless enabled, so it's the wrong tool for something a user must see).
4. Bundle cost **to charts** is unmeasured. `bundle-analyzer/bundle-reports/latest.json` is from
   2026-07-01, so comparing against it attributes six weeks of unrelated work to this. Needs a
   main-vs-branch run. (Verified structurally that the group can't reach non-chart components.)
5. Pointer throttling at 60fps x N charts is unmeasured.

---

## 1. How other libraries do it

### Group-key registries (most common)

| Library | API | Synced | Notes |
| --- | --- | --- | --- |
| **ECharts** | `chart.group = 'g1'` + `echarts.connect('g1')` (also `echarts.disconnect`) | tooltip/axisPointer, dataZoom, legend, restore, brush | Actions are re-dispatched to every chart in the group. Separately, `axisPointer.link` coordinates pointers *within* one instance across grids. |
| **ApexCharts** | `chart.group: 'g1'` (+ required unique `chart.id`) | tooltip, crosshair, zoom, pan | Documented caveat: y-axis label widths must match (`yaxis.labels.minWidth`) or the plot areas misalign and hover lands on the wrong x. Pixel-alignment dependent. |
| **Recharts** | `syncId="g1"`, `syncMethod="index" \| "value" \| fn(tick, data)` | tooltip, brush | Default `index` requires equal-length data. `value` matches on the categorical axis value. Custom fn returns an index. |
| **Chart.js** (`chartjs-plugin-crosshair`) | `plugins.crosshair.sync: { enabled, group, suppressTooltips }` | crosshair, zoom | `suppressTooltips` = show the crosshair on followers but not the tooltip. |
| **uPlot** | `cursor.sync: { key, setSeries, scales, match, filters: { pub, sub } }` + `uPlot.sync(key)` | cursor, series focus/toggle, scales | **Best-designed of the bunch** — see below. |

### uPlot's `cursor.sync` — the reference design

- `key` — group name; all charts sharing it are wired together.
- `scales: [xKey, yKey]` — which scales sync **by value**; `null` on an axis means sync by
  **relative (%) position** instead. This one option cleanly covers both "same domain" and
  "unrelated domains, same shape" cases.
- `setSeries` — whether series focus/toggle also propagates.
- `match: [xScaleMatcher, yScaleMatcher, seriesIdxMatcher]` — predicate functions deciding whether
  a publisher's scale/series corresponds to a subscriber's.
- `filters: { pub, sub }` — per-chart gate on *publishing* vs *subscribing*. Lets a chart be
  broadcast-only or listen-only.

The `pub`/`sub` split and the value-vs-percent switch are the two ideas most worth stealing.

### Explicit instance wiring

| Library | API | Notes |
| --- | --- | --- |
| **dygraphs** | `Dygraph.synchronize([g1, g2, g3], { selection, zoom, range })` → returns `{ detach() }` | Opt-in per concern. `range: false` syncs x only. Guards re-entrancy with a redraw block flag. |
| **TradingView lightweight-charts** | `subscribeCrosshairMove` → `setCrosshairPosition(price, time, series)`; `timeScale().subscribeVisibleLogicalRangeChange` → `setVisibleLogicalRange` | Two independent channels: crosshair (by value) and visible range (by logical index). Known bug: crosshair drifts while scrolling because it's re-applied by *value* against a moving viewport. |
| **Highcharts** | No built-in. Official demo: page-level `mousemove` → for each chart, `chart.pointer.normalize(e)` → `series.searchPoint()` → `point.onMouseOver()` + `tooltip.refresh()` + `axis.drawCrosshair()`; and monkey-patch `Pointer.prototype.reset` to a no-op so followers don't clear. | Hover is re-resolved *inside each chart* from a shared page pointer position. |
| **Syncfusion EJ2** | No built-in. Sample code: `chartMouseMove` → sibling `chart.showTooltip(x, y)` / `showCrosshair(x, y)`; `zoomComplete` → copy `currentZoomFactor`/`currentZoomPosition`; `selectionComplete` → copy `selectedDataIndexes`. | Pixel coordinates passed straight across — works only when plot areas align. |
| **CanvasJS** | No built-in. Sample: `toolTip.showAtX(x)` / `hideToolTip()` driven from the other chart's `updated`/mousemove. | Value-addressed (`showAtX`) — the cleanest of the "sample code" group. |
| **Plotly** | No built-in across graph divs. `plotly_hover` → `Plotly.Fx.hover(otherDiv, [{curveNumber, pointNumber}])`; `plotly_relayout` → `Plotly.relayout`. Within *one* figure, `xaxis.matches` links subplot axes. | `Fx.hover` has long-standing gaps with `hovermode: 'x unified'` and categorical axes. |

### Shared-state protocols (the "not necessarily a chart" model)

- **Crosstalk** (R/htmlwidgets) — a `SharedData` object with selection + filter channels that
  *heterogeneous* widgets (plotly, leaflet, DT tables) subscribe to. The widgets don't know about
  each other, only about the shared state. This is the closest existing analogue to the
  "sync things that aren't `<Chart>`" requirement.
- **Crossfilter / dc.js** — shared dimensional index; interactions filter the index, every chart
  re-renders from it. Cross-filtering rather than cursor sync.
- **Vega-Lite** — selection params with `resolve: 'global' | 'union' | 'intersect'`, and other
  views reference the param in `filter` transforms / conditional encodings / scale domains.
  Declarative coordination through a named parameter, not through chart handles.
- **Grafana** — dashboard-level setting with a meaningful three-way distinction:
  *default* / *shared crosshair* / *shared tooltip*. Panels publish a `DataHoverEvent` onto a bus.

### Cross-cutting lessons

1. **Value-addressed sync beats pixel-addressed sync.** Every library that passes pixels
   (ApexCharts, Syncfusion, Highcharts demo) inherits an alignment caveat. Libraries that pass a
   domain value (CanvasJS `showAtX`, uPlot value mode, Recharts `syncMethod: 'value'`) don't.
2. **Followers must re-resolve locally.** The follower looks up its *own* nearest datum and
   computes its *own* pixel position. Highcharts does this even though it shares a pixel position.
3. **Crosshair ≠ tooltip.** Grafana and `chartjs-plugin-crosshair` both expose the distinction; it's
   the most-requested refinement in every issue tracker.
4. **Publish/subscribe must be separable.** uPlot `filters.pub/sub`, dygraphs' per-concern flags.
   An overview/minimap chart typically publishes brush and subscribes to nothing.
5. **Echo suppression is mandatory.** dygraphs uses a redraw-block flag; uPlot skips the publisher.
   Getting this wrong is the #1 source of bugs in the hand-rolled implementations.
6. **Index matching is fragile.** Recharts' default `index` mode breaks on unequal-length series —
   a recurring complaint. Nearest-by-value should be the default.

---

## 2. Where LayerChart stands today

### What already exists

**Brush is already syncable, manually** — `docs/src/content/guides/brush.md` § "Syncing charts", and
`docs/src/examples/components/BrushContext/synced-brushes.svelte`:

```svelte
brush={{ x: xDomain, onChange: (e) => (xDomain = e.brush.x) }}
```

Shared `$state` + a controlled prop + a change callback. This works and is explicit, but it's
per-concern boilerplate and the pattern doesn't generalize to tooltip.

**Followers already re-derive from their own scales.** `Highlight` reads
`this.#props.data ?? this.ctx.tooltip.data` (`Highlight.shared.svelte.ts:131`) and computes every
coordinate from `ctx.xScale` / `ctx.yScale`. `Tooltip.svelte` supports `x="data"` / `y="data"`
(`Tooltip.svelte:234`, `:270`) to snap to the datum instead of the pointer. **So if a follower's
`tooltipState.data` is set, the crosshair and a data-snapped tooltip render correctly with zero
extra work.** This is the single most important existing fact — it makes lesson #2 above nearly free.

**States are already discrete, ownable classes** — `BrushState`, `TransformState`, `SeriesState`
(with `highlightKey` and a `SelectionState` for `selectedKeys`), `TooltipState`, `GeoState`. They're
constructed by `Chart.base.svelte` and hung off `ChartState`. A sync layer has clean seams to bind to.

**Interaction contexts are already lazy-loaded** — `Chart.base.svelte:429-447` dynamically imports
`TransformContext` / `BrushContext` only when the corresponding prop is set. A `group` prop can follow
the same pattern so non-syncing charts pay nothing.

### The one real gap

`TooltipState` can only be driven by a **pointer event**:

```ts
show: (e: PointerEvent | MouseEvent | TouchEvent, tooltipData?: any) => void
```

`TooltipContext.showTooltip` (`:247`) starts with
`localPoint(e, (e.target as Element).closest('.lc-root-container'))`, then runs the mode switch
(`bisect-x`, `bisect-y`, `bisect-band`, `quadtree*`) to find a datum, then builds `tooltipState.series`
and finally assigns `x`/`y`/`data`/`series`. There is no way to say "show the tooltip at x = this
Date" without synthesizing a fake event.

**Everything else about chart sync is comparatively mechanical. This is the piece to fix first —
and it's valuable on its own**, independent of sync: programmatic tooltips, keyboard/a11y
navigation, "show the tooltip at the latest point" on load, replay/scrubbing, and deterministic
tests all want a value-addressed entry point.

Minor gaps: `ChartState` has no stable identity (`id: symbol` at `chart.svelte.ts:62` belongs to
`ComponentNode`, not the chart) — needed to tag the publisher and suppress echo.

---

## 3. Proposal

### 3.1 Foundation — make the tooltip value-addressable

Extract the datum-finding logic out of `TooltipContext.showTooltip` into a pure helper, and give
`TooltipState.show` an event-free overload:

```ts
class TooltipState<T> {
  show(e: PointerEvent | MouseEvent | TouchEvent, data?: T): void  // existing
  show(options: {
    point?: { x: number; y: number };  // container-relative pixels
    value?: { x?: any; y?: any };      // domain values → resolve datum locally
    data?: T;                          // known datum → position from own scales
  }): void
  hide(e?: PointerEvent): void
}
```

Resolution is one rule rather than three methods — *what* to show is `data`, else `value`, else
whatever is found at `point` via `mode`; *where* is `point`, else the resolved datum's own
position. That also expresses `point` + `data` together (position here, show this datum), which
is what the existing `show(e, data)` does for annotations/voronoi/geo and what a set of separate
`showAtPoint` / `showAtValue` / `showAtData` methods could not.

Refactor targets in `TooltipContext.svelte`:
- the `switch (mode)` block → `findDatum(ctx, { x, y }, mode, { radius, findTooltipData, quadtree })`
- the `ctx.series.series.map(...)` block → `resolveTooltipSeries(ctx, datum, mode)`

Both become reusable by the sync layer and by users.

### 3.2 `ChartGroupState` — a shared-state object, not a wire between charts

Following the Crosstalk model and matching LayerChart's existing state-class idiom:

```ts
class ChartGroupState {
  pointer:   { x: any; y: any; data: any; active: boolean; source: symbol | null }
  brush:     { x: BrushDomainType; y: BrushDomainType; active: boolean; source: symbol | null }
  domain:    { x: DomainType | undefined; y: DomainType | undefined; source: symbol | null }
  series:    { highlightKey: string | null; selectedKeys: string[] }
  selection: { data: any[] }  // cross-filtering / click-select
}
```

Usage:

```svelte
<script>
  const group = new ChartGroupState({
    pointer: { match: 'value', axis: 'x', tooltip: true },
    domain: 'x',
    brush: true
  });
</script>

<LineChart {data} x="date" y="value" {group} />
<BarChart  {data} x="date" y="count" {group} />
```

**Why a state object rather than a group string or a wrapper component:**

- It directly answers *"some cases where we might not want to wrap Chart instances with ChartGroup
  but still support syncing"*. `group.pointer.x` is public reactive state — a plain HTML table, a
  value readout, a `<video>` scrubber, or a Leaflet map can read or write it with no `Chart` involved.
- No global registry ⇒ **no SSR leakage**. A module-scoped `Map<string, Group>` (the ECharts/uPlot
  model) is shared across requests on the server and across independent app instances on the client.
  This is a real footgun in SvelteKit.
- Matches `BrushState` / `TransformState` / `SelectionState`; testable in isolation; trivially
  scoped to whatever subset of charts you pass it to.

**Sugar for when you don't want to manage the object** — `<ChartGroup>` constructs a
`ChartGroupState` and provides it via context; descendant charts pick it up when no explicit
`group` prop is passed:

```svelte
<ChartGroup pointer={{ match: 'value' }} domain="x">
  <LineChart ... />
  <BarChart ... />
</ChartGroup>
```

**No string-key form.** ECharts (`chart.group = 'g1'`) and ApexCharts (`chart.group: 'g1'`) need
one because they're imperative libraries with no component tree — a global registry is the only
way for two instances to find each other. Svelte has context, so `<ChartGroup>` covers the same
ergonomic case without any of the registry's costs:

- **SSR leakage.** A module-scoped `Map<string, ChartGroupState>` is shared across requests on the
  server and across independent app instances on the client.
- **Lifetime has no owner.** Charts must deregister on unmount and the entry has to be dropped
  when the last member leaves — bookkeeping nothing in the library is well-placed to own.
- **Two ways to do one thing.** What wins if both `group={obj}` and `group="dashboard"` are set?

Nothing is lost in capability: for charts in unrelated parts of the tree, put a `ChartGroupState`
in a shared module or a higher context and import it. That has the same cross-request caveat on
the server, but as an explicit choice at the call site rather than something the library does
implicitly behind a string.

Naming notes: `ChartGroup` is distinct from the existing `Group` mark (an SVG/canvas `<g>`
wrapper), and `group` is currently free as a `Chart` prop. `seriesLayout: 'group'` is a prop
*value*, not a prop name, so it doesn't collide either.

### 3.3 Per-chart publish/subscribe (uPlot's `filters`)

```svelte
<!-- overview chart: broadcasts its brush, ignores everything else -->
<AreaChart {group} groupOptions={{ publish: ['brush'], subscribe: [] }} />

<!-- detail chart: follows the overview, publishes its own pointer -->
<LineChart {group} groupOptions={{ publish: ['pointer'], subscribe: ['brush', 'pointer'] }} />
```

Also supports Grafana's crosshair-vs-tooltip distinction via
`pointer: { tooltip: false }` — followers show only the crosshair.

### 3.4 Matching strategies

| `match` | Behavior | When |
| --- | --- | --- |
| `'value'` *(default)* | Bisect follower's own `flatData` for the datum nearest the published x/y domain value | Different data arrays, shared domain — the common case |
| `'index'` | `flatData[index]` | Aligned, equal-length arrays; exact and cheap |
| `'percent'` | Relative position within the domain | Unrelated domains, comparable shape (uPlot's `null` scale mode) |
| `(published, ctx) => datum \| undefined` | Custom | Join on an id, snap to an interval, etc. |

Default to `'value'` — Recharts' `'index'` default is a documented source of breakage on
unequal-length data.

### 3.5 Follower resolution pipeline

1. Receive `{ x, y, data, source }`; **bail if `source === this.id`** (echo guard).
2. Resolve a local datum per the `match` strategy (reuse the extracted `findDatum`).
3. `tooltipState.show({ data: datum })` — sets `data`, recomputes `series` for *this* chart's
   series, and derives `x`/`y` from *this* chart's scales + padding. (Or skip step 2 entirely and
   pass `{ value }` to let the follower resolve.)
4. `Highlight` and `Tooltip` render unchanged. Recommend `x="data"` on synced tooltips so placement
   follows the resolved point rather than a stale pointer position.
5. On `pointerleave`, publish `pointer.active = false` so followers clear.

### 3.6 Echo / loop safety

Three guards, all needed:

- **Source tagging.** Add `readonly id = Symbol('chart')` to `ChartState`; stamp every publish;
  subscribers skip their own.
- **Idempotent writes.** Only assign when the value actually differs, so A→B→A converges.
- **Prefer explicit publish calls over bidirectional `$effect`s.** Two `$effect`s writing to each
  other is how this breaks. Publishing should be an imperative call from the interaction handler;
  subscribing can be a `$derived`/`$effect` read.

### 3.7 Domain / zoom sync

Two distinct channels, and conflating them is a known bug source:

- **Domain sync** (`domain: 'x'`) — publish the effective visible `xDomain`. Robust across charts
  with different widths, padding, and even different scale types. Should be the default.
- **Transform sync** — copy `scale` / `translate` directly. Only correct when geometry matches;
  cheaper and pixel-exact when it does. Offer as `domain: { mode: 'transform' }`.

Note `Chart.base.svelte` already layers brush-derived domains over `props.xDomain` via the
`brushXDomain` / `brushYDomain` getters (`:70-84`) — synced domains slot into that same precedence
chain rather than fighting it.

---

## 4. Suggested phasing

| Phase | Scope | Independently valuable? |
| --- | --- | --- |
| **0** | Extract `findDatum` / `resolveTooltipSeries`; add `TooltipState.show({ point, value, data })`; add `ChartState.id` | **Yes** — programmatic tooltips, a11y, testing |
| **1** | `ChartGroupState` + `group` prop + `<ChartGroup>` wrapper; pointer slice only (tooltip + highlight, `match` strategies, echo guard, pub/sub filters) | Yes — the headline feature |
| **2** | `brush` and `domain` slices; rewrite the brush guide's manual sync example | Yes — removes existing boilerplate |
| **3a** | `series` slice (legend highlight + visibility) | Yes |
| **3b** | `selection` slice (cross-filtering) | Yes |
| **4** | Headless `<ChartGroupPointer>` snippet for non-chart consumers | Sugar |

`<ChartGroup>` moves into Phase 1 rather than landing as late sugar: with no string-key form it is
the only zero-config entry point, and it's small — construct the state, put it in context, have
charts fall back to it when no `group` prop is given.

---

## 5. Open questions

1. ~~**Naming** — `sync` vs `group`.~~ **Decided: `ChartGroup*`** — `ChartGroupState`, the
   `group` prop, `<ChartGroup>`. Also matches the ECharts/ApexCharts vocabulary.
2. **Bundle cost** — gate the sync code behind the same lazy `import()` pattern as
   `BrushContext`/`TransformContext` so non-syncing charts pay nothing.
3. ~~**Should the group-key form ship at all?**~~ **Decided: no.** `<ChartGroup>` covers the
   ergonomics via context, without the registry's SSR-leakage, lifetime, and precedence problems.
   See §3.2.
4. **Throttling** — hover at 60 fps × N charts. Svelte's `$state` batching per microtask is probably
   enough, but worth measuring with ~8 charts before deciding.
5. **Band / mismatched granularity** — daily vs monthly data under `match: 'value'`. Needs a defined
   nearest/tolerance rule, and probably a documented `match` fn recipe for interval snapping.
6. **Geo charts** — does pointer sync mean anything for `GeoPath` charts (lat/lng position)? Probably a
   separate channel; out of scope initially.
7. **Touch** — pointer capture during a drag on chart A while chart B is a follower.
8. **Accessibility** — should keyboard navigation of one chart move the synced crosshair on others?
   Almost certainly yes, and Phase 0's value-addressed API is a prerequisite.

---

## Sources

- [uPlot type definitions](https://github.com/leeoniya/uPlot/blob/master/dist/uPlot.d.ts) · [Sync Cursor demo](https://leeoniya.github.io/uPlot/demos/sync-cursor.html) · [Cursor sync issue #459](https://github.com/leeoniya/uPlot/issues/459)
- [ECharts API (`connect`)](https://echarts.apache.org/en/api.html#echarts.connect) · [multiple-grid example](https://echarts.apache.org/examples/en/editor.html?c=grid-multiple) · [Axis / axisPointer handbook](https://apache.github.io/echarts-handbook/en/concepts/axis/)
- [ApexCharts synchronized charts](https://apexcharts.com/docs/chart-types/synchronized-charts/) · [`chart.group`](https://apexcharts.com/docs/options/chart/group/)
- [Recharts API (`syncId` / `syncMethod`)](https://recharts.github.io/en-US/api/) · [tooltip system](https://deepwiki.com/recharts/recharts/5.2-tooltip-system)
- [dygraphs `synchronizer.js`](https://github.com/danvk/dygraphs/blob/master/src/extras/synchronizer.js) · [synchronize test page](https://dygraphs.com/tests/synchronize.html)
- [Highcharts synchronized charts demo](https://www.highcharts.com/demo/synchronized-charts/grid-light)
- [Syncfusion EJ2 synchronized chart](https://ej2.syncfusion.com/angular/documentation/chart/chart-interactive/synchronized-chart)
- [CanvasJS sync tooltip](https://canvasjs.com/javascript-charts/sync-multiple-chart-tooltip/) · [JSFiddle](https://jsfiddle.net/canvasjs/vxj5ugt2/)
- [chartjs-plugin-crosshair](https://github.com/AbelHeinsbroek/chartjs-plugin-crosshair) · [options](https://chartjs-plugin-crosshair.netlify.app/options)
- [Lightweight Charts — set crosshair position](https://tradingview.github.io/lightweight-charts/tutorials/how_to/set-crosshair-position) · [IChartApi](https://tradingview.github.io/lightweight-charts/docs/api/interfaces/IChartApi) · [crosshair sync scroll bug #1608](https://github.com/tradingview/lightweight-charts/issues/1608)
- [Plotly hover events](https://plotly.com/javascript/hover-events/) · [sync zoom & hover request](https://github.com/plotly/react-plotly.js/issues/325) · [crossfilter discussion](https://github.com/plotly/plotly.js/issues/1316)
- [Vega-Lite selections & `resolve`](https://vega.github.io/vega-lite/docs/selection.html) · [Vega-Lite 2.0 intro](https://medium.com/@uwdata/introducing-vega-lite-2-0-de6661c12d58)
- [Grafana shared crosshair issues #97600](https://github.com/grafana/grafana/issues/97600) · [#35552](https://github.com/grafana/grafana/issues/35552)
- [Observable — linked brushing](https://observablehq.com/blog/linked-brushing) · [Brushing and linking (Wikipedia)](https://en.wikipedia.org/wiki/Brushing_and_linking)
