# LayerChart

## 2.0.0-next.40

### Patch Changes

- fix(LineChart): Restore passing xScale / yScale overrides ([#449](https://github.com/techniq/layerchart/pull/449))

## 2.0.0-next.39

### Minor Changes

- feat: Support css-only usage (no Tailwind required) while retaining first-class Tailwind support ([#557](https://github.com/techniq/layerchart/pull/557))

### Patch Changes

- feat: Simplify daisyUI, shadcn-svelte, and Skeleton integrations with single line `@import 'layerchart/{library}.css'` added to `app.css` ([#557](https://github.com/techniq/layerchart/pull/557))

- docs: Add examples for standalone, daisyUI v5, shadcn-svelte v1, Skeleton v3, and Svelte UX v2 (next) (including light/dark theming) ([#557](https://github.com/techniq/layerchart/pull/557))

- feat(LineChart): Support `orientation="vertical"`. Resolves #640 ([#557](https://github.com/techniq/layerchart/pull/557))

- feat: Add Html context support for applicable primitives such as Circle, Line, Rect, Text (and more) as well as transitively such as Axis, Grid, Labels (and more) ([#557](https://github.com/techniq/layerchart/pull/557))

- feat(LinearGradient): Support Html context ([#557](https://github.com/techniq/layerchart/pull/557))

- fix(Text): Apply `fill: currentColor` to support more straightforward way of changing color (ex. `class="text-red-500"` or `style="color:red"`) ([#557](https://github.com/techniq/layerchart/pull/557))

- fix(TooltipContext): Revert back to pointer events (instead of mouse/touch) but with `touch-action: pan-y`. Provides simplified events while allowing horizontal scrubbing with vertical scrolling. ([#557](https://github.com/techniq/layerchart/pull/557))

- feat(TooltipContext): Add `touchEvents` to control touch event behavior. Defaults to `pan-y` to allow vertical scrolling but horizontal scrubbing. ([#557](https://github.com/techniq/layerchart/pull/557))

- fix(TooltipContext): Fix `band` mode regression when both x/y are scaleBand (ex. punchcard chart) ([#557](https://github.com/techniq/layerchart/pull/557))

- fix(SimplifiedCharts): Properly handle `legend` prop as object when determining bottom padding ([#557](https://github.com/techniq/layerchart/pull/557))

- fix(AreaChart|LineChart|DefaultTooltip): Handle per-series data with different length ([#557](https://github.com/techniq/layerchart/pull/557))

- feat(Highlight): Support passing `opacity` ([#557](https://github.com/techniq/layerchart/pull/557))

- fix(SimplifiedChart): Still add selected legend item opacity when item classes are also applied ([#557](https://github.com/techniq/layerchart/pull/557))

- feat(Legend): Add `selected` prop to fade out unselected items (if passed and non-empty) ([#557](https://github.com/techniq/layerchart/pull/557))

- feat(SeriesState): Add `isHighlighted(seriesKey)` to easy check if series is hightlight (or should be faded) ([#557](https://github.com/techniq/layerchart/pull/557))

- fix(Primatives): Apply default classes when using Canvas context (like Svg). Resolves #544 ([#557](https://github.com/techniq/layerchart/pull/557))

- refactor: Remove use of `layerClass` and apply `lc-{name}` class directly to allow easy component <style> targetting within LayerChart ([#557](https://github.com/techniq/layerchart/pull/557))

## 2.0.0-next.38

### Patch Changes

- Update dependencies ([#629](https://github.com/techniq/layerchart/pull/629))

- fix(autoScale): Ignore `null` domain values, fixing some brush examples ([#449](https://github.com/techniq/layerchart/pull/449))

- fix: Update `dagreAncestors()` and `dagreDescendants()` util types ([#629](https://github.com/techniq/layerchart/pull/629))

## 2.0.0-next.37

### Patch Changes

- fix(ArcChart): Do not pass y accessor to use linear scale fallback ([#449](https://github.com/techniq/layerchart/pull/449))

## 2.0.0-next.36

### Patch Changes

- fix(PieChart): Do not pass `y` accessor to use linear scale fallback ([#631](https://github.com/techniq/layerchart/pull/631))

## 2.0.0-next.35

### Patch Changes

- feat(Chart): Automatically determine scale based on data and domain values (instead of defaulting to scaleLinear) ([#624](https://github.com/techniq/layerchart/pull/624))

## 2.0.0-next.34

### Minor Changes

- feat(Rule): Support using as data-driven mark (ex. candlestick, lollipop) by default (`<Rule>` using Chart accessors) or passing explicit `x`/`y` accessors (ex. `<Rule y={["high", "low"]} />`). Resolves #64 ([#622](https://github.com/techniq/layerchart/pull/622))

- breaking(Points): Remove `<Points links>` prop. Use `<Rule>` with x/y accessor instead ([#622](https://github.com/techniq/layerchart/pull/622))

### Patch Changes

- breaking(Axis): Rename `x="left|right"` and `y="top|bottom"` props with `# LayerChart prefix (ex. `<Axis x="$left">`) ([#622](https://github.com/techniq/layerchart/pull/622))

## 2.0.0-next.33

### Patch Changes

- fix(Bars): Fix inverted rect when rendered top-to-bottom or right-to-left. Fixes #540 ([#613](https://github.com/techniq/layerchart/pull/613))

- fix(Axis): Filter distinct tick values (useful when manually injecting extra values) ([#615](https://github.com/techniq/layerchart/pull/615))

- feat(Axis): Use `format` to filter ticks (integer and date/time). Helpful to keep ticks above a threshold for wide charts or short durations. ([#615](https://github.com/techniq/layerchart/pull/615))

## 2.0.0-next.32

### Patch Changes

- fix(Points): Update `point.x` / `point.y` based on `ctx.radial` to simplify children snippet usage ([#611](https://github.com/techniq/layerchart/pull/611))

## 2.0.0-next.31

### Minor Changes

- feat(Chart): Add `xInterval` / `yInterval` for time scales usage with bar charts ([#562](https://github.com/techniq/layerchart/pull/562))

- feat(BarChart): Support time scale with `xInterval` / `yInterval` props ([#562](https://github.com/techniq/layerchart/pull/562))

- feat(TooltipContext): Support `band` mode with time scale (similar to band scale) ([#562](https://github.com/techniq/layerchart/pull/562))

- feat(ForceSimulation): Added `onNodesChange` callback to `ForceSimulation` ([#607](https://github.com/techniq/layerchart/pull/607))

### Patch Changes

- fix(Bar): Clamp radius to width/height to not cause artifacts with small values (including `0`) when rounding a single edge. Fixes #383 ([#610](https://github.com/techniq/layerchart/pull/610))

- fix(Highlight): Properly handle area highlights with y-axis time scales ([#562](https://github.com/techniq/layerchart/pull/562))

## 2.0.0-next.30

### Patch Changes

- fix(AnnotationPoint): Do not propagate mouse/touch move/leave events to TooltipContext after switching from pointer events. Fixes #598 ([#602](https://github.com/techniq/layerchart/pull/602))

## 2.0.0-next.29

### Patch Changes

- fix(Axis): Fix display of axis labels ([#591](https://github.com/techniq/layerchart/pull/591))

## 2.0.0-next.28

### Patch Changes

- fix(Axis): Fix memory leak and improve performance when tick values are `Date` instances ([#586](https://github.com/techniq/layerchart/pull/586))

## 2.0.0-next.27

### Patch Changes

- feat: Update `applyLanes()` util to support nested string key and function accessors for start/end properties ([#449](https://github.com/techniq/layerchart/pull/449))

- fix: Add `applyLanes()` as top-level export ([#449](https://github.com/techniq/layerchart/pull/449))

## 2.0.0-next.26

### Patch Changes

- feat: Add `applyLanes()` array util to support densely packing timelines ([#449](https://github.com/techniq/layerchart/pull/449))

## 2.0.0-next.25

### Patch Changes

- feat(TooltipContext): Support `quadtree-x` and `quadtree-y` modes. Resolves #525 ([#578](https://github.com/techniq/layerchart/pull/578))

- fix(AreaChart): Change default tooltip mode from `bisect-x` to `quadtree-x` (works with catagorical data and does not require data to be sorted) ([#578](https://github.com/techniq/layerchart/pull/578))

- fix(LineChart): Change default tooltip mode from `bisect-x` to `quadtree-x` (works with catagorical data and does not require data to be sorted) ([#578](https://github.com/techniq/layerchart/pull/578))

- fix(ScatterChart): Change default tooltip mode from `voronoi` to `quadtree` ([#578](https://github.com/techniq/layerchart/pull/578))

- fix: Support passing `<*Chart tooltip={...}>` to underlying TooltipContext (as types already indicate) ([#576](https://github.com/techniq/layerchart/pull/576))

## 2.0.0-next.24

### Patch Changes

- breaking(Legend): Rename `classes.swatches` to `classes.item` ([#571](https://github.com/techniq/layerchart/pull/571))

- fix(Legend): Improve / simplify responsive use cases with additional default classes (center, shrink, truncate) ([#571](https://github.com/techniq/layerchart/pull/571))

- fix(Axis): Correctly place multiline parts based on placement ([#574](https://github.com/techniq/layerchart/pull/574))

- fix(Axis|Text): Improve Text y placement using lineHeight/capHeight and remove explicit adjustments, aligning with Html rendering ([#449](https://github.com/techniq/layerchart/pull/449))

## 2.0.0-next.23

### Patch Changes

- fix(Highlight): Fix display of lines for first values (`0` coord). Fixes #568 ([#569](https://github.com/techniq/layerchart/pull/569))

## 2.0.0-next.22

### Patch Changes

- fix(TooltipContext): Fix touch scrolling on mobile. Fixes #255 ([#566](https://github.com/techniq/layerchart/pull/566))

## 2.0.0-next.21

### Patch Changes

- fix: Reduce bundle size by removing culori as transitive dependency ([#563](https://github.com/techniq/layerchart/pull/563))

## 2.0.0-next.20

### Patch Changes

- fix(Canvas): Improve performance by skipping unnecessary work when hit canvas is unneeded ([#561](https://github.com/techniq/layerchart/pull/561))

- fix(Canvas): Improve performance by reducing computed style lookups and memoizing responses ([#561](https://github.com/techniq/layerchart/pull/561))

- fix(Canvas): Only apply text/font properties to canvas to improve performance ([#561](https://github.com/techniq/layerchart/pull/561))

- fix(GeoPath): Improve performance by only using custom geoCurvePath when `curve` overridden ([#561](https://github.com/techniq/layerchart/pull/561))

- fix(GeoPath): Fix reactivity with `curve` when using Canvas context ([#561](https://github.com/techniq/layerchart/pull/561))

- fix(Calendar): Support showing month labels without path via `monthLabel` prop (true by default) ([#449](https://github.com/techniq/layerchart/pull/449))

## 2.0.0-next.19

### Patch Changes

- fix(Calendar): Pass `cellSize` to children snippet (useful when responsive) ([#558](https://github.com/techniq/layerchart/pull/558))

## 2.0.0-next.18

### Patch Changes

- refactor: Replace `date-fns` usage with existing `d3-time` to reduce bundle size ([#551](https://github.com/techniq/layerchart/pull/551))

- fix(Text): Performance improvement by only determining word width if `width` prop defined (for word wrapping) ([#554](https://github.com/techniq/layerchart/pull/554))

## 2.0.0-next.17

### Patch Changes

- feat: Add Polygon primitive ([#533](https://github.com/techniq/layerchart/pull/533))

- feat: Add Ellipse primitive ([#533](https://github.com/techniq/layerchart/pull/533))

- feat(Spline): Add `value` to `startContent` and `endContent` snippets to easily access the `x` and `y` data values ([#537](https://github.com/techniq/layerchart/pull/537))

- breaking(Spline): Rename `splineRef` to `pathRef` ([#549](https://github.com/techniq/layerchart/pull/549))

- fix(GeoPath): Do not register with hit canavs unless pointer events (onclick, onpointermove, etc) or tooltipContext are defined ([#549](https://github.com/techniq/layerchart/pull/549))

- fix(Treemap): Fix reactivity of props (tile, padding, etc) ([#516](https://github.com/techniq/layerchart/pull/516))

- breaking(Treemap): Remove `selected` prop ([#516](https://github.com/techniq/layerchart/pull/516))

- fix(Treemap): Add `maintainAspectRatio` (default: false) to opt into tiling function adjustment (primarily for zoom) ([#516](https://github.com/techniq/layerchart/pull/516))

- fix(Treemap): Fix `padding*` prop types to support function or number constant ([#516](https://github.com/techniq/layerchart/pull/516))

- feat(ForceSimulation): Refined `onstart`/`ontick`/`onend` events of `ForceSimulation` ([#547](https://github.com/techniq/layerchart/pull/547))

- fix(ForceSimulation): Fixed a bug that would sometimes keep a simulation running, when its inputs change, even if `alpha < alphaMin` ([#546](https://github.com/techniq/layerchart/pull/546))

- fix(TooltipList): Align label to top (start) instead of center by default ([#449](https://github.com/techniq/layerchart/pull/449))

- breaking(Blur): Remove children snippet props (not needed and easier to support canvas in the future) ([#549](https://github.com/techniq/layerchart/pull/549))

- fix(Calendar|MonthPath): Support canvas by using `Spline` instead of `path` ([#549](https://github.com/techniq/layerchart/pull/549))

- docs: Document each component's context support (svg, canvas, html) with interactive toggle ([#549](https://github.com/techniq/layerchart/pull/549))

## 2.0.0-next.16

### Patch Changes

- fix(ForceSimulation): Expose default values by exporting them as constants ([#530](https://github.com/techniq/layerchart/pull/530))

- fix(ForceSimulation): Export Forces<NodeDatum, LinkDatum> type. ([#531](https://github.com/techniq/layerchart/pull/531))

## 2.0.0-next.15

### Minor Changes

- fix(ForceSimulation): Decouple from `ChartContext` by taking nodes and links via `data` prop. ([#526](https://github.com/techniq/layerchart/pull/526))

- fix(ForceSimulation): Improve types of `nodes` and `links` via generics (i.e. `ForceSimulation<Node, Link>`). ([#527](https://github.com/techniq/layerchart/pull/527))

- fix(ForceSimulation): Expose `links` via `children` snippet.

## 2.0.0-next.14

### Patch Changes

- fix(AreaChart|BarChar|LineChart): Use value axis (typically y) property name/accessor for tooltip label if defined as string (ex. `<AreaChart x="date" y="visitors">` will use `visitors` instead of `value`) ([#523](https://github.com/techniq/layerchart/pull/523))

## 2.0.0-next.13

### Patch Changes

- feat: Support passing `FormatConfig` (ex. `{ type: '...', options: { ... } }`) anywhere `FormatType` is supported to simplify custom formatting (ex. `variant`) ([#521](https://github.com/techniq/layerchart/pull/521))

- feat: Support passing `PeriodTypeCode` strings for simplified date formatting and reduce imports. Example: `format={PeriodType.Day}` is now `format="day"`. Also supported with config object for passing additional options (ex. `format={{ type: 'day', options: { variant: 'long' } }}`). Supported for all `format` props include Axis, Labels, Legend and Tooltip. ([#521](https://github.com/techniq/layerchart/pull/521))

## 2.0.0-next.12

### Patch Changes

- fix(Group): Default `opacity` to `undefined` instead of `1` to allow overriding via class (ex. `opacity-20`) ([#520](https://github.com/techniq/layerchart/pull/520))

- fix(Axis): Additional multiline month fix for day ticks ([#449](https://github.com/techniq/layerchart/pull/449))

## 2.0.0-next.11

### Patch Changes

- fix(Axis): Fix multiline month when day tick does not align on first of month ([#517](https://github.com/techniq/layerchart/pull/517))

## 2.0.0-next.10

### Patch Changes

- fix(Tooltip): Use standard CSS classes (non-tailwind) for root element to simplify some usage (including shadcn-svelte) ([#511](https://github.com/techniq/layerchart/pull/511))

## 2.0.0-next.9

### Patch Changes

- fix(Axis): Key using tick value instead string representation to support millisecond precision ([#508](https://github.com/techniq/layerchart/pull/508))

- fix(Axis): Add time duration aware tick value/format support ([#508](https://github.com/techniq/layerchart/pull/508))

- feat(Axis): Support multiline ticks for time intervals ([#508](https://github.com/techniq/layerchart/pull/508))

- feat(Axis): Support responsive tick counts via `tickSpacing` prop ([#508](https://github.com/techniq/layerchart/pull/508))

- fix(Text): Apply `dominant-baseline` to `<textPath>` instead of `<text>` to fix Safari. Fixes #507 ([#508](https://github.com/techniq/layerchart/pull/508))

- feat(Text): Support explicit word wrapping with `\n` character ([#508](https://github.com/techniq/layerchart/pull/508))

## 2.0.0-next.8

### Patch Changes

- docs: Add non-radial BarChart duration example and improve radial example ([#496](https://github.com/techniq/layerchart/pull/496))

- fix(BarChart): Improve handling time scale for value axis (ex. xScale for horizontal orientation) ([#496](https://github.com/techniq/layerchart/pull/496))

- fix(Spline): Only re-draw on data/path changes and not other context (such as width/height). Fixes #504 ([#505](https://github.com/techniq/layerchart/pull/505))

- docs: Rename "Dot Plot" to "Duration" and add bars example along with points ([#496](https://github.com/techniq/layerchart/pull/496))

## 2.0.0-next.7

### Patch Changes

- feat(Canvas): Support disabling the hit canavs (useful when animations are playing) ([#449](https://github.com/techniq/layerchart/pull/449))

- refactor: Update `@layerstack/svelte-state` and replace remaining `@layerstack/svelte-stores` usage (media query) (mostly docs related except Canvas) ([#449](https://github.com/techniq/layerchart/pull/449))

## 2.0.0-next.6

### Patch Changes

- fix: Update dependencies, notable @layerstack/utils with improved metric number formatting ([#449](https://github.com/techniq/layerchart/pull/449))

- fix: Update dependencies, notable `@layerstack/utils` with improved `metric` number formatting ([`71920fc`](https://github.com/techniq/layerchart/commit/71920fc6d8bb91cc6a15fe5a33f805f166a9de13))

## 2.0.0-next.5

### Patch Changes

- fix(AnnotationRange): Fix passing non-class/fill props (ex. pointer events) via `props.rect` ([#449](https://github.com/techniq/layerchart/pull/449))

## 2.0.0-next.4

### Patch Changes

- fix(TooltipContext): Handle chart padding when using `quadtree` mode ([#449](https://github.com/techniq/layerchart/pull/449))

- feat(Voronoi): Support passing `r` to define a max radius (clip path) ([#449](https://github.com/techniq/layerchart/pull/449))

- feat(TooltipContext): Support `quadtree` mode for geo visualizations ([#449](https://github.com/techniq/layerchart/pull/449))

- feat(TooltipContext): Support `radius` for voronoi mode ([#449](https://github.com/techniq/layerchart/pull/449))

## 2.0.0-next.3

### Patch Changes

- breaking(AnnotationLine|AnnotationPoint): Change `labelOffset` into explicit `labelXOffset` and `labelYOffset` for greater control (aligns with AnnotationRange) ([#492](https://github.com/techniq/layerchart/pull/492))

- fix(HighlightKey): Define `set()` with arrow function to solve `current` access when passed directly ([#449](https://github.com/techniq/layerchart/pull/449))

- fix: Improve memory leak caused by detached DOM increase when using Canvas rendering due to sometimes still rendering Svg components (ex. `<g>` vs `<Group>`) (#490) ([#490](https://github.com/techniq/layerchart/pull/490))

- breaking(Bar): Rename `bar` prop to `data` to better represent usage ([#449](https://github.com/techniq/layerchart/pull/449))

## 2.0.0-next.2

### Major Changes

- feat: Migrate to Svelte 5 runes/snippets (issue #159) ([#458](https://github.com/techniq/layerchart/pull/458))

### Minor Changes

- feat: Add Annotation components (AnnotationPoint, AnnotationLine, AnnotationRange) ([#458](https://github.com/techniq/layerchart/pull/458))

- feat: Integrate `annotations` into simplified charts ([#458](https://github.com/techniq/layerchart/pull/458))

- feat(Pattern): Simplified definitions via `lines`/`circles` props (issue #472) ([#458](https://github.com/techniq/layerchart/pull/458))

- feat(Pattern): Canvas support ([#458](https://github.com/techniq/layerchart/pull/458))

- feat(BarChart): Radial support (vertical and horizontal) (issue #469) ([#458](https://github.com/techniq/layerchart/pull/458))

- feat(Arc/Text): Arc path labels with inner/outer/middle placement and smart flipping (issue #7) ([#458](https://github.com/techniq/layerchart/pull/458))

- feat: New ArcChart component ([#458](https://github.com/techniq/layerchart/pull/458))

- feat: New Connector component (issue #11) ([#458](https://github.com/techniq/layerchart/pull/458))

- feat: Add `Layer` component to easily switch between Svg, Canavs, and Html layers ([#458](https://github.com/techniq/layerchart/pull/458))

- refactor: Remove LayerCake dependency (issue #432) ([#458](https://github.com/techniq/layerchart/pull/458))

### Patch Changes

- fix(ForceSimulation): Restore performance to at/near Svelte 4 performance (issue #451) ([#458](https://github.com/techniq/layerchart/pull/458))

- fix(ScatterChart): Support color scales based on value (such as threshold) ([#458](https://github.com/techniq/layerchart/pull/458))

- fix(Highlight): Support radial area (issue #112) ([#458](https://github.com/techniq/layerchart/pull/458))

- feat: Add classes for underlying element styling ([#458](https://github.com/techniq/layerchart/pull/458))

- fix: Resolves "Target div has zero or negative height" console warning (issue #291) ([#458](https://github.com/techniq/layerchart/pull/458))

- fix(Text): Respect font weight when canvas rendered ([#458](https://github.com/techniq/layerchart/pull/458))

## 1.0.11

### Patch Changes

- fix: Update dependencies, notable `@layerstack/utils` with improved `metric` number formatting ([`71920fc`](https://github.com/techniq/layerchart/commit/71920fc6d8bb91cc6a15fe5a33f805f166a9de13))

## 1.0.10

### Patch Changes

- feat(BarChart): Pass derived scales (x1, y1) to slots props. Useful for custom labels with group series layout ([#476](https://github.com/techniq/layerchart/pull/476))

## 1.0.9

### Patch Changes

- fix(Spline): Do not unnecessarily render mid/end markers. Fixes Firefox when used with ClipPath. ([#474](https://github.com/techniq/layerchart/pull/474))

## 1.0.8

### Patch Changes

- fix: Improve treeshaking `d3-array` and `d3-shape` imports ([`450ca69`](https://github.com/techniq/layerchart/commit/450ca69a183156a25c471e4db235dabee6c65ad2))

- fix: Remove `shapefile` and `topojson-client` as duplicated `dependencies` (`devDependencies` only) ([`da03573`](https://github.com/techniq/layerchart/commit/da035735ceaf2c685d9829b543eee3441da9685c))

## 2.0.0-next.1

### Patch Changes

- Switch from @tailwindcss/postcss to @tailwindcss/vite. Update all non-major packages ([#449](https://github.com/techniq/layerchart/pull/449))

## 2.0.0-next.0

### Major Changes

- Tailwind 4 support ([#449](https://github.com/techniq/layerchart/pull/449))

### Patch Changes

- fix: Support `opacity` prop/style when Canvas rendered for all primatives ([#449](https://github.com/techniq/layerchart/pull/449))

- fix(Spline): Pass `fillOpacity` prop (instead of `fill-opacity`) to support Canvas ([#449](https://github.com/techniq/layerchart/pull/449))

## 1.0.7

### Patch Changes

- feat: Add `highlightSeriesKey` as slot prop for all simplified chart slots ([`af73389`](https://github.com/techniq/layerchart/commit/af73389356177bb68d658c67a506fe3e3d7180a3))

## 1.0.6

### Patch Changes

- fix(TooltipContext): Ignore clicks without data (triggered from Legend clicks, for example) ([#444](https://github.com/techniq/layerchart/pull/444))

## 1.0.5

### Patch Changes

- fix(Canvas): Redraw if color scheme / theme changes, either via browser `prefers-color-scheme` (including emulation) or by changing `<html class="dark">` or `<html data-theme="...">` ([#440](https://github.com/techniq/layerchart/pull/440))

## 1.0.4

### Patch Changes

- fix(Points): Support coloring lines using color `c` scale ([#436](https://github.com/techniq/layerchart/pull/436))

- fix(Area): Apply same `defaultPathData` logic as Spline. Provides better initial performance when not tweened and fixes Svelte 4 compatability issue ([#435](https://github.com/techniq/layerchart/pull/435))

- fix(AreaChart|LineChart): Hide highlight points when set to `false` ([#437](https://github.com/techniq/layerchart/pull/437))

## 1.0.3

### Patch Changes

- fix(Area|Link|Spline): Fix advertant tweening due to non-granular object reactivity with tweened options ([#429](https://github.com/techniq/layerchart/pull/429))

- fix(TooltipContext): Properly detect non-manual modes for pointer chart bounds detection ([#433](https://github.com/techniq/layerchart/pull/433))

- fix(TransformContext): Fix `zoomTo()` regression (Pack/Zoomable map examples) ([#430](https://github.com/techniq/layerchart/pull/430))

## 1.0.2

### Patch Changes

- feat: Let users pass configurations for svg and canvas (like cursor-crosshair) ([#419](https://github.com/techniq/layerchart/pull/419))

- fix: Reactively rebuild `get_Props()` functions when `highlightSeriesKey` is updated. Fixes Svelte 3/4 reactivity issues when hovering legend, points, etc ([#425](https://github.com/techniq/layerchart/pull/425))

- fix(TooltipContext): Support explicit `tooltip.show(...)` when using non-manual mode (ex. support manual annotations with `mode="bisect-x"`) ([#423](https://github.com/techniq/layerchart/pull/423))

## 1.0.1

### Patch Changes

- fix(PieChart): Simplify customizing colors using prop on data items by only requiring `c` color accessor (ex. `[{ color: '...'}]`) ([`e9786db`](https://github.com/techniq/layerchart/commit/e9786dbadeceec29366171ecbc37799225712d85))

- fix(Spline): Improve initial render performance when tweened disabled (default) ([#418](https://github.com/techniq/layerchart/pull/418))

- fix(Canvas): Call `pointerenter`/`pointerover` events when moving over overlapping components (ex. series highlight points) ([`ef7f74b`](https://github.com/techniq/layerchart/commit/ef7f74bd1eb2209f27cc912e283e99beb84f503b))

## 1.0.0

### Major Changes

- Version 1.0 (Svelte 3-5 and Tailwind 3 compatible) ([`123c9f6`](https://github.com/techniq/layerchart/commit/123c9f689b40b35f08185f8206cf0c5e7eb5ed34))

## 0.99.5

### Patch Changes

- docs: Update @layerstack and Svelte UX packages to fix autofocus and SSR issues ([`3ce8060`](https://github.com/techniq/layerchart/commit/3ce8060be01cd1bd4e1d42110e7c478ce8bea9d9))

- Update dependencies ([#415](https://github.com/techniq/layerchart/pull/415))

## 0.99.4

### Patch Changes

- feat(Canvas|Html|Svg): Add `ignoreTransform` prop to ignore `TransformContext` for layer. Use to add static elements such as custom legends within a rendering context ([`e93bda3`](https://github.com/techniq/layerchart/commit/e93bda3dad62ab5a1ba4d91ee5837b36ba1916cd))

## 0.99.3

### Patch Changes

- refactor(Arc): Use `Spline` to draw path, simplifying implementation and supporting pointer events for inner `track` component ([`4195b2d`](https://github.com/techniq/layerchart/commit/4195b2d060b03df581da58a4e83ab16c75e36b27))

- fix(canvas): Improve handling of explicit `none` fill/stroke ([`63adb50`](https://github.com/techniq/layerchart/commit/63adb504de27365b4da2aee937f0ae999a2eebbb))

## 0.99.2

### Patch Changes

- fix(TooltipContext): Call `hideTooltip()` for all tooltip modes on `pointerleave` to fix `band` (BarChart) and `voronoi` (ScatterPlot) modes not always closing on chart pointerleave due to recent chart delay / tooltip hover changes ([`e9f5e8c`](https://github.com/techniq/layerchart/commit/e9f5e8c3e80f5fb4f8c4dbd8e977a840187555c9))

## 0.99.1

### Patch Changes

- fix(Svg|Html): Do not accidentally lose transform on browser resize ([`74ecd20`](https://github.com/techniq/layerchart/commit/74ecd2091917ee837de15a7ecdaef2d9ebedcdec))

## 0.99.0

### Minor Changes

- feat(Dagre): Expose access to Dagre Graph instance via `bind:graph` ([`48bc672`](https://github.com/techniq/layerchart/commit/48bc6729d4339b924660f12202cb437a0dacb4b3))

## 0.98.2

### Patch Changes

- fix(TooltipContext): Bypass bounds checking when using `mode="manual"` (default) ([`160659e`](https://github.com/techniq/layerchart/commit/160659ebe226499edbf17809bc2a91c94db3cbb2))

## 0.98.1

### Patch Changes

- fix(TransformContext): Account for Chart padding when zooming to point ([`2c2e06c`](https://github.com/techniq/layerchart/commit/2c2e06cf96c6f28f313633a0eecda9704455d042))

## 0.98.0

### Minor Changes

- breaking(TransformContext): Remove `translateOnScale` prop (always enabled now) ([#398](https://github.com/techniq/layerchart/pull/398))

### Patch Changes

- fix(TransformContext): Translate towards pointer position when scroll zooming and using `transform={{ mode: 'canvas' }}` (matching geo context applyTransform behavior) ([#398](https://github.com/techniq/layerchart/pull/398))

## 0.98.0

### Patch Changes

- fix(TransformContext): Fix drag occasional jumping when `<Html>` is the top layer ([`f54a603`](https://github.com/techniq/layerchart/commit/f54a603ececfee32a66aee44b0b533a1da837d64))

- fix(Group): Apply `display:absolute` when within `html` render context ([`7036725`](https://github.com/techniq/layerchart/commit/70367253036fbd725fcd10065d265cde2d866afc))

- refactor: Use @layerstack/utils `localPoint()` ([`f54a603`](https://github.com/techniq/layerchart/commit/f54a603ececfee32a66aee44b0b533a1da837d64))

## 0.97.0

### Minor Changes

- feat(Html): Apply `transformContext` when using `mode='canvas'` (align with `Svg` and `Canvas`) ([`2b46908`](https://github.com/techniq/layerchart/commit/2b46908894bdb87c3d879afbaec4d68efc4f040e))

- feat(Group): Support `Html` context ([`5ed7f27`](https://github.com/techniq/layerchart/commit/5ed7f270b1a99e9f3633448fcf8744b6f618977f))

- feat: Add `getRenderContext()` to easily identify if within `Canavs`, `Html`, or `Svg` context ([`d319da2`](https://github.com/techniq/layerchart/commit/d319da28ee3f4ed3d248ea327eb4fa1122dcb2c6))

## 0.96.0

### Minor Changes

- feat(AreaChart|BarChart|LineChart|PieChart|ScatterChart): Expose `tooltipContext` to enable `bind:` usage for external access ([#394](https://github.com/techniq/layerchart/pull/394))

## 0.95.0

### Minor Changes

- feat: Highlight related series on tooltip item hover for all simplified charts. Expose `setHighlightSeriesKey` as slot prop, useful when overriding "tooltip" slot ([#393](https://github.com/techniq/layerchart/pull/393))

- feat(TooltipContext): Added hideDelay prop to Tooltip for configurable hide behavior ([#391](https://github.com/techniq/layerchart/pull/391))

- feat(TooltipItem): Add `onclick`, `onpointerenter`, `onpointerleave` event callbacks ([`83a1933`](https://github.com/techniq/layerchart/commit/83a1933ec00b114343a3ce3bfb3c9e332300f1f7))

### Patch Changes

- fix(TooltipItem): Use Tailwind 3 and 4 compatibility CSS variable custom value ([`8ed4684`](https://github.com/techniq/layerchart/commit/8ed4684fa1136b0e9704f205cd64895ffbad596b))

## 0.94.3

### Patch Changes

- fix(Highlight): Fix Svelte 3/4 compat ([`1107a7d`](https://github.com/techniq/layerchart/commit/1107a7d92b03923e4eb90af2ebb26aa9a2e52d4a))

## 0.94.2

### Patch Changes

- fix: Use correct `_` instead of `,` grid-col-[...] separator for custom values. Fixes Tailwind 4 compatability ([`90a12f4`](https://github.com/techniq/layerchart/commit/90a12f41409a0b5d9ab830c2146c41b06744681a))

## 0.94.1

### Patch Changes

- fix(AreaChart|LineChart|ScatterChart): Allow overriding highlight points props while retaining series color and highlight opacity ([`933f499`](https://github.com/techniq/layerchart/commit/933f499815ff10b947e0c6854a6eda2c7965accf))

## 0.94.0

### Minor Changes

- feat: Add `belowContext` and `aboveContext` slots to all simplified charts ([`b951724`](https://github.com/techniq/layerchart/commit/b9517240fdf66e4c2b057d1e46a3024d96a4eebf))

## 0.93.10

### Patch Changes

- fix(Bar): Properly handled `rounded="none"` (use Rect and ignore radius if defined) ([`472f2d8`](https://github.com/techniq/layerchart/commit/472f2d8d969fa17fdf158e3ea7c8675e7ef9b829))

## 0.93.9

### Patch Changes

- fix: Update `svelte` to `5.19.9` allowing PieChart tooltip workaround to be removed ([`c0331d3`](https://github.com/techniq/layerchart/commit/c0331d343f1c47a7826255ac70be549edcd3840a))

## 0.93.9

### Patch Changes

- feat(Highlight): Set CSS `cursor: pointer` on hover when point has `onpointclick` set. Works for both svg and canvas rendering contexts ([`e9894cc`](https://github.com/techniq/layerchart/commit/e9894cc5360202204581417fc030b0d15063d207))

## 0.93.8

### Patch Changes

- fix(PieChart): Workaround Svelte `5.9.5` regression with tooltip label reactivity due to conditional accessor ([`1722d20`](https://github.com/techniq/layerchart/commit/1722d202045e7555536dc2fd1113c4dc7dfb9587))

- Update dependencies ([`ceec65d`](https://github.com/techniq/layerchart/commit/ceec65dd902c2f2ccfc825b1ce0981c6c8fff2fa))

## 0.93.7

### Patch Changes

- fix(BrushContext): Ignore clicks outside of chart bounds. Fixes clicking on legend item resetting brush ([`2863519`](https://github.com/techniq/layerchart/commit/28635199734fea24dd9027ca79b143d123b42203))

## 0.93.6

### Patch Changes

- fix(Canvas): Explicitly set `willReadFrequently:false` for hit canvas to resolve pixel artifacts between fill and stroke with the same color ([`4831fd0`](https://github.com/techniq/layerchart/commit/4831fd0aa42a7bacdeba47cbebd047299e1f7b27))

## 0.93.5

### Patch Changes

- fix(Arc|Pie|PieChart): Consider width when responsively setting outerRadius (non-fixed value) ([`54581a4`](https://github.com/techniq/layerchart/commit/54581a4b1493d7ca13ab65a12e199c79a59588d9))

- docs(Arc|Pie|PieChart): Allow all examples to resize to demonsrtrate responsiveness ([`54581a4`](https://github.com/techniq/layerchart/commit/54581a4b1493d7ca13ab65a12e199c79a59588d9))

## 0.93.4

### Patch Changes

- fix(AreaChart|LineChart|ScatterChart): Clip `belowMarks`, `aboveMarks`, `highlight`, `labels`, and `points` slots when brushed/zoomed ([`883d1d3`](https://github.com/techniq/layerchart/commit/883d1d374e057cfd270da7a59ba5d4115c4719e4))

- feat: Add `renderCircle` to simplify rendering circles to canvas (instead of using `renderPath`) ([`c728af0`](https://github.com/techniq/layerchart/commit/c728af0ef1cb96717b570391af961797646400c2))

- feat(Canvas): Add Logger integration ([`d88ee43`](https://github.com/techniq/layerchart/commit/d88ee43b8e36042d5f4a00c5b858388a1139a58e))

- fix: Update `rgbColorGenerator` and `getColorStr` to support alpha channel (rgba) ([`796f029`](https://github.com/techniq/layerchart/commit/796f0294dfea40da25029a670ecef0d288036936))

- fix(canvas render): Always paint fill when explicitly defined (`rgb(0,0,0)` would match the default computedStyles color and be ignored) ([`9d3ba48`](https://github.com/techniq/layerchart/commit/9d3ba48eea4eda6e83888050323dcc4b87a34a7b))

## 0.93.3

### Patch Changes

- fix(Highlight): Pass all `bar` props to underlying `Bar` (aligning with `lines` and `points`) ([`2a153ea`](https://github.com/techniq/layerchart/commit/2a153eaf7905d54bf2eedd6c688697d9c2e7c62a))

## 0.93.2

### Patch Changes

- fix(Canvas): Properly setup `pointerdown` event (allowing `e.stopPropagation()`) ([`579d771`](https://github.com/techniq/layerchart/commit/579d7710f46cbdc420130b0f04357d23a0286594))

## 0.93.1

### Patch Changes

- fix(AreaChart|LineChart): Only define `onpointerclick` on Highlight if provided to chart (coordinate with recent Highlight change) ([`81ddcbe`](https://github.com/techniq/layerchart/commit/81ddcbec9b2a298b4b8155ba3030c031f7deaa4f))

- fix: Add `BrushContext` to top-level exports (useful for types) ([`5005c18`](https://github.com/techniq/layerchart/commit/5005c189bcdd4108029e73b13b160819609bf003))

- fix(Highlight): Do not propagate `pointerdown` event to `BrushContext` if `onclick` is provided ([`0c35ba9`](https://github.com/techniq/layerchart/commit/0c35ba925aabff89b6c9ee4125f1bca56e94ca8e))

- feat(Circle): Add `onpointerevent` event callback ([`0ecb9e3`](https://github.com/techniq/layerchart/commit/0ecb9e3c700cdba8e4ccf653fcf9406c215eef8a))

## 0.93.0

### Minor Changes

- feat: Integrate Brush via BrushContext (`<Chart brush={...}>`) ([#361](https://github.com/techniq/layerchart/pull/361))

- breaking: Remove `Brush` component ([#361](https://github.com/techniq/layerchart/pull/361))

### Patch Changes

- fix: Support highlight pointer events (click/hover) when using brush ([#361](https://github.com/techniq/layerchart/pull/361))

- fix: Support brushing when using `voronoi` tooltip mode ([#361](https://github.com/techniq/layerchart/pull/361))

- fix(AreaChart|LineChart): Fix re-animating (tweened) lines/areas on single series point hover ([#361](https://github.com/techniq/layerchart/pull/361))

## 0.92.1

### Patch Changes

- feat(Brush): Add Logger integration ([`6308357`](https://github.com/techniq/layerchart/commit/630835723ca977c7e9ac4678d6189c85f112a0db))

- fix(Brush): Improve pointer handling (both small (<1px) and large/quick movements) ([`6308357`](https://github.com/techniq/layerchart/commit/630835723ca977c7e9ac4678d6189c85f112a0db))

## 0.92.0

### Minor Changes

- feat(Axis): Support passing `ticks` as d3-time interval (ex. `timeDay.every(3)`) ([`57dfdcb`](https://github.com/techniq/layerchart/commit/57dfdcbb7ccf9dfad8372e177c0fcf1c66a72831))

## 0.91.1

### Patch Changes

- fix(TooltipContext): Pass `MouseEvent` as first argument to `onclick` (match other event callbacks) ([`180d77a`](https://github.com/techniq/layerchart/commit/180d77a36981dc65bd8bd593e67c1b9f58515cdf))

## 0.91.0

### Minor Changes

- breaking(Brush): Lowercase event callbacks ([`1d5ad26`](https://github.com/techniq/layerchart/commit/1d5ad265da731dec3f9ea50113d156de3f477062))

## 0.90.0

### Minor Changes

- feat(Canvas): Integrate hit canvas with component registration system for simplified pointer events ([#354](https://github.com/techniq/layerchart/pull/354))

- breaking: Remove all usage of `createEventDispatcher` with `on{event}` callbacks. Aligns with Svelte 5 recommendation and unlocks canvas integration ([#354](https://github.com/techniq/layerchart/pull/354))

- breaking: Lowercase all event names (`onTooltipClick` => `ontooltipclick`) for consistency with native events (preparing for Svelte 5) ([#354](https://github.com/techniq/layerchart/pull/354))

- feat(Frame): Support Canvas render context ([#354](https://github.com/techniq/layerchart/pull/354))

- feat(Link): Support Canvas render context ([#354](https://github.com/techniq/layerchart/pull/354))

- feat(Voronoi): Support Canvas render context ([#354](https://github.com/techniq/layerchart/pull/354))

- feat: Add `debug` prop to all simplfied charts to enable tooltip and renderContext debug mode ([#354](https://github.com/techniq/layerchart/pull/354))

- feat(GeoPoint): Pass `x` / `y` as slot props ([#354](https://github.com/techniq/layerchart/pull/354))

- feat(Rect): Support binding to underlying svg `<rect>` using `element` prop ([#354](https://github.com/techniq/layerchart/pull/354))

- breaking: Remove HitCanvas (integrated into Canvas) ([#354](https://github.com/techniq/layerchart/pull/354))

- breaking: Remove `render` prop from GeoPath, GeoPoint, and Points. No longer useful now that Canvas integrates functionality ([#354](https://github.com/techniq/layerchart/pull/354))

### Patch Changes

- fix(PieChart): Fix tooltips when using `renderContext="canvas"` ([#354](https://github.com/techniq/layerchart/pull/354))

- fix(AreaChart|LineChart|Highlight): Support canvas pointer events, enabling series highlighting and click events when using `renderContext="canvas" ([#354](https://github.com/techniq/layerchart/pull/354))

- fix(Canvas): Improve animation performance by only rendering hit canvas when `<canvas>` has active pointer over element ([#354](https://github.com/techniq/layerchart/pull/354))

## 0.81.3

### Patch Changes

- fix(PieChart): Align `interface $Props extends ...` with other simplified charts to fix odd type issue ([`a7133b4`](https://github.com/techniq/layerchart/commit/a7133b45da35108e88f1edeca433824241b3c5e4))

## 0.81.2

### Patch Changes

- feat(Brush): Add `onReset` callback event ([`5b95bc9`](https://github.com/techniq/layerchart/commit/5b95bc95a48e3b050b484bb01ff93ed801c3d21d))

- fix(Brush): On reset, restore original configured domain values and not data derived domain values ([`5b95bc9`](https://github.com/techniq/layerchart/commit/5b95bc95a48e3b050b484bb01ff93ed801c3d21d))

## 0.81.1

### Patch Changes

- fix(Brush): Add `mode: 'integrated' | 'separated'` to better support external state updates (default: `integarted` and no longer shows active selection when brush domain != original domain) ([`120f5e0`](https://github.com/techniq/layerchart/commit/120f5e041dc1d813e8f1de4ef8e182e1306c4d7b))

## 0.81.0

### Minor Changes

- breaking(Brush): Change events (`change`, `brushStart`, `brushEnd`) to callback functions (`onChange`, `onBrushStart`, `onBrushEnd`). Allows usage from simplified charts and moves towards Svelte 5 api ([`450feb8`](https://github.com/techniq/layerchart/commit/450feb8262179fac7380a8054e4c1528264638f3))

## 0.80.0

### Minor Changes

- feat(AreaChart|LineChart|ScatterChart): Add Brush integration ([#348](https://github.com/techniq/layerchart/pull/348))

- feat(ChartClipPath|CircleClipPath|RectClipPath): Support passing `disabled` to underlying `ClipPath` ([#348](https://github.com/techniq/layerchart/pull/348))

- feat: Support passing `props={{ tooltip: { context: ... } }}` for all simplified charts (still support `tooltip={...}`) ([#348](https://github.com/techniq/layerchart/pull/348))

### Patch Changes

- fix: Restore ability to pass `tooltip={false}` to disable tooltip for all simplified charts ([#348](https://github.com/techniq/layerchart/pull/348))

- fix(AreaChart|LineChart): Fade other series highlight points when hovering individual point ([#348](https://github.com/techniq/layerchart/pull/348))

## 0.79.4

### Patch Changes

- fix: Properly handle `null` fill/stroke when creating objectId for canvas reactivity ([`c96c76f`](https://github.com/techniq/layerchart/commit/c96c76f104304415e0af3c27b0635624d934867c))

## 0.79.3

### Patch Changes

- feat(Labels): Support passing `data` and `x` / `y` accessor overrides ([`c5b297c`](https://github.com/techniq/layerchart/commit/c5b297cbe9ab5b8f521b870236f9095f6b5d8082))

- feat(Points): Support passing `x` / `y` accessor overrides ([`8ea6f12`](https://github.com/techniq/layerchart/commit/8ea6f1287a45c68628bdcb9a7feff00f9b5b26ca))

- fix(AreaChart|BarChart|LineChart|ScatterChart): Hide labels and points when toggling selected series from legend. . Add `getLabelsProps` and `getPointsProps` slot props, useful when override slot ([`5602e04`](https://github.com/techniq/layerchart/commit/5602e043143e092f879b9ec1ebb487733a63fa42))

- fix(AreaChart): Fix labels placements when using `seriesLayout="stack"` ([`5602e04`](https://github.com/techniq/layerchart/commit/5602e043143e092f879b9ec1ebb487733a63fa42))

## 0.79.2

### Patch Changes

- fix(Circle|Line|Rect): Restore passing `class` to <path> after recent refactor to handle reactive canvas styling ([`b025d19`](https://github.com/techniq/layerchart/commit/b025d19d22be9d63fd1ed931eae0bb2f1c92593c))

## 0.79.1

### Patch Changes

- Bump dependencies ([`aee4fed`](https://github.com/techniq/layerchart/commit/aee4fed0ae37437e50f8a218ad1b4256c92597c7))

- fix(Arc): Restore passing `class` to <path> after recent refactor to handle reactive canvas styling ([`2bd93e5`](https://github.com/techniq/layerchart/commit/2bd93e55cca888dc97e6ec6e66986f7a420f35f2))

## 0.79.0

### Minor Changes

- fix: Improve canvas reactivity for all primatives (Arc, Area, Circle, Spline, etc) ([#339](https://github.com/techniq/layerchart/pull/339))

### Patch Changes

- fix(getComputedStyles): Ignore transition classes to allow immediate reading of css values (ex. `transition-opacity` affecting `opacity-10`) ([#339](https://github.com/techniq/layerchart/pull/339))

- fix(render): Multiply `fillOpacity` by overall `opacity` for fill to support opacity classes (ex. `opacity-10`) ([#339](https://github.com/techniq/layerchart/pull/339))

- fix: Memoize creating canvas gradients to improve reactivity detection ([#339](https://github.com/techniq/layerchart/pull/339))

## 0.78.0

### Minor Changes

- feat: Pass `visibleSeries` as slot props (along with `series`) to enable filteirng custom tooltip implementations (slot override) ([`12a8068`](https://github.com/techniq/layerchart/commit/12a8068a9f3a1bed5da56a6e0301b244921b5c69))

## 0.77.0

### Minor Changes

- breaking(AreaChart|LineChart): Change default stroke width to `1` instead of `2` ([`be7e002`](https://github.com/techniq/layerchart/commit/be7e002aaa0328c830718475ed96acbf1b955f06))

### Patch Changes

- fix: Do not override default classes (ex. highlight series opacity) when providing other classes ([`c928a6a`](https://github.com/techniq/layerchart/commit/c928a6af7be2bb61d626d3bc51fefa55fd90c05b))

## 0.76.1

### Patch Changes

- fix: Do not override default Legend selected item classes when providing other classes ([`879898a`](https://github.com/techniq/layerchart/commit/879898a2123cdabdfcfacee5767deaf6185574e9))

## 0.76.0

### Minor Changes

- feat(TooltipContext): Support lockable tooltips, useful for interactive elements / dense data. Control using `<Chart tooltip={{ locked }}>` ([#333](https://github.com/techniq/layerchart/pull/333))

- feat(Tooltip): Support passing `pointerEvents` to enable clickable tooltip content. Useful with locked tooltips ([#333](https://github.com/techniq/layerchart/pull/333))

- feat(TooltipHeader): Support passing `value` and `format` (similar to TooltipItem) to simplify overrides from simplified charts ([#335](https://github.com/techniq/layerchart/pull/335))

- feat(AreaChart|BarChart|LineChart|ScatterChart): Enabling passing `props={{ tooltip: { header: { format: ... } } }}` ([#335](https://github.com/techniq/layerchart/pull/335))

- feat(BarChart): Add `<BarChart props={{ tooltip: { hideTotal: true } }}>` to hide total (useful for some group series use cases) ([#335](https://github.com/techniq/layerchart/pull/335))

### Patch Changes

- fix: Retain default tooltip context props (ex. `mode`, `onClick`) when passing additional props to simplified charts (ex. `<AreaChart tooltip={{ locked }}>`) ([#333](https://github.com/techniq/layerchart/pull/333))

## 0.75.1

### Patch Changes

- fix(AreaChart): Respect selected series (legend) when showing tooltip total ([`b59485d`](https://github.com/techniq/layerchart/commit/b59485d8514ab764ede988565f8717c42f4acd26))

- fix(TooltipContext): Fix event bubbling causing incorrect pointer coordinates when determine chart bounds. Fixes tooltip showing when hovering over portions of legend items ([`d620535`](https://github.com/techniq/layerchart/commit/d620535fd26ef6f470e4da19e5537cdfd71f378c))

## 0.75.0

### Minor Changes

- feat(AreaChart|BarChart|LineChart|PieChart|ScatterChart): Add Legend integration (highlight & filter) ([#329](https://github.com/techniq/layerchart/pull/329))

- feat(AreaChart|LineChart): Highlight series (desaturating other series) while hovering over point on series ([#329](https://github.com/techniq/layerchart/pull/329))

- feat(Highlight): Add `onPointEnter` and `onPointLeave` event callbacks ([#329](https://github.com/techniq/layerchart/pull/329))

- feat(Legend): Add `onPointerEnter` and `onPointerLeave` event callbacks ([#329](https://github.com/techniq/layerchart/pull/329))

- feat(Legend): Support `classes.item(item)` ([#329](https://github.com/techniq/layerchart/pull/329))

- feat: Add `profile` prop to all simplified charts to log initial render performance using `console.time` ([#330](https://github.com/techniq/layerchart/pull/330))

### Patch Changes

- docs: Add performance examples for different data structures (for further investigation) ([#330](https://github.com/techniq/layerchart/pull/330))

- fix(Area|Spline): Reactively recreate internally x/y accessors when props/context change. Fixes AreaChart legend filter support ([#329](https://github.com/techniq/layerchart/pull/329))

- fix(Legend): Add `z-index: 1` to stack above tooltip contexts (band rects, voronoi) to allow pointer events (click/hover) ([#329](https://github.com/techniq/layerchart/pull/329))

## 0.74.0

### Minor Changes

- breaking(Bar|Bars): Replaced `inset: number` prop with `insets: Insets | undefined`. ([#321](https://github.com/techniq/layerchart/pull/321))

  To migrate from `inset` to `insets` replace `inset = n` with:
  - `insets = { x: n / 2 }` if `orientation="vertical"`
  - `insets = { y: n / 2 }` if `orientation="horizontal"`

- feat(BarChart): Add `stackPadding` prop, which adds a padding between stacked bars. ([#321](https://github.com/techniq/layerchart/pull/321))

## 0.73.0

### Minor Changes

- feat: Support passing `props.tooltip` to all simplified charts, applying to `Tooltip.Root`, `Tooltip.Item`, etc ([`58d70fc`](https://github.com/techniq/layerchart/commit/58d70fc78c1a8706f962a97d1915f3b458b50fc2))

## 0.72.2

### Patch Changes

- fix(BarChart): Compatibility with Svelte 3/4 after accidental introduction of typescript in markup ([`59dc772`](https://github.com/techniq/layerchart/commit/59dc7728fdf4853ba0aff26f8a924e859b4ea3ac))

## 0.72.1

### Patch Changes

- fix: Compatibility with Svelte 3/4 after accidental introduction of typescript in markup ([`bec9207`](https://github.com/techniq/layerchart/commit/bec92074c75a8d9c18be20f7b00723c37ce19c4f))

## 0.72.0

### Minor Changes

- feat: Add `onTooltipClick` callback event for all simplified charts (AreaChart, BarChart, LineChart, PieChart, and ScatterChart) ([#322](https://github.com/techniq/layerchart/pull/322))

- feat(BarChart): Add `onBarClick` callback event (useful for multi-series charts) ([#322](https://github.com/techniq/layerchart/pull/322))

- feat(AreaChart|LineChart): Add `onPointClick` callback event (useful for multi-series charts) ([#322](https://github.com/techniq/layerchart/pull/322))

- feat(PieChart): Add `onArcClick` callback event ([#322](https://github.com/techniq/layerchart/pull/322))

- feat(Bars): Add `onBarClick` callback event ([#322](https://github.com/techniq/layerchart/pull/322))

- feat(Highlight): Add `onAreaClick`, `onBarClick`, and `onPointClick` callback events ([#322](https://github.com/techniq/layerchart/pull/322))

### Patch Changes

- fix(BarChart): Fix Tooltip handling with separate series data ([`6708650`](https://github.com/techniq/layerchart/commit/6708650bc9cf47bda60b86dae0ee97f2253a2656))

## 0.71.3

### Patch Changes

- fix(Tooltip): Only attempt repositiong if not fixed (ie. `pointer`/`data`) ([`7461788`](https://github.com/techniq/layerchart/commit/7461788aa1ed44d612d5725ac4a5a9d10c3ec485))

## 0.71.2

### Patch Changes

- fix(Spline): Remove redundant `{...$restProps}` which also caused default classes to be overridden (ex. `fill-none`) ([`487357a`](https://github.com/techniq/layerchart/commit/487357a5b0b11b9a5a110108cbeb5601daf20587))

## 0.71.1

### Patch Changes

- fix(Bar): Fix `strokeWidth` prop ([#316](https://github.com/techniq/layerchart/pull/316))
- fix(Spline): Pass `{...$restProps}` to underlying `<path>` element ([#316](https://github.com/techniq/layerchart/pull/316))

## 0.71.0

### Minor Changes

- feat(Tooltip): Support `contained="window"` to keep tooltip within window/viewport (along with `container` and `false`) ([`e00528a`](https://github.com/techniq/layerchart/commit/e00528abf8f2b9eab04cfc7cfb7e6cb2cb980c5d))

## 0.70.4

### Patch Changes

- feat(Axis): Add `classes` properties for `rule, `tick`, and `tickLabel` for convenient styling ([`5433da5`](https://github.com/techniq/layerchart/commit/5433da5a0e206fd7b7de2b100813de325ac71668))

## 0.70.3

### Patch Changes

- fix(AreaChart|LineChart): Handling finding closest series data point with complex data types (ex. `Date`) when using seperate series data ([`a75f612`](https://github.com/techniq/layerchart/commit/a75f61274cd2bf76119d9f21ca7dab33104df582))

## 0.70.2

### Patch Changes

- fix(AreaChart): Fix Area handling of separate series data ([`6a7be43`](https://github.com/techniq/layerchart/commit/6a7be43b8bab9b0a722914ad3c32e08f29cc3e4d))

- fix(LineChart|AreaChart): Fix Tooltip/Highlight handling of separate series data ([`6a7be43`](https://github.com/techniq/layerchart/commit/6a7be43b8bab9b0a722914ad3c32e08f29cc3e4d))

## 0.70.1

### Patch Changes

- fix: Use relative import instead of alias to fix npm usage ([`9c4a07a`](https://github.com/techniq/layerchart/commit/9c4a07a854380ebd527f83cb2e48080bc231dd1b))

## 0.70.0

### Minor Changes

- feat: Improve Canvas implementation with render registration system including synchronized invalidation / redrawing ([#295](https://github.com/techniq/layerchart/pull/295))

- feat: Support Canvas context for most primatives (Arc, Area, Circle, Group, Line, LinearGradient, Rect, Spline, and Text). Also updates components using these primatives (Axis, Bar, Grid, Rule, and more) ([#295](https://github.com/techniq/layerchart/pull/295))

- feat: Update all simplified charts to support `renderContext` prop to switch between Svg (default) and Canvas (AreaChart, BarChart, LineChart, PieChart, and ScatterChart) ([#295](https://github.com/techniq/layerchart/pull/295))

- feat: Add `renderPathData()` canvas util to simplify rendering SVG path data onto canvas context with CSS variable and class support ([#295](https://github.com/techniq/layerchart/pull/295))

- feat: Add `renderRect()` canvas util to simplify rendering rectangles onto canvas context with CSS variable and class support ([#295](https://github.com/techniq/layerchart/pull/295))

- feat: Add `renderText()` canvas util to simplify rendering text onto canvas context with CSS variable and class support ([#295](https://github.com/techniq/layerchart/pull/295))

- feat: Add `ComputedStyles` component to easily resolve classes / CSS variable values (useful when working with <canvas>) ([#295](https://github.com/techniq/layerchart/pull/295))

- feat(Canvas): Support `center` prop (similar to `Svg`) to translate children to center (useful for radial layouts) ([#295](https://github.com/techniq/layerchart/pull/295))

- breaking(LinearGradient|RadialGradient): Rename `url` slot prop to `gradient`. Improves name, especially within canvas context ([#295](https://github.com/techniq/layerchart/pull/295))

- breaking(GeoPath): Simplify render prop use case by leveraging renderPathData() (ex. HitCanvas) ([#295](https://github.com/techniq/layerchart/pull/295))

- breaking: Reduce likihood of clipping for Canvas-rendered simplified charts by increasing default padding (and add top)) ([#295](https://github.com/techniq/layerchart/pull/295))

### Patch Changes

- fix(Canvas): Support multiple children (fix infinite loops, coordinating redraws, etc). Resolves issue #158 ([#295](https://github.com/techniq/layerchart/pull/295))

- feat: Add `scaleCanvas` util ([#295](https://github.com/techniq/layerchart/pull/295))

- feat: Add `spikePath()` util ([#295](https://github.com/techniq/layerchart/pull/295))

- feat: Add `clearCanvasContext()` util ([#295](https://github.com/techniq/layerchart/pull/295))

- fix(circlePath): Correctly handle sweep argument ([#295](https://github.com/techniq/layerchart/pull/295))

## 0.60.3

### Patch Changes

- Remove `posthog-js` from `dependencies` (only `devDependencies` for docs) ([`0d72288`](https://github.com/techniq/layerchart/commit/0d722889a2d8bb796336fef50e53ae7cc065ef65))

## 0.60.2

### Patch Changes

- fix(ScatterChart): Default yScale to scaleLinear/scaleTime based on first data's `y` value (matching `xScale` behavior) ([`197d7fd`](https://github.com/techniq/layerchart/commit/197d7fd992a8d26f6441d831fcfe79f7b17d3fcf))

- fix: Allow overriding xScale/yScale for simplified charts (AreaChart, BarChart, etc) ([`197d7fd`](https://github.com/techniq/layerchart/commit/197d7fd992a8d26f6441d831fcfe79f7b17d3fcf))

## 0.60.1

### Patch Changes

- Update dependencies, notable Vite 5=>6 and Svelte 5 to latest (silence/fix `reactive_declaration_non_reactive_property`) ([`30e612d`](https://github.com/techniq/layerchart/commit/30e612d1ef8d4467000a3f4f2a87880762cf5e5d))

- fix(Dagre): Add missing `lang="ts"` and use Svelte 3/4 compat `context="module"` instead of `module` ([`bfed785`](https://github.com/techniq/layerchart/commit/bfed78593b58fbbe000722701d89c3b81005ed8c))

## 0.60.0

### Minor Changes

- feat: Add Dagre layout component for directed acyclic graphs (DAGs) ([#268](https://github.com/techniq/layerchart/pull/268))

### Patch Changes

- fix(Spline): Improve initial data display / transition on non-cartesian charts (ex. hierarchy/graph) ([#268](https://github.com/techniq/layerchart/pull/268))

## 0.59.6

### Patch Changes

- fix(Legend): Fix reactivity when scale/data changes. Fixes #289 ([`0dea00b`](https://github.com/techniq/layerchart/commit/0dea00b4663d07e11707cb52c3b716df46b59778))

## 0.59.5

### Patch Changes

- Update dependencies ([`2d74395`](https://github.com/techniq/layerchart/commit/2d743954c05c86fe198cf5ff1cf9f826574ce86f))

- fix(PieChart): Fix handling of outerRadius with single series ([`adb40e2`](https://github.com/techniq/layerchart/commit/adb40e2f22fb0a9a7462bffb02ee140b449e9029))

## 0.59.4

### Patch Changes

- fix(ChartContext): Remove last `@layerstack/utils/array` import ([`6b88925`](https://github.com/techniq/layerchart/commit/6b8892597faab114c693673787643f6eabd86700))

## 0.59.3

### Patch Changes

- Update `@layerstack/*` packages and remove deep imports (ex. `@layerstack/utils/array`) ([`9621a4e`](https://github.com/techniq/layerchart/commit/9621a4e62c7519b3b1556a28765080c185ef87d8))

## 0.59.2

### Patch Changes

- fix(Bars,Labels): Add `key()` acccessor to set `{#each}` key for improved transitions ([`7acaa43`](https://github.com/techniq/layerchart/commit/7acaa43ee1b9a819506f3241cd5a4910d202aa2e))

- fix: Use `series.key` as {#each} key for better transitions (hide/show series) ([`5139159`](https://github.com/techniq/layerchart/commit/5139159bacf9203d2f1e0eae38f4a54afa9f896c))

- feat(Labels): Support overriding text with default slot ([`1492cdc`](https://github.com/techniq/layerchart/commit/1492cdcd8d6521c4b09b88c334b2118bfd378214))

- Add `default` to `package.json` `exports` to improve webpack/rollup compatibility ([`a63fccc`](https://github.com/techniq/layerchart/commit/a63fccc643a729c33cce8246615847cc97f34adb))

## 0.59.1

### Patch Changes

- fix(Spline): Improve defaultPathData() by handling explicit `pathData` (ex. Bar) and non-cartesian (ex. graph/hierarchy) usage ([`7dcd042`](https://github.com/techniq/layerchart/commit/7dcd0421790b1d13822d8ef99cfa02fa0d5ebf72))

## 0.59.0

### Minor Changes

- feat(Bar): Add `none` rounded option ([#280](https://github.com/techniq/layerchart/pull/280))

- feat(Bar): Support `rounded="edge"` for value and orientation aware single edge rounding ([#280](https://github.com/techniq/layerchart/pull/280))

- feat(BarChart): Use new `rounded="edge"` for better default rounding, especially with `seriesLayout="stack"` ([#280](https://github.com/techniq/layerchart/pull/280))

## 0.58.4

### Patch Changes

- fix(Area): Improve initial tweened transition (matching Spline) ([`13c1ce5`](https://github.com/techniq/layerchart/commit/13c1ce5208356233c5b3ca2fb971fe4feefc8e5f))

## 0.58.3

### Patch Changes

- fix(Spline): Refine default path data to handle `0` out of visible range and improve custom curve tweening ([`0b06ee0`](https://github.com/techniq/layerchart/commit/0b06ee0dc07755c2424df4cf0e97d242a1b2f155))

## 0.58.2

### Patch Changes

- fix(Spline): Improve initial `tweened` transition ([`ddddb7e`](https://github.com/techniq/layerchart/commit/ddddb7e09ab6e66cdcd5f2fd81ba04fc9a1c5c4e))

## 0.58.1

### Patch Changes

- fix(Tooltip): Disable `user-select` by default for a better mobile experience ([`6806cc6`](https://github.com/techniq/layerchart/commit/6806cc65c3d49c18b67f4491d620c2cf425df4b3))

## 0.58.0

### Minor Changes

- feat(Pie): Add `sort` prop to specify sorting comparator, or pass `null` to disable default sorting ([`56f84b5`](https://github.com/techniq/layerchart/commit/56f84b5a7b27548ecefca86ef3f88200eb0f1a7d))

- feat(Legend): Add `onClick` when using `variant="swatches"` ([`7629194`](https://github.com/techniq/layerchart/commit/76291940ec1744fcd887e1e6463549f99c1b94cd))

### Patch Changes

- fix(ScatterChart): Reactively rebuild `chartData` when `series` is updated ([`ad04197`](https://github.com/techniq/layerchart/commit/ad0419739652e72c8bc7e7c14edc1ac11b4bc798))

## 0.57.0

### Minor Changes

- feat(PieChart): Add `placement` prop to conveniently position chart left or right (useful with legends). Resolves #271 ([`7498738`](https://github.com/techniq/layerchart/commit/7498738869ce393474cc0c5893e7c291dcbf6541))

## 0.56.0

### Minor Changes

- feat(PieChart): Support `center={false}` to disable default centering, enabling explicit/absolute positioning with `props.group` ([`bb241d5`](https://github.com/techniq/layerchart/commit/bb241d565434984106744aa44ce255b072027be6))

## 0.55.0

### Minor Changes

- feat: Add Marker support for Spline, Line, and Link (and components which use these) ([#267](https://github.com/techniq/layerchart/pull/267))

- feat: Add Marker component for drawing arrowheads or polymarkers on Line, Spline, etc ([#267](https://github.com/techniq/layerchart/pull/267))

- feat(Brush): Add `labels` prop and slot to enable showing values beside each handle ([#265](https://github.com/techniq/layerchart/pull/265))

- breaking: Use camelCase (`aboveMarks`, etc) instead of kebob case (`above-marks`) slot names to fix Svelte 5 `{#snippet}` compatibility ([#269](https://github.com/techniq/layerchart/pull/269))

### Patch Changes

- fix: Render axis slot after/above marks (Bars, Lines, etc) which has no visible difference with current examples, but enables placing axis labels on top of marks ([`c10452e`](https://github.com/techniq/layerchart/commit/c10452e51f3bfb649606ea112c50d7b9fa343db1))

- fix(Brush): Do not convert `Date` domain instances to `number` when performing arithmetic ([#265](https://github.com/techniq/layerchart/pull/265))

## 0.54.1

### Patch Changes

- docs: Use Svelte 5 ([#260](https://github.com/techniq/layerchart/pull/260))

- docs: Replace svelte-preprocess with vitePreprocess ([#260](https://github.com/techniq/layerchart/pull/260))

- fix(Grid): Add {#each} keys to fix transitions ([`4b14a2e`](https://github.com/techniq/layerchart/commit/4b14a2e621a4f4eeaa9618a48a5cc764642c563a))

- fix(Rule): Fix reactivity issue with dynamic data not hiding rule when outside x/y range ([`cb9cb03`](https://github.com/techniq/layerchart/commit/cb9cb03fe76d84027035b187a1e7f4439f126b90))

- fix(BarChart): Only show `0` baseline rule based on direction (not both axis) ([`129163e`](https://github.com/techniq/layerchart/commit/129163eebf4bb8ab200b6e3380d76ab39774565d))

## 0.54.0

### Minor Changes

- feat: New Grid component (improved band scale and radial support) ([#252](https://github.com/techniq/layerchart/pull/252))

- feat: Simplify overriding marks for AreaChart, BarChart, LineChart, and ScatterChart, useful for gradients and motion ([#252](https://github.com/techniq/layerchart/pull/252))

- feat(Chart): Expose `tooltipContext` and `geoProjection` context stores for external access ([#252](https://github.com/techniq/layerchart/pull/252))

- feat(Rule): Add xOffset/yOffset support ([#252](https://github.com/techniq/layerchart/pull/252))

- feat(Axis): Use `Rule` for `rule` and `grid` lines to simplify implementation and support passing full props ([#252](https://github.com/techniq/layerchart/pull/252))

- feat(Labels): Add `value` accessor prop to override which value to display (different axis, etc) ([#252](https://github.com/techniq/layerchart/pull/252))

- feat(Axis): Support radial tick marks (angle) ([#252](https://github.com/techniq/layerchart/pull/252))

- feat(BarChart): Support using color (`c`) scale to change color based on value ([#252](https://github.com/techniq/layerchart/pull/252))

- breaking(Tooltip.Root): Default xOffset/yOffset to `0` unless using 'pointer' mode (only changes `data` mode default) ([#252](https://github.com/techniq/layerchart/pull/252))

### Patch Changes

- fix(Legend): Disable whitespace wrapping by default ([#252](https://github.com/techniq/layerchart/pull/252))

- fix(Tooltip.Root): Align data snapped to band/bar center (instead of edge) ([#252](https://github.com/techniq/layerchart/pull/252))

- fix: Pass color accessor (`c`) and scale (`cScale`) as slot props for simplified charts (AreaChart, etc) ([#252](https://github.com/techniq/layerchart/pull/252))

- fix(Chart): Fix types when passing readonly string[] color ranges (i.e. d3-scale-chromatic schemes) ([#252](https://github.com/techniq/layerchart/pull/252))

- fix(Axis): Middle align 12 o'clock (0/360deg) tick label ([#252](https://github.com/techniq/layerchart/pull/252))

- fix(Axis): Respect `tickLength` when positioning tick label/text ([#252](https://github.com/techniq/layerchart/pull/252))

- fix(Simplified charts): Use color scale for Legend when using single (default) series ([#252](https://github.com/techniq/layerchart/pull/252))

- fix(TransformContext): Only disable touchmove default (i.e. scrolling) when enabled (canvas/manual) and pointer events are not disabled ([#252](https://github.com/techniq/layerchart/pull/252))

- docs: Copy `Date` data as `new Date(...)` to clipboard ([#253](https://github.com/techniq/layerchart/pull/253))

- docs: Stringify example data to clipboard on demand ([#253](https://github.com/techniq/layerchart/pull/253))

- docs(PieChart): Add examples for using d3-scale-chromatic schemes and interpolators ([#252](https://github.com/techniq/layerchart/pull/252))

## 0.53.0

### Minor Changes

- breaking(PieChart): Rename current `label` prop to `key` and add new `label` prop ([`775102657e8dd54d504e468d61e98603d0fdc5f4`](https://github.com/techniq/layerchart/commit/775102657e8dd54d504e468d61e98603d0fdc5f4))

### Patch Changes

- fix(Brush): Fix pointer padding offset (missing parens) ([`b9ed17f5d6eb9ed3adf4494687102615acfcea86`](https://github.com/techniq/layerchart/commit/b9ed17f5d6eb9ed3adf4494687102615acfcea86))

- fix: Respect series label (if defined) for simplified chart legends (AreaChart, BarChart, ScatterChart) ([`e20576536e4510b248fb4d5d6f52c1702bf49311`](https://github.com/techniq/layerchart/commit/e20576536e4510b248fb4d5d6f52c1702bf49311))

## 0.52.1

### Patch Changes

- feat: Format `seriesExpand` series layout using `percentRound` by default ([`337e68396307319a0b99602a447f5e62f672993d`](https://github.com/techniq/layerchart/commit/337e68396307319a0b99602a447f5e62f672993d))

## 0.52.0

### Minor Changes

- breaking: Only show `0` baseline by default instead of always drawing axis line for simplified charts (LineChart, etc) ([#248](https://github.com/techniq/layerchart/pull/248))

- feat: Add `stackExpand` and `stackDiverging` series layouts for AreaChart and BarChart ([#248](https://github.com/techniq/layerchart/pull/248))

- feat: Add legend support (prop and slot) to all simplified charts ([#248](https://github.com/techniq/layerchart/pull/248))

- feat(Rule): Support radial charts (x/angle and y/radius) ([#248](https://github.com/techniq/layerchart/pull/248))

- feat(Legend): Add `orientation` prop ([#248](https://github.com/techniq/layerchart/pull/248))

- feat(Axis): Support passing `class` and `classes` (root/label) ([#248](https://github.com/techniq/layerchart/pull/248))

- feat(Legend): Add `variant` prop with `ramp` (default) and `swatches` ([#248](https://github.com/techniq/layerchart/pull/248))

### Patch Changes

- fix(BarChart): Fix `groupPadding` not exposed on $Props ([`c01a9f597037f9f812c49ceb41c8752438537532`](https://github.com/techniq/layerchart/commit/c01a9f597037f9f812c49ceb41c8752438537532))

- fix: Remove use of `SvelteComponent` which is not compatible with Svelte 5 ([#248](https://github.com/techniq/layerchart/pull/248))

- fix(PieChart): Pass series props to underlying Arcs ([#248](https://github.com/techniq/layerchart/pull/248))

## 0.51.2

### Patch Changes

- feat: Support convenient single-axis display using `axis="x"` or `axis="y"` for all simplified charts ([`e50889679a48a7581a7b118d7b4408f51537c51f`](https://github.com/techniq/layerchart/commit/e50889679a48a7581a7b118d7b4408f51537c51f))

## 0.51.1

### Patch Changes

- fix(AreaChart): Fix passing line stroke-width overriding series color ([`b60cb6f4217d4f180497bab44d6fc2bae529b9a9`](https://github.com/techniq/layerchart/commit/b60cb6f4217d4f180497bab44d6fc2bae529b9a9))

- feat(AreaChart): Support passing `line` props directly (instead of via `area.line`) ([`b60cb6f4217d4f180497bab44d6fc2bae529b9a9`](https://github.com/techniq/layerchart/commit/b60cb6f4217d4f180497bab44d6fc2bae529b9a9))

## 0.51.0

### Minor Changes

- breaking: Remove `TransformControls` from top-level exports after demotion of Svelte UX to `devDependencies` ([`b60356d59bd4e21593a73625182304e481b648f4`](https://github.com/techniq/layerchart/commit/b60356d59bd4e21593a73625182304e481b648f4))

### Patch Changes

- fix(ChartContext): Incorrect createScale import path ([`fcf4262ef153b11622da72e4ef3d5c2a29e743ea`](https://github.com/techniq/layerchart/commit/fcf4262ef153b11622da72e4ef3d5c2a29e743ea))

- fix: Use `unique()` from `@layerstack/utils` instead of `svelte-ux` ([`b64e078fc83a75076facd7c14b5c35acf30e9ab5`](https://github.com/techniq/layerchart/commit/b64e078fc83a75076facd7c14b5c35acf30e9ab5))

- fix: Use typeGuards from `@layerstack/utils` instead of `svelte-ux` ([`1e7778f8496d61a44bdf6ef018eb016047159e42`](https://github.com/techniq/layerchart/commit/1e7778f8496d61a44bdf6ef018eb016047159e42))

## 0.50.0

### Minor Changes

- feat: Add simplified charts to streamline creating common chart types with recommended conventions and granular extensibility (AreaChart, BarChart, LineChart, PieChart, and ScatterChart) ([#224](https://github.com/techniq/layerchart/pull/224))

- feat(Svg): Add `center` to conveniently center children, useful for radial layouts without requiring `Group` wrapper ([#224](https://github.com/techniq/layerchart/pull/224))

- refactor: Add `@layerstack/svelte-actions`, `@layerstack/svelte-stores`, `@layerstack/tailwind`, and `@layerstack/utils` packages and move `svelte-ux` package to `devDependancies` (components only for docs) ([#224](https://github.com/techniq/layerchart/pull/224))

- breaking: Add new color `cScale` (and related `c` accessor, domain, range, etc) and replace `rScale` usage (which should be used for radius, etc) ([#224](https://github.com/techniq/layerchart/pull/224))

- breaking(Tooltip): Rename Tooltip to Tooltip.Root ([#224](https://github.com/techniq/layerchart/pull/224))

- breaking(Tooltip): Consolidate Tooltip components (TooltipItem, TooltipSeparator, etc) to Tooltip.Item, Tooltip.Separtor, etc ([#224](https://github.com/techniq/layerchart/pull/224))

- breaking(Tooltip): Remove default grid on Tooltip.Root and add Tooltip.List as Tooltip.Item container ([#224](https://github.com/techniq/layerchart/pull/224))

- breaking: Remove <Tooltip.Root header={...}> and replace with <Tooltip.Header> ([#224](https://github.com/techniq/layerchart/pull/224))

- breaking(Chart): Default domain sorting to `false` (instead of LayerCake's `true`) to simplify bandScale use cases ([#224](https://github.com/techniq/layerchart/pull/224))

- breaking: Remove `AreaStack` as use cases fully supported by `Area` ([#224](https://github.com/techniq/layerchart/pull/224))

- breaking(Pie): Remove `placement` prop and instead rely Svg `center` or use `Group` for positioning ([#224](https://github.com/techniq/layerchart/pull/224))

- breaking(Threshold): Simplify implementation and rename `pathAbove`/`pathBelow` slots to `above`/`below` ([#224](https://github.com/techniq/layerchart/pull/224))

- breaking(Bar/Bars): Replace groupBy/groupPadding with Chart-level x1/y1 derived scales ([#224](https://github.com/techniq/layerchart/pull/224))

- breaking: Rename `createStackData()` to `groupStackData()`, refine returned structure to simplify tooltips and make consistent with different options combinations, and add tests ([#224](https://github.com/techniq/layerchart/pull/224))

### Patch Changes

- feat(Chart): Support x1/y1 derived scales, useful for grouped bar charts ([#224](https://github.com/techniq/layerchart/pull/224))

- feat(tooltip): Update bisect-x mode to support radial coordinates ([#224](https://github.com/techniq/layerchart/pull/224))

- feat(Tooltip.Item): Support `color` prop to add swatch, support theme colors and any color via `color="variable"` ([#224](https://github.com/techniq/layerchart/pull/224))

- feat(Arc): Support passing `tooltip` and `data` props to simplify setting up tooltip pointer events ([#224](https://github.com/techniq/layerchart/pull/224))

- feat(Points): Integrate with rScale ([#224](https://github.com/techniq/layerchart/pull/224))

- feat(Bars): Support passing `data` override ([#224](https://github.com/techniq/layerchart/pull/224))

- feat(Chart): Expose `config` as slot prop ([#224](https://github.com/techniq/layerchart/pull/224))

- feat(Bar): Forward pointer events to enable individual bar tooltips ([#224](https://github.com/techniq/layerchart/pull/224))

- feat(Voronoi): Support radial coordinates. Issue #112 ([#224](https://github.com/techniq/layerchart/pull/224))

- feat(Points): Add `xValue` and `yValue` to each point, and improve types ([#224](https://github.com/techniq/layerchart/pull/224))

- feat(Highlight): Support radial coordiantes for `points` and `lines`. Issue #112 ([#224](https://github.com/techniq/layerchart/pull/224))

- feat(Labels): Support `center` placement (useful with Points) ([#224](https://github.com/techniq/layerchart/pull/224))

- feat(Points): Add canvas support ([#224](https://github.com/techniq/layerchart/pull/224))

- feat(Chart): Expose `x`/`y`/`z`/`r` accessors via slot props ([#224](https://github.com/techniq/layerchart/pull/224))

- fix(Highlight): Handle non-zero y values when drawing lines (ex. radial line chart with inner radius) ([#224](https://github.com/techniq/layerchart/pull/224))

- fix(Labels): Handle multiple x or y properties (stack, diverting) by leveraging Points component internally ([#224](https://github.com/techniq/layerchart/pull/224))

- fix(Spline): Handle null data via defined by default ([#224](https://github.com/techniq/layerchart/pull/224))

- fix(TooltipSeparator): Use theme color ([#224](https://github.com/techniq/layerchart/pull/224))

- fix(Area): Handle null data via defined by default ([#224](https://github.com/techniq/layerchart/pull/224))

- fix(Highlight): Handle null value points ([#224](https://github.com/techniq/layerchart/pull/224))

- fix(Voronoi): Dispatch custom `pointerevent` instead of forwarding to fix console errors ([#224](https://github.com/techniq/layerchart/pull/224))

- fix(Points): Remove incorrect points for null/undefined values ([#224](https://github.com/techniq/layerchart/pull/224))

- fix(Area): Pass `x` override to internal Spline ([#224](https://github.com/techniq/layerchart/pull/224))

- fix(Spline): Enable passing `fill` prop (useful for Bar with single rounded edge) ([#224](https://github.com/techniq/layerchart/pull/224))

- fix(cartesianToPolar): Correctly calculate angle/radians between 0 and 2π ([#224](https://github.com/techniq/layerchart/pull/224))

## 0.44.0

### Minor Changes

- Add 'on:resize' (`{ width: number, height: number}`) event to `Chart` and `ChartContext` ([#231](https://github.com/techniq/layerchart/pull/231))

## 0.43.8

### Patch Changes

- Update dependencies. Remove node 18.x from CI workflows ([`84a98153cdf28f78db23ad42a3f6cf3e3a54010c`](https://github.com/techniq/layerchart/commit/84a98153cdf28f78db23ad42a3f6cf3e3a54010c))

- [Highlight] Fix usage with Histogram ([`67fbd8ded184549ffd202bb9f07869a40e85679f`](https://github.com/techniq/layerchart/commit/67fbd8ded184549ffd202bb9f07869a40e85679f))

## 0.43.7

### Patch Changes

- Update dependencies ([`b380b3603277e6cb9e9e29921e862a8e88549c2d`](https://github.com/techniq/layerchart/commit/b380b3603277e6cb9e9e29921e862a8e88549c2d))

- [Area] Support string accessors overrides for `x`, `y0`, and `y0` ([`b7e5fb2ee583649eea26ce1f956460a42b6ada33`](https://github.com/techniq/layerchart/commit/b7e5fb2ee583649eea26ce1f956460a42b6ada33))

- [Threshold] Support string accessors overrides for `x`, `y0`, and `y0` ([`b7e5fb2ee583649eea26ce1f956460a42b6ada33`](https://github.com/techniq/layerchart/commit/b7e5fb2ee583649eea26ce1f956460a42b6ada33))

- [Spline] Support scaleBand() by shifting 1/2 bandwidth ([`f67967af27378bdcd5afd5a32b47d8c8c898f508`](https://github.com/techniq/layerchart/commit/f67967af27378bdcd5afd5a32b47d8c8c898f508))

- [Area] Support scaleBand() by shifting 1/2 bandwidth ([`f67967af27378bdcd5afd5a32b47d8c8c898f508`](https://github.com/techniq/layerchart/commit/f67967af27378bdcd5afd5a32b47d8c8c898f508))

- [Spline] Support string accessors overrides for `x` and `y`` ([`b7e5fb2ee583649eea26ce1f956460a42b6ada33`](https://github.com/techniq/layerchart/commit/b7e5fb2ee583649eea26ce1f956460a42b6ada33))

## 0.43.6

### Patch Changes

- Improve `scaleBandInvert()` padding handling, which improves `tooltip: { mode: bisect-x }` when using band scales (bar charts) ([`837becc499c7ef77c1de719b7a7aec5c88cd5844`](https://github.com/techniq/layerchart/commit/837becc499c7ef77c1de719b7a7aec5c88cd5844))

## 0.43.5

### Patch Changes

- [Highlight] Fix coloring points with primary color by default ([`cad5382e69e8ecb782f2935c2babcac70387be05`](https://github.com/techniq/layerchart/commit/cad5382e69e8ecb782f2935c2babcac70387be05))

- [Chart] Relax DomainType typing to be more forgiving ([`1ab9d85f61053e714e734ea1df6bf98333255acd`](https://github.com/techniq/layerchart/commit/1ab9d85f61053e714e734ea1df6bf98333255acd))

## 0.43.4

### Patch Changes

- [Highlight] Support passing `x` and `y` accessor overrides (useful with area series via overrides). ([`377c544bed4372aff1f99e49c4aae42ca2e7e0ba`](https://github.com/techniq/layerchart/commit/377c544bed4372aff1f99e49c4aae42ca2e7e0ba))

## 0.43.3

### Patch Changes

- [Highlight] Support non-stack array accessor when displaying points ([#215](https://github.com/techniq/layerchart/pull/215))

## 0.43.2

### Patch Changes

- [Highlight] Support stack data showing individual points and with correct color ([#213](https://github.com/techniq/layerchart/pull/213))

- Add `chartDataArray()` util to guarantee data is an array (handling hierarchy and graph data) ([`a8dfece83774d1b5d11ba2c6aa7e31ae5ec1e3a0`](https://github.com/techniq/layerchart/commit/a8dfece83774d1b5d11ba2c6aa7e31ae5ec1e3a0))

## 0.43.1

### Patch Changes

- Fix aliased import for utils/common.js ([`526f06edd5003f900456a545f47c97775bead6f5`](https://github.com/techniq/layerchart/commit/526f06edd5003f900456a545f47c97775bead6f5))

## 0.43.0

### Minor Changes

- Cleanup a11y and TS warnings/errors ([#207](https://github.com/techniq/layerchart/pull/207))

- Improve types across project ([#207](https://github.com/techniq/layerchart/pull/207))

### Patch Changes

- Add type-safe `chartContext()` instead of using `getContext('LayerCake')` ([#207](https://github.com/techniq/layerchart/pull/207))

## 0.42.0

### Minor Changes

- [ForceSimulation] Refactor to allow for more dynamic and efficient simulations ([#210](https://github.com/techniq/layerchart/pull/210))

- [ForceSimulation] Export `cloneData` as `const`, rather than `let` (resolves #203) ([#210](https://github.com/techniq/layerchart/pull/210))

- [ForceSimulation] Automatically evict dropped forces (resolves #206) ([#210](https://github.com/techniq/layerchart/pull/210))

- [ForceSimulation] Add export of `start`, `tick` and `end` events (resolves #198) ([#210](https://github.com/techniq/layerchart/pull/210))

- [ForceSimulation] Have `alpha` prop reflect the internal d3 simulation's alpha state ([#210](https://github.com/techniq/layerchart/pull/210))

### Patch Changes

- [ForceSimulation] No longer re-initialize all forces if any of them changes (resolves #201) ([#210](https://github.com/techniq/layerchart/pull/210))

- [Chart] Only apply `fitGeojson` when using `<Chart geo={{ applyTransform: ['translate'] }}>`. Fixes globe initial rotation ([`8132ea968c1cc5a986fc883eced8399f014433b3`](https://github.com/techniq/layerchart/commit/8132ea968c1cc5a986fc883eced8399f014433b3))

- [ForceSimulation] No longer re-initialize forces on unrelated prop-changes (resolves #204) ([#210](https://github.com/techniq/layerchart/pull/210))

## 0.41.6

### Patch Changes

- Update dependencies ([`1b761a2ec6d2b6c12e357d7a73d35650c09a4c0f`](https://github.com/techniq/layerchart/commit/1b761a2ec6d2b6c12e357d7a73d35650c09a4c0f))

## 0.41.5

### Patch Changes

- Move vite-plugin-svelte to devDependencies ([`fc1a9a1ed0851800d347d99abb949c83a3f6599e`](https://github.com/techniq/layerchart/commit/fc1a9a1ed0851800d347d99abb949c83a3f6599e))

## 0.41.4

### Patch Changes

- [GeoPath] Remove second dispatched `click` event ([`1c92b61549b5a8d4b18c93920482d8cbbe418d88`](https://github.com/techniq/layerchart/commit/1c92b61549b5a8d4b18c93920482d8cbbe418d88))

- [GeoPath] Properly clear canvas when using chart padding ([`74d7efa63e48d44c49ec582711eff09d1cc0f547`](https://github.com/techniq/layerchart/commit/74d7efa63e48d44c49ec582711eff09d1cc0f547))

## 0.41.3

### Patch Changes

- [GeoTile] Properly handle chart padding ([`4c7f3f5ea1322ec82fa75f09ef7416a0581f2715`](https://github.com/techniq/layerchart/commit/4c7f3f5ea1322ec82fa75f09ef7416a0581f2715))

## 0.41.2

### Patch Changes

- Update dependencies ([`9971d9ebee316b8515e3072c462123eff0e30e10`](https://github.com/techniq/layerchart/commit/9971d9ebee316b8515e3072c462123eff0e30e10))

- [GeoPath] Add `geoTransform` prop to apply transform to projection. Useful to draw straight lines with `geoMercator` projection. ([`7495ea67bb42e83cc900749c380e123a99a41a1d`](https://github.com/techniq/layerchart/commit/7495ea67bb42e83cc900749c380e123a99a41a1d))

## 0.41.1

### Patch Changes

- [TooltipContext] Fix touch dragging to update tooltip highlighted when using `band` and `voronoi` modes (path based) ([`7093367c803ee25557e3522bb7b6a082be72b5cf`](https://github.com/techniq/layerchart/commit/7093367c803ee25557e3522bb7b6a082be72b5cf))

## 0.41.0

### Minor Changes

- [Tooltip] Rename `animate` to `motion` to align with `Highlight` ([`e9f850336d10603a5984421413dc4df61212dc62`](https://github.com/techniq/layerchart/commit/e9f850336d10603a5984421413dc4df61212dc62))

### Patch Changes

- [Highlight] Add `motion` prop to support disabling spring transitions ([`73634e18763429388e21d1c1ccd2d80c3bc574a6`](https://github.com/techniq/layerchart/commit/73634e18763429388e21d1c1ccd2d80c3bc574a6))

## 0.40.3

### Patch Changes

- Fix Legend placement with Chart padding after recent TooltipContext layout changes ([`2633ea4b0f32803f80055c62538ae2b2213bb493`](https://github.com/techniq/layerchart/commit/2633ea4b0f32803f80055c62538ae2b2213bb493))

## 0.40.2

### Patch Changes

- [TooltipContext] Fix Legend placement with bisect-x (etc) mode ([`eaf7d8ded501c39adfdb288f7c627ec1e9a0c62b`](https://github.com/techniq/layerchart/commit/eaf7d8ded501c39adfdb288f7c627ec1e9a0c62b))

## 0.40.1

### Patch Changes

- [Chart] Update Accessor type to support <Chart y={[0,1]} /> ([`c2671503c6677efbeef02f47956aa2b1cf7bfd7d`](https://github.com/techniq/layerchart/commit/c2671503c6677efbeef02f47956aa2b1cf7bfd7d))

## 0.40.0

### Minor Changes

- Add Brush component ([#175](https://github.com/techniq/layerchart/pull/175))

- [ChartClipPath] Remove padding by default (opt-in with `full`) ([#175](https://github.com/techniq/layerchart/pull/175))

- [Chart] Remove `fitGeoObject` prop and use `fitGeojson` along with `applyTransform` on `<Chart geo={...}>` to apply to TransformContext ([`60d095dd1ac523b4aef3b10eaff9200a8d9103ce`](https://github.com/techniq/layerchart/commit/60d095dd1ac523b4aef3b10eaff9200a8d9103ce))

### Patch Changes

- [Frame] Expose `rectEl` and forward `mousedown`, `touchstart`, and `dblclick` events ([#175](https://github.com/techniq/layerchart/pull/175))

- Update dependencies ([`552fb069940920d48ea0a27b8c196aa1d6309812`](https://github.com/techniq/layerchart/commit/552fb069940920d48ea0a27b8c196aa1d6309812))

- [Group] Forward `dblclick` event ([#175](https://github.com/techniq/layerchart/pull/175))

## 0.39.0

### Minor Changes

- [TransformContext] Rename `scroll` prop to `initialScrollMode`. Expose `scrollMode` store in context ([`746c61cc0710967d981a1337a6e3d5ce21a9a626`](https://github.com/techniq/layerchart/commit/746c61cc0710967d981a1337a6e3d5ce21a9a626))

### Patch Changes

- [TransformControls] Support hiding actions via `show` prop ([`faeb9268ba02317abaf4ca5e94a70ae135fa529a`](https://github.com/techniq/layerchart/commit/faeb9268ba02317abaf4ca5e94a70ae135fa529a))

- [TransformControls] Support setting `scrollMode` ([`746c61cc0710967d981a1337a6e3d5ce21a9a626`](https://github.com/techniq/layerchart/commit/746c61cc0710967d981a1337a6e3d5ce21a9a626))

- [TransformControls] Do not propogate double click event (to TransformContext) ([`fe2a0ca3283d17a18ea6dce552fcb8b1fe2c1dfe`](https://github.com/techniq/layerchart/commit/fe2a0ca3283d17a18ea6dce552fcb8b1fe2c1dfe))

- Update dependencies ([`38c1768fb7bce8a97ae6d66c9b27be22918ad85c`](https://github.com/techniq/layerchart/commit/38c1768fb7bce8a97ae6d66c9b27be22918ad85c))

## 0.38.6

### Patch Changes

- [Canvas] Use full container (like Svg) which provides better result when zooming. Also fixes transform jumping as offsetX/offsetY does not including position/padding/margin values ([`95a2c61118a70f23ee42bdfabdec52f6a20b494d`](https://github.com/techniq/layerchart/commit/95a2c61118a70f23ee42bdfabdec52f6a20b494d))

## 0.38.5

### Patch Changes

- [Axis] Support passing `ticks={number}` when using band scale (every nth domain value) ([`ca1a23e26d211b4f5adefdf8259a933a04662465`](https://github.com/techniq/layerchart/commit/ca1a23e26d211b4f5adefdf8259a933a04662465))

## 0.38.4

### Patch Changes

- [GeoPath] Remove use of $props to fix dirty check in some reactive situations (particularly with HitCanvas) ([`fa6ba214110822e64c17f228705db967ae3f4a82`](https://github.com/techniq/layerchart/commit/fa6ba214110822e64c17f228705db967ae3f4a82))

## 0.38.3

### Patch Changes

- [TransformContext] Set `dragging` false on pointer up. Track when translation or scaling is in progress ([#178](https://github.com/techniq/layerchart/pull/178))

- Add LayerChart implemetation for Html (like Svg/Canvas). Support passing classes to Svg/Html (like Canvas). ([`044ef6fd9843d01b0481ea28871efeb490ccbed8`](https://github.com/techniq/layerchart/commit/044ef6fd9843d01b0481ea28871efeb490ccbed8))

- [HitCanvas] Do not render while dragging to improve interaction performance ([`395504926b0aec028a95d1cb315bc004de32cb95`](https://github.com/techniq/layerchart/commit/395504926b0aec028a95d1cb315bc004de32cb95))

## 0.38.2

### Patch Changes

- Include `thresholdTime` and `thresholdChunks` in top-level exports ([`95e2a82ef949853efaba2a1f1f8d427116409465`](https://github.com/techniq/layerchart/commit/95e2a82ef949853efaba2a1f1f8d427116409465))

- [TransformContext] Ignore pointer events when mode="none". Re-add mode="manual" and conveniently set when geo applyContext is used ([`c729be4fc6569182a7c97d85051146b483b670de`](https://github.com/techniq/layerchart/commit/c729be4fc6569182a7c97d85051146b483b670de))

## 0.38.1

### Patch Changes

- Export TransformControls component ([`f38830b250682279cd51375126acb60fc4266cfe`](https://github.com/techniq/layerchart/commit/f38830b250682279cd51375126acb60fc4266cfe))

- [HitCanvas] Reset color generator on transform changes (transition/scale) ([`2609b8059c70a87a85a8565d486150406ac3036d`](https://github.com/techniq/layerchart/commit/2609b8059c70a87a85a8565d486150406ac3036d))

- Add RadialGradient component ([#174](https://github.com/techniq/layerchart/pull/174))

## 0.38.0

### Minor Changes

- Add Svelte 5 to peerDependencies ([`7b9849497a8bbcd9aa4e3ceaba347b2dfbf35246`](https://github.com/techniq/layerchart/commit/7b9849497a8bbcd9aa4e3ceaba347b2dfbf35246))

### Patch Changes

- Update dependencies ([`69cb22c1785d5e3f1eed20dda55455024503249d`](https://github.com/techniq/layerchart/commit/69cb22c1785d5e3f1eed20dda55455024503249d))

## 0.37.3

### Patch Changes

- Add `geoFitObjectTransform()` util ([`19b422401d83797c528be3ee27ff085655685ba4`](https://github.com/techniq/layerchart/commit/19b422401d83797c528be3ee27ff085655685ba4))

- [Chart] Add `fitGeoObject` prop to initialize transformContext's translate/scale ([`0224f01ddc9ce98eed34fcb2e1f9109e08c34325`](https://github.com/techniq/layerchart/commit/0224f01ddc9ce98eed34fcb2e1f9109e08c34325))

- [TransformContext] Add `setTranslate` and `setScale` to explicit set (useful with new `geoFitObjectTransform()` util) ([`ed0683adc7f3890e8b20ffe67ae16f4ad4c62587`](https://github.com/techniq/layerchart/commit/ed0683adc7f3890e8b20ffe67ae16f4ad4c62587))

- Improve motionStore typing ([`1d0f08b0619c3bd906f41b352ba5d4bb1271cb60`](https://github.com/techniq/layerchart/commit/1d0f08b0619c3bd906f41b352ba5d4bb1271cb60))

## 0.37.2

### Patch Changes

- [Bar] Add `rounded` prop to round single side (or corner) using path ([#169](https://github.com/techniq/layerchart/pull/169))

- [Axis] Support passing `scale` override (useful for dual axis) ([`a4f133f89dc85f8cba729c3ced172544086b44ed`](https://github.com/techniq/layerchart/commit/a4f133f89dc85f8cba729c3ced172544086b44ed))

## 0.37.1

### Patch Changes

- Export LayerChart's Svg/Canvas impl. instead of LayerCake's (provides transformContext support). Export HitCanvas ([`e37579836098bdd3a983efee1dc7d0346ea29ba1`](https://github.com/techniq/layerchart/commit/e37579836098bdd3a983efee1dc7d0346ea29ba1))

## 0.37.0

### Minor Changes

- Integrate `Transform` into `Chart` (<Chart transform={...} let:transform>) and expose as `transformContext()`. Renamed to `TransformContext` and removed direct SVG control (now handled by `Svg` and `Canvas` components) ([#166](https://github.com/techniq/layerchart/pull/166))

- Add HitCanvas component to enable shape-based tooltips (ex. GeoPath) using hidden color-coded canvas ([#163](https://github.com/techniq/layerchart/pull/163))

- Support transform with Canvas layers (ex. geo, etc) ([#166](https://github.com/techniq/layerchart/pull/166))

- [Axis] Rename `labelProps` to `tickLabelProps` and `label` slot to `tickLabel` ([#165](https://github.com/techniq/layerchart/pull/165))

- Replace mouse/touch with pointer events handlers ([`158a7641232b209a836f36e0f25ae4dcb5a876bc`](https://github.com/techniq/layerchart/commit/158a7641232b209a836f36e0f25ae4dcb5a876bc))

- Add new Canvas component (derived from LayerCake) which handles `scaleCanvas()` globally and supports scale/translate transforms ([#166](https://github.com/techniq/layerchart/pull/166))

### Patch Changes

- [Axis] Add label support ([#165](https://github.com/techniq/layerchart/pull/165))

- [TransformControls] Use transformContext instead of `transform` prop ([#166](https://github.com/techniq/layerchart/pull/166))

- [GeoPath] Handle `stroke-none` class when used within Canvas context ([#163](https://github.com/techniq/layerchart/pull/163))

- [GeoContext] Integrate with new TransformContext ([#166](https://github.com/techniq/layerchart/pull/166))

- [GeoPath] Respect `strokeWidth` prop within Svg context (not just `stroke-width` attribute) to align with Canvas context usage ([#166](https://github.com/techniq/layerchart/pull/166))

## 0.36.5

### Patch Changes

- Update dependencies ([`57d63215be2a8d9c974221ffae5215c3b1cf3e7c`](https://github.com/techniq/layerchart/commit/57d63215be2a8d9c974221ffae5215c3b1cf3e7c))

## 0.36.4

### Patch Changes

- Export Canvas and WebGL layers (similar to Html/Svg) ([`c2d300b0f2c025f17c67bd9cb9862a6f6685fae9`](https://github.com/techniq/layerchart/commit/c2d300b0f2c025f17c67bd9cb9862a6f6685fae9))

## 0.36.3

### Patch Changes

- [Bar] Fix handling non-0 minimum domain ([`f9fb98e8f074cbc4e5588af626d65bb4c94a309f`](https://github.com/techniq/layerchart/commit/f9fb98e8f074cbc4e5588af626d65bb4c94a309f))

- [GeoPoint] Use <Group> instead of <group> when passing a <slot> to enable tweening/etc ([`6a6c176e29030df69e1515466b3ab0c9277d7dba`](https://github.com/techniq/layerchart/commit/6a6c176e29030df69e1515466b3ab0c9277d7dba))

## 0.36.2

### Patch Changes

- [Legend/ColorRamp] Fix color ramp image size and legend text size on Firefox ([`3e16640d8e1d77d35f9da5e3874990ae8511b61c`](https://github.com/techniq/layerchart/commit/3e16640d8e1d77d35f9da5e3874990ae8511b61c))

## 0.36.1

### Patch Changes

- [Highlight] Support passing `data` prop to use (annotate) specific data point, else uses tooltip data as before. ([`83c98e66a4915ac6e35b23864ac0d54a4dcd28e0`](https://github.com/techniq/layerchart/commit/83c98e66a4915ac6e35b23864ac0d54a4dcd28e0))

## 0.36.0

### Minor Changes

- [GeoPath / GeoPoint] Support CSS styling (tailwind classes, etc) within <Canvas> context ([#141](https://github.com/techniq/layerchart/pull/141))

## 0.35.0

### Minor Changes

- [GeoPath] Support `curve` ([#135](https://github.com/techniq/layerchart/pull/135))

- Add ForceSimulation component ([#135](https://github.com/techniq/layerchart/pull/135))

- Add Hull component ([#135](https://github.com/techniq/layerchart/pull/135))

- [ChartClipPath] Remove padding by default (opt-in with `includePadding`) ([`eca9d4a8fc3628e626f7ecab21c4ea8753bcce05`](https://github.com/techniq/layerchart/commit/eca9d4a8fc3628e626f7ecab21c4ea8753bcce05))

### Patch Changes

- [Axis] Add `label` slot for greater control (ex. support first/last labels with different alignment) ([`0106e549bbfc4498d737a877645612923ebcbb4b`](https://github.com/techniq/layerchart/commit/0106e549bbfc4498d737a877645612923ebcbb4b))

- Export the individiual Bar component ([#137](https://github.com/techniq/layerchart/pull/137))

- [Hull] Support `curve` ([#135](https://github.com/techniq/layerchart/pull/135))

- [Points] Support passing `data` prop (to override context data) ([#135](https://github.com/techniq/layerchart/pull/135))

- Add GeoVisible component and isVisible(projection) util ([`1d05bb08e40861bd0e57247acabc4f760b399dd9`](https://github.com/techniq/layerchart/commit/1d05bb08e40861bd0e57247acabc4f760b399dd9))

## 0.34.0

### Minor Changes

- [Axis / Legend] Rename `tickSize` to `tickLength` to not confuse with `ticks={number}` ([`e8a9b575a4dfaa4cf07992a426553f1927b9c297`](https://github.com/techniq/layerchart/commit/e8a9b575a4dfaa4cf07992a426553f1927b9c297))

### Patch Changes

- [Axis] Fix `ticks` defined as function. Useful to only show first/last values or filter (ex. integers only) ([`c78f17ac78bbb973b2b7de730719a7cf86d2803b`](https://github.com/techniq/layerchart/commit/c78f17ac78bbb973b2b7de730719a7cf86d2803b))

## 0.33.0

### Minor Changes

- Change default Chart tooltip mode from `bisect-x` to `manual` (now that tooltip context is always setup) ([`6399d54f7a3a7777c98f93c4ad592a4fddd5a9e9`](https://github.com/techniq/layerchart/commit/6399d54f7a3a7777c98f93c4ad592a4fddd5a9e9))

- Rename `Zoom` component to `Transform` ([`8d5ac6689ea79dcadef86b342cd7f3ad9d6f545a`](https://github.com/techniq/layerchart/commit/8d5ac6689ea79dcadef86b342cd7f3ad9d6f545a))

### Patch Changes

- Always add TooltipContext to fix `let:tooltip` slot prop ([`10a9468efc90179e4446cc17df82a420d2033b53`](https://github.com/techniq/layerchart/commit/10a9468efc90179e4446cc17df82a420d2033b53))

- [Zoom] Fix tooltip triggering and text seleciton while dragging ([`db339ac837811b842fbe2fb781c8ad0ae059c365`](https://github.com/techniq/layerchart/commit/db339ac837811b842fbe2fb781c8ad0ae059c365))

- [GeoContext] Fix `fitGeojson` not defined and support `reflectX` and `reflectY` ([`dbab632808fd8a5d230a46b062652af687aefac0`](https://github.com/techniq/layerchart/commit/dbab632808fd8a5d230a46b062652af687aefac0))

- Update dependencies ([`5892607f7e721bf255c6d5b2c31c45476965820e`](https://github.com/techniq/layerchart/commit/5892607f7e721bf255c6d5b2c31c45476965820e))

- [Transform] Add `dragstart` and `dragend` events ([`e41c5e678c2e1c1c72e2146b1b47dbbeed68ff38`](https://github.com/techniq/layerchart/commit/e41c5e678c2e1c1c72e2146b1b47dbbeed68ff38))

## 0.32.3

### Patch Changes

- [Pie] Support placement ('left', 'right', 'center' (default), and 'none'). Resolves #130 ([`1e0415a193dbf7070cfcbb4a55436d3b78d84053`](https://github.com/techniq/layerchart/commit/1e0415a193dbf7070cfcbb4a55436d3b78d84053))

- [Group] Support centering on a single axis ([`c6d5b5570f758302a97265f08d46abc991497e31`](https://github.com/techniq/layerchart/commit/c6d5b5570f758302a97265f08d46abc991497e31))

## 0.32.2

### Patch Changes

- Update dependencies ([`bbc4d3d932e07f7c72bfd6eac7ab1c2695fd5026`](https://github.com/techniq/layerchart/commit/bbc4d3d932e07f7c72bfd6eac7ab1c2695fd5026))

- Add voronoi support for geo charts, including tooltip mode ([`77c9c5a2df05c4f3b17d581e4e98ffffd59cfde2`](https://github.com/techniq/layerchart/commit/77c9c5a2df05c4f3b17d581e4e98ffffd59cfde2))

## 0.32.1

### Patch Changes

- Update Svelte UX (fix duration utils top-level exports) and remove Duration type import ([`2b45b2b97a3c3fc026c6327dbaa34b6c4abb1b84`](https://github.com/techniq/layerchart/commit/2b45b2b97a3c3fc026c6327dbaa34b6c4abb1b84))

- [GeoPoint] Use <Circle> (instead of <circle>) with motion support ([`a3c08a51431a38d6b1c17be47d3ba32907bb5ab4`](https://github.com/techniq/layerchart/commit/a3c08a51431a38d6b1c17be47d3ba32907bb5ab4))

- [GeoPoint] Render <circle> by default if slot not provided ([`686c9dc6e332eef3bb5cc6f06550aa2cbac0fab1`](https://github.com/techniq/layerchart/commit/686c9dc6e332eef3bb5cc6f06550aa2cbac0fab1))

- Add GeoSpline and GeoEdgeFade components ([`f3449509d576a1192f52f0efafa3ecd88533db2b`](https://github.com/techniq/layerchart/commit/f3449509d576a1192f52f0efafa3ecd88533db2b))

## 0.32.0

### Minor Changes

- Support NodeNext packages ([#126](https://github.com/techniq/layerchart/pull/126))

### Patch Changes

- Support passing `placement` prop (`inside`|`outside`) ([`baea5c88dec9334014d8ceefb5041d02c9d064d2`](https://github.com/techniq/layerchart/commit/baea5c88dec9334014d8ceefb5041d02c9d064d2))

- [Labels] Improve default fill/stroke when using `placement="inside"` ([`8366e6905a67df8310916198ea153b87bc5e421b`](https://github.com/techniq/layerchart/commit/8366e6905a67df8310916198ea153b87bc5e421b))

- [Text] Support tweened/spring ([`d65b1cb65d4d0868a5f41e3a5103ae802711acc2`](https://github.com/techniq/layerchart/commit/d65b1cb65d4d0868a5f41e3a5103ae802711acc2))

- [Spline] Fix usage with geo visualizations (no defined data / domains) ([`f6a19c051c49ad2301494bfd5c502f14c9541a6c`](https://github.com/techniq/layerchart/commit/f6a19c051c49ad2301494bfd5c502f14c9541a6c))

- [Axis] Support tweened/spring ([`c2902a2a54eb1d2c89981ff47037c9a3aaf7dd6c`](https://github.com/techniq/layerchart/commit/c2902a2a54eb1d2c89981ff47037c9a3aaf7dd6c))

- Fix `spring` and `tweened` types on `Bars`, `Bar`, and `RectClipPath` (match underlying Rect) ([`81a953a2bbd629ef1c54a083d886b32bd38246da`](https://github.com/techniq/layerchart/commit/81a953a2bbd629ef1c54a083d886b32bd38246da))

## 0.31.2

### Patch Changes

- Update dependencies ([`48d636c4030df7278499412fad0ded15c59284d0`](https://github.com/techniq/layerchart/commit/48d636c4030df7278499412fad0ded15c59284d0))

- Update Svelte UX (with non-eager fallback settings()) ([`b80b17bdc8f1fc15ab25e352c81bc3aa50fd65a9`](https://github.com/techniq/layerchart/commit/b80b17bdc8f1fc15ab25e352c81bc3aa50fd65a9))

## 0.31.1

### Patch Changes

- Add pivotLonger() and pivotWider() to top-level exports. Add `layerchart/utils` export for additional utils ([`be4cfe219d61c5687e2a896ab43970f7ad6009d2`](https://github.com/techniq/layerchart/commit/be4cfe219d61c5687e2a896ab43970f7ad6009d2))

## 0.31.0

### Minor Changes

- [Area/AreaStack/Spline] Simplify overwriting x/y accessors by applying xScale/yScale within components ([#115](https://github.com/techniq/layerchart/pull/115))

### Patch Changes

- [AreaStack] Support passing slot for custom <Area> (enabling modifications in including <LinearGradient> fill) ([#116](https://github.com/techniq/layerchart/pull/116))

- Add Voronoi as separate component ([`1aeaf0c20f80511209252de560ef0be867e129d7`](https://github.com/techniq/layerchart/commit/1aeaf0c20f80511209252de560ef0be867e129d7))

## 0.30.2

### Patch Changes

- Support radial / polar coordinate system (along with cartesian) for Axis, Spline, Area, and Point ([#107](https://github.com/techniq/layerchart/pull/107))

- [Tooltip] Change variant `light`/`dark` (default: `dark`) to `default` / `invert` and base on theme colors ([#110](https://github.com/techniq/layerchart/pull/110))

- [Axis] Fallback to tick value if no tick format defined (band scales) ([#107](https://github.com/techniq/layerchart/pull/107))

## 0.30.1

### Patch Changes

- Update dependencies ([`0a2a08d9360802fda3cffbd193a59299aae52f33`](https://github.com/techniq/layerchart/commit/0a2a08d9360802fda3cffbd193a59299aae52f33))

## 0.30.0

### Minor Changes

- Theme support ([#78](https://github.com/techniq/layerchart/pull/78))

### Patch Changes

- Update sub-component props type that are spread (`ComponentProps<SomeComponent>`) to be more accurate (`Partial<...>`) ([#78](https://github.com/techniq/layerchart/pull/78))

- [ClipPath] Add `disabled` prop to show all (ignore clipping) ([#78](https://github.com/techniq/layerchart/pull/78))

- Update dependencies ([#78](https://github.com/techniq/layerchart/pull/78))

- Add GeoCircle component ([#78](https://github.com/techniq/layerchart/pull/78))

- Add antipode() geo util ([#78](https://github.com/techniq/layerchart/pull/78))

## 0.28.0-next.3

### Patch Changes

- Update sub-component props type that are spread (`ComponentProps<SomeComponent>`) to be more accurate (`Partial<...>`) ([#78](https://github.com/techniq/layerchart/pull/78))

- Update dependencies ([#78](https://github.com/techniq/layerchart/pull/78))

## 0.28.0-next.0

### Minor Changes

- Theme support ([#78](https://github.com/techniq/layerchart/pull/78))

## 0.27.0

### Minor Changes

- [TooltipContext] Replace `on:click` event handler with `onClick` prop (easier to consume when using `<Chart tooltip={{ onClick(e) => { ... } }} />`) ([`ee80654`](https://github.com/techniq/layerchart/commit/ee80654c1e14857c2d47dea791390a717c9921eb))

## 0.26.2

### Patch Changes

- Use Symbol() instead of empty object for context keys ([`c676611`](https://github.com/techniq/layerchart/commit/c676611a86c142892a1683e56961a9fd9c633967))

## 0.26.1

### Patch Changes

- Expose `geoContext` as top-level export ([`8bef371`](https://github.com/techniq/layerchart/commit/8bef3714d0ea145f143214a88d12f6966c136bd4))

- [Tooltip] Fix xOffset usage after recent refactor ([`cd9d8b7`](https://github.com/techniq/layerchart/commit/cd9d8b7627948c12985f358ba6dae93d8f9eeae7))

## 0.26.0

### Minor Changes

- [Tooltip] Position improvements including `anchor` support ([#72](https://github.com/techniq/layerchart/pull/72))

  **Breaking Changes**

  **Replace TooltipContext's `snapToDataX/Y` with `<Tooltip x="data" y="data" />`**

  Before:

  ```svelte
  <Chart tooltip={{ snapToDataX: true, snapToDataY: true }}>
    <Tooltip>...</Tooltip>
  </Chart>
  ```

  After:

  ```svelte
  <Chart tooltip>
    <Tooltip x="data" y="data">...</Tooltip>
  </Chart>
  ```

  **Rename `<Tooltip left={...} top={...} />` to `<Tooltip x={...} y={...} />`**

  Before:

  ```svelte
  <Chart tooltip>
    <Tooltip left={0} top={0}>...</Tooltip>
  </Chart>
  ```

  After:

  ```svelte
  <Chart tooltip>
    <Tooltip x={0} left={0}>...</Tooltip>
  </Chart>
  ```

  **Additional**
  - Rename tooltipContext's `top`/`left` to `x`/`y`
  - Add `anchor` prop to align based on corner/edge/center (9 points) of tooltip instead of always top-left corner.
  - Add more tooltip examples

- [Labels] Remove old `formatStyle` prop since Svelte UX `format` now covers all use cases ([`06d9bde`](https://github.com/techniq/layerchart/commit/06d9bde8397be2e315c625528e8b83072a2f343b))

- Setup as monorepo using pnpm workspace ([#69](https://github.com/techniq/layerchart/pull/69))

### Patch Changes

- Expose `data` and `flatData` as Chart slot props ([`97e812d`](https://github.com/techniq/layerchart/commit/97e812da7229c693f4aac67e29f3cc0e7703ebc3))

- [Bars] Change named `bars` slot to default. Update group/stacked transition examples to use <Bar> directly and set {#each} key ([`7fd24a5`](https://github.com/techniq/layerchart/commit/7fd24a5efba48dc1c51b097a6385fc415a3cee18))

- Update dependencies ([#73](https://github.com/techniq/layerchart/pull/73))

## 0.25.1

### Patch Changes

- [Text] Fix display of `0` value when number (and not string) ([`c1e20dc`](https://github.com/techniq/layerchart/commit/c1e20dcb94671de407adf270c7e13fd3bbf89678))

- [Axis] Do not replace all default classes when setting labelsProps={{ class: '...' }} ([`fc9e281`](https://github.com/techniq/layerchart/commit/fc9e281f66889c8b4ab98ac502a5095e8e714db8))

## 0.25.0

### Minor Changes

- [Bar / Bars] Rename `padding` to `inset` ([`006daae`](https://github.com/techniq/layerchart/commit/006daaec02691cef82afc6eeda3cea57c67c0cd8))

### Patch Changes

- [TooltipContext] Fix bisect-y padding adjustment ([`5f078cf`](https://github.com/techniq/layerchart/commit/5f078cf1b025c1606860888c14eb591ebbbfacfa))

- Add Candlestick example ([`665ebef`](https://github.com/techniq/layerchart/commit/665ebef3b7cbff0e79c5d56c54cfd982745afcb2))

- Update dependencies ([`ca79b59`](https://github.com/techniq/layerchart/commit/ca79b59e818ef86bd1b54c083e5c51d5acf8d93e))

- [Bars] Remove no longer used `getProps` and `getKey` (can now use `Bar` component and slot) ([`5a57e63`](https://github.com/techniq/layerchart/commit/5a57e6353feb3292e776283817c15b4e3a6b2307))

## 0.24.4

### Patch Changes

- [TooltipContext] Fix bisect-x/bisect-y pointer handling with chart left/top padding ([`d69295a0`](https://github.com/techniq/layerchart/commit/d69295a0ec77894e0daf1c1ec08ef337a6eb9460))

- [Tooltip] Add `variant` support with 'light', 'dark', and 'none' ([`c464874`](https://github.com/techniq/layerchart/commit/c464874568892735af0851692db0e6e9dac6b5f0))

## 0.24.3

### Patch Changes

- [Spline] Fix `draw` transition when using Svelte 4 ([`22e5a82`](https://github.com/techniq/layerchart/commit/22e5a82bcb90ccff5f08f3fede08799774bfbff9))

- Update Layer Chart to 8.0.2 (fix sorted ordinal regression)

- [Preview] Add "View data" button/dialog ([`f91b006`](https://github.com/techniq/layerchart/commit/f91b0060892f63b2326edfba3d41a5379be8e203))

## 0.24.2

### Patch Changes

- Update svelte-ux to latest (with new top-level sort utils) ([`e3e3ba1`](https://github.com/techniq/layerchart/commit/e3e3ba1eefcd1b2638b9cb6728db32ee9e9cc257))

## 0.24.1

### Patch Changes

- Update dependencies ([`2079955`](https://github.com/techniq/layerchart/commit/2079955276aadd25518d302cb3fe16dae5875722))

## 0.24.0

### Minor Changes

- [LinearGradient] Replace `from`/`to` with `stops` prop, which both simplifies tailwind color usage, and simplifies more complex cases (gradient encoding). Also support passing tuple values for explicit offsets (gradient threshold) ([`97098fd`](https://github.com/techniq/layerchart/commit/97098fd0d4fbbc9d549b9257e60d627922a4dd53))

### Patch Changes

- [Calendar] Add month labels ([`68e4694`](https://github.com/techniq/layerchart/commit/68e46949ceb8844553ab7f49a8bf2014c66a63b9))

- Added Sparkline examples ([#44](https://github.com/techniq/layerchart/pull/44))

- [Tooltip] Support passing explicit `top` and/or `left` for fixed position ([`4681c7f`](https://github.com/techniq/layerchart/commit/4681c7fd2a4b4f75d20f1808c0809e177c6ba164))

- [Legend] Support passing `class` without overriding built-in classes ([`cbc0249`](https://github.com/techniq/layerchart/commit/cbc0249bb227109da17a106d21baabd8ee182480))

- Add highlight on hover examples for multi-series Area and Line ([`b9e4722`](https://github.com/techniq/layerchart/commit/b9e4722ac544b26ae546d9cccbe91ea10bd8e911))

- [Line] Add "gradient encoding" and "gradient threshold" examples ([`b171e8e`](https://github.com/techniq/layerchart/commit/b171e8e5c8eda8d398274ea9ae02f075e3b51389))

## 0.23.0

### Minor Changes

- Update major dependencies, including `svelte` to 4.x. Change svelte to `peerDependency` ([`ff4b907`](https://github.com/techniq/layerchart/commit/ff4b907b895d2096d2a468bf7a8f60ab9a3fd638))

### Patch Changes

- Add `url` slot prop to LinearGradient, Blur, and ClipPaths to simplify usage ([`fa805e0`](https://github.com/techniq/layerchart/commit/fa805e0cf34f85ed77c1cff8de7ef8c78ed34f38))

- Add Arc color wheel example ([`4b0285e`](https://github.com/techniq/layerchart/commit/4b0285ead74a8e872ed962be7a98125db84a6632))

- Add Calendar component ([`8ba2b5f`](https://github.com/techniq/layerchart/commit/8ba2b5f22a4c2d08edfb6a35f7093e04beb49a91))

## 0.22.2

### Patch Changes

- [Chart] Expose `zScale` and `rScale` as slot props ([`f1e532a`](https://github.com/techniq/layerchart/commit/f1e532aec0a6a36db6d88c0e212303b15fb697e4))

- Update non-major dependencies ([`a20c74a`](https://github.com/techniq/layerchart/commit/a20c74ac6bcf59d5f4ae2800fd66bae37a58d99a))

## 0.22.1

### Patch Changes

- [Line] Fix initializing `y1` with wrong value ([`3f6a661`](https://github.com/techniq/layerchart/commit/3f6a661ef0b59e0312bcf828dbaa2cfb978d21db))

- [Highlight] Support setting classes on points/lines/area without overriding all default class ([`77e6808`](https://github.com/techniq/layerchart/commit/77e68081919db1877896602b7a7134f69e0f8daf))

## 0.22.0

### Minor Changes

- Add `initial*` values to all primative components' (Arc, Rect, Group, Line, Rect) tweened properties (x, y, width, height, value, etc) which enables initial mount transitions (see added examples). ([`6f8cfb0`](https://github.com/techniq/layerchart/commit/6f8cfb05d9925ad6c9da7b53d021f366870bc52a))

- Remove `ConnectedPoints` component and replace with `links` prop on `<Points>` ([`f514bb6`](https://github.com/techniq/layerchart/commit/f514bb69fa99c6243958cf9a620ca24a137b1d6d))

- Highlight overhaul ([`d9dd4bf`](https://github.com/techniq/layerchart/commit/d9dd4bf38f17530950d29eb6edff400a7d6dff02))
  - Consolidate HighlightLine and HighlightRect
  - Support enabling `points`, `lines`, and `area` individually
  - Support passing props to underlying Line, Circle, and Rect
  - Support overriding with slots
  - Remove `color` prop

### Patch Changes

- [motionStore] Fix resolving per-property options (do not enable tweened height with default options if only height is enabled) ([`b930ef7`](https://github.com/techniq/layerchart/commit/b930ef78abd0713a8acb7c688574ebb6f2c838b5))

- [LinearGradient] Generate `id` by default and change default slot to render contexts with `id` passed (like ClipPath) ([`476f03a`](https://github.com/techniq/layerchart/commit/476f03a8dcd809dd23079912dc16f145eca82147))

- [HighlightRect] Fix usage with scaleBand yScale's without breaking histogram usage ([`53a1fff`](https://github.com/techniq/layerchart/commit/53a1fffa1ac357fa0070a9492ae88c9cc26ab29b))

- [LinearGradient] Add `units` prop to support defining coordinate system for attributes ([`5e58b98`](https://github.com/techniq/layerchart/commit/5e58b985090a9039e8837214a46ef038a85771b8))

## 0.21.1

### Patch Changes

- Fix TooltipContext `mode="bounds"` with array of points (ex. duration) ([`80f3e56`](https://github.com/techniq/layerchart/commit/80f3e56f1f4b35a359f457e3fa165be2c95d9cea))

## 0.21.0

### Minor Changes

- Remove color prop from `Bars`, `Points`, `Pie`, and `Link`. Use `rScale` or `fill`, `stroke`, or `class` prop to define ([`13b7688`](https://github.com/techniq/layerchart/commit/13b76884ee7d5a51d98d0eebb379beb42e1b300d))

## 0.20.2

### Patch Changes

- Update prettier to v3 along with minor dependencies ([`4b274a8`](https://github.com/techniq/layerchart/commit/4b274a87037473753da07b47382d560d541bf0ae))

## 0.20.1

### Patch Changes

- Bump all non-major dependencies ([`7849bd3`](https://github.com/techniq/layerchart/commit/7849bd3fb8d9579f9bf83f42c8c9bb55d15fd909))

- Documentation improvements

## 0.20.0

### Minor Changes

- Area improvements and simplification. Use `fill` and `class` instead of `color`. Remove default color and opacity. Improve docs ([`97175f6`](https://github.com/techniq/layerchart/commit/97175f611787ffd03bf6bcb6aa7beb7b8a036648))

- Path improvements including `draw` prop, use `stroke` and `class` instead of `color` and `width` properties. Improve docs ([`97175f6`](https://github.com/techniq/layerchart/commit/97175f611787ffd03bf6bcb6aa7beb7b8a036648))

- Rename `Path` to `Spline` to better represent usage ([`ab384bd`](https://github.com/techniq/layerchart/commit/ab384bdceeb577de3e1623abd61a0c654b828a6e))

### Patch Changes

- Add MotionPath component ([`ebd32e6`](https://github.com/techniq/layerchart/commit/ebd32e63e2424332e4fcc0c3b7a67bff0bed26f1))

## 0.19.0

### Minor Changes

- Consolidate <ClipPathUse> use case into <ClipPath> and simplify other ClipPath components with refined slots ([`badd391`](https://github.com/techniq/layerchart/commit/badd391cecbc4aeb526b297e57d77ab4f5debcbf))

### Patch Changes

- Add Point component as a convenient way to translate a data item to SVG x/y coordinates ([`fa48561`](https://github.com/techniq/layerchart/commit/fa4856125f55db126eba6ac21faee99c9f2a7506))

## 0.18.2

### Patch Changes

- Support styling Tooltip via `classes` prop ([`60e2361`](https://github.com/techniq/layerchart/commit/60e236114323c6394eecdbaa4b93b6de041c1d80))

## 0.18.1

### Patch Changes

- Add bin/histogram support and examples ([`da358ab`](https://github.com/techniq/layerchart/commit/da358ab87edf7814050d3b531cd7e2e20e8c630c))

- Update dependencies ([`c0e67b4`](https://github.com/techniq/layerchart/commit/c0e67b443a9c7858a46d1f7da49bf3a64dbbb0eb))

## 0.18.0

### Minor Changes

- Add `rule` prop to `Axis` component to simplify adding axis rule lines. Rename `gridlines` prop to `grid` ([`c98773b`](https://github.com/techniq/layerchart/commit/c98773b13776a3ca757ab445641704b1fc38db9d))

- Rename `Baseline` to `Rule`, supporting value annotations. Invert x/y meaning. Also fixes usage with scaleTime() ([`9f3598d`](https://github.com/techniq/layerchart/commit/9f3598dc3000fa7207822d0b20d1a13f12eed489))

- Add Frame component ([`8d2020d`](https://github.com/techniq/layerchart/commit/8d2020ddb3fa21fa7e460b03d1e38b014f1c8cc6))

## 0.17.2

### Commits

- Update svelte-ux and layercake ([0c85ef](https://github.com/techniq/svelte-ux/commit/0c85efb17fd567daddce7a0c3b7c87eb8038537f))
- Cleanup some types ([71f84c](https://github.com/techniq/svelte-ux/commit/71f84c90d81161619ce43b1ea1d7f6c4f9489a44))
- [Arc] outerRadius can be defined as discrete value (>=1), percert of chart height (<1) or offset of chart height (<0) ([212a8c](https://github.com/techniq/svelte-ux/commit/212a8c4d581c5f80ed775cca39fcfb5de29eebdb))
- [Bars] Add gridline on top examples ([a65d10](https://github.com/techniq/svelte-ux/commit/a65d10b02474ab32b118ad5c2a07b5f8523c746c))
- [Tooltip] Support passing class. Do not allow top/left to exceed container when changing sides (ignore negative values) ([c9d584](https://github.com/techniq/svelte-ux/commit/c9d584db32904e55c310e22591501dad9767c187))
- [Axis] Allow passing class to gridlines without overriding default classes ([b1c8e5](https://github.com/techniq/svelte-ux/commit/b1c8e5b321c2f5ad3b830aae084ae3ac84c42cab))
- [Sankey] Add tooltip examples ([b03572](https://github.com/techniq/svelte-ux/commit/b035723fd397d0cf1c3a5be13bd87f6273089c60))
- Tigthen up controls ([f198bd](https://github.com/techniq/svelte-ux/commit/f198bda822ef215125478e62c65a5b3172d76626))
- [Sankey] Extract SankeyControls and use MenuField instead of ToggleGroup ([f285b9](https://github.com/techniq/svelte-ux/commit/f285b944a2ae189565efc5c63a2d522b3acb0f25))
- [Text] Move features to load() ([e3901b](https://github.com/techniq/svelte-ux/commit/e3901b6e1ac683a889e01ff5706c6a59391955b3))
- [RangeField] Update height to match other Fields ([448746](https://github.com/techniq/svelte-ux/commit/448746e5819ea19999fbd3ab6acf58f122e1ecc4))
- Sort quick search options by group ([3593c7](https://github.com/techniq/svelte-ux/commit/3593c74148edae9b4da3dd90e57aca30e702c5e3))

## 0.17.1

### Commits

- [Points / HighlightLine] Handle null/undefined values ([e3b5fc](https://github.com/techniq/svelte-ux/commit/e3b5fcea3b1f5ab51408d21c4e46c2d030b2bc58))
- Update all non-major dependencies ([971e5d](https://github.com/techniq/svelte-ux/commit/971e5df1a140d16cc9f4de8ace4c49699e940380))
- [ClevelandDotPlot example] Use band tooltip mode and dateDisplay to better handle null ([aa0d4b](https://github.com/techniq/svelte-ux/commit/aa0d4b049a882058d2cd947137fc4733ed335f3d))
- Link ConnectedPoint examples ([64f446](https://github.com/techniq/svelte-ux/commit/64f4462b347eb33a40280ad506338652230b42b6))
- [ViewSourceButton] Fix on smaller viewports ([b0a6e3](https://github.com/techniq/svelte-ux/commit/b0a6e3885bdc8ebd2dfc817315c10e065ba4f105))
- Fix tailwind warning about nesting plugin ([5337f2](https://github.com/techniq/svelte-ux/commit/5337f21c1b2d8a9eb377d9c7e8f226b7c7b4ae08))

## 0.17.0

### Commits

- Update svelte-ux ([9ce958](https://github.com/techniq/svelte-ux/commit/9ce9585c4557753308fb6bca0f17195af8c10629))
- Replace AxisX/Y with single Axis component. Support top/right along with existing left/bottom placements. Add tick lines (shown by default). Update props ([76f77c](https://github.com/techniq/svelte-ux/commit/76f77cb532d9d9f9b858426d6fccce239f07ecf8))
- Organize example menu items ([1198a5](https://github.com/techniq/svelte-ux/commit/1198a512db4b65a229a1c5c42737a0898b854745))
- Fix Axis page source (use AxisX until unified component) ([8c6349](https://github.com/techniq/svelte-ux/commit/8c63493ccde1fac1ebce18a1f9a9787741430ed1))
- Support viewing component and doc page source easily, with link to github to edit ([e08373](https://github.com/techniq/svelte-ux/commit/e0837360b4beb8da262339eb550df50b79e8d3d7))
- npm run format ([e3ef9c](https://github.com/techniq/svelte-ux/commit/e3ef9c9ec191301ce69a762070119085cbe95abb))
- Rename `<Code code={} />` to `<Code source={} />` ([0517ab](https://github.com/techniq/svelte-ux/commit/0517ab943466e6bfb838207537476e1770d50dd0))
- [Tooltip] Improve example headers ([086f79](https://github.com/techniq/svelte-ux/commit/086f79388456f4ab83f40f22dae6e899772cf6e8))
- [TooltipControls] Use MenuField instead of ToggleGroup for better consistency and support smaller viewports ([43db5a](https://github.com/techniq/svelte-ux/commit/43db5ab914ba7051329fd2f9ba1360f77d5ea9bd))
- [TooltipContext] Remove z-index for bisect-\* overlay to fix overlap with MenuField, etc, and highlight with `debug=true` ([409d1f](https://github.com/techniq/svelte-ux/commit/409d1f5a825e7eec1a4ee44556e8f6af2456bdd8))
- Extract common TooltipControls component ([7adc1b](https://github.com/techniq/svelte-ux/commit/7adc1bfa0c8b85dcc4bd2dfa42f8c536aaff2f36))
- [TooltipContext] Fix tooltip snapping not accounting for padding ([57fbdb](https://github.com/techniq/svelte-ux/commit/57fbdb916712cca00a932be938d9a0c627b4519b))
- Update to use ComponentProps type from svelte and SVGAttributes from svelte/elements ([49efe8](https://github.com/techniq/svelte-ux/commit/49efe81f8b43abbe53f5d381a5cd9b2f629a0039))
- [Labels] Use new `createDimensionGetter` and support horizontal bands ([da6e69](https://github.com/techniq/svelte-ux/commit/da6e695e58be63c9a6a92bd01288ae5441e2c2a2))
- Extract `createDimensionGetter()` derived store from Bars to allow reuse (Labels, etc) ([c9b059](https://github.com/techniq/svelte-ux/commit/c9b059e244e5c68e0ddb55e0f0fbbd878523685d))
- General cleanup of Bars ([0399e1](https://github.com/techniq/svelte-ux/commit/0399e10b3be135682aa9733872e6ff6edf2b7d09))
- Fix Baseline y ([8e8a73](https://github.com/techniq/svelte-ux/commit/8e8a73e2fbaa14a153f345a3e5fac55cd460e35b))
- [Bars] Rename widthOffset/heightOffset to single padding property ([5ea940](https://github.com/techniq/svelte-ux/commit/5ea940884b77cfd3eadf22c226c9efc287f57440))
- Add horizontal bar chart support. Issue #21 ([f781f6](https://github.com/techniq/svelte-ux/commit/f781f6f1cf615323d106c6ddf09a90a1718a21c1))
- Add GeoJSON preview (WIP) ([8360fe](https://github.com/techniq/svelte-ux/commit/8360fe0e66483132f483f62d4a56c8edb047fc1d))
- Support showing features, related, and hiding table of contents ([7367ef](https://github.com/techniq/svelte-ux/commit/7367ef6e416feb59a4f8905bc6e0cb748d610513))
- Point docs url to `+page.svelte` (instead of `+page.md`) ([4e40ef](https://github.com/techniq/svelte-ux/commit/4e40ef6faf5d9bc8dd9463f003431ae81d2cfc81))

## 0.16.0

### Commits

- Format Bar label example and use global styles for nav menu secondary headers ([56c32a](https://github.com/techniq/svelte-ux/commit/56c32a67bbb32b3b6c5ee740261658df3111ef15))
- Upgrade dependencies including svelte-ux (with createTheme() support). Scroll main to top on navigate ([378e18](https://github.com/techniq/svelte-ux/commit/378e184a369e6b1c96b889f5bb2f9995479eaacf))
- Improve selected animated globe country ([bc5f29](https://github.com/techniq/svelte-ux/commit/bc5f29be38466ac02113e94cd36828fc9241c14d))
- Update dependencies. Add shapefile loading example ([de9c79](https://github.com/techniq/svelte-ux/commit/de9c79f8e7c6d773ee8c23ba2c8c9cf40d1cc5a2))
- Cleanup examples ([f0f3bf](https://github.com/techniq/svelte-ux/commit/f0f3bf220b3a0e348136890a3c2a91eb5637fb35))
- Add PunchCard example ([ca2427](https://github.com/techniq/svelte-ux/commit/ca24270369632dac983ff0b3b797a696fd2087d3))
- Add missing docs pages ([64d207](https://github.com/techniq/svelte-ux/commit/64d207d3eafac1ef1f6355d34d7f758366cc85e5))
- Improve primative docs ([9a6537](https://github.com/techniq/svelte-ux/commit/9a653737ad379721d4dc096b90828836c368e8e3))
- Improve Text docs ([27cd69](https://github.com/techniq/svelte-ux/commit/27cd69ffc2232d208c044dac70084f451137dad7))
- Change layout.js to layout.ts ([2b416e](https://github.com/techniq/svelte-ux/commit/2b416e881bd6e2f3d1b7f749fbe78cfdb242b417))
- Cleanup imports on docs ([ed1528](https://github.com/techniq/svelte-ux/commit/ed1528504e29afa1d2eaec242fa1d84454fd0c9c))
- Run prettier foramt ([a0a639](https://github.com/techniq/svelte-ux/commit/a0a639357fa07886bd847932cb8122698bbc32b2))
- Add `lang="ts"` to remaining <script> blocks ([f76932](https://github.com/techniq/svelte-ux/commit/f769329d02544ac000fb3b749db3e58b0d82bf49))
- Add .vercel to gitignore (npm run build) ([d481df](https://github.com/techniq/svelte-ux/commit/d481df7782cea2cf780082e15b3bdbb8e27bbbad))
- Fix build ([7b6b51](https://github.com/techniq/svelte-ux/commit/7b6b5168b336d6967c591359c69cefd0395a5748))
- Rename all example docs +page.md to +page.svelte (no longer use markdown/mdsvex for those pages) ([b1f012](https://github.com/techniq/svelte-ux/commit/b1f012fc4e74fa9eafc0b623911dfcb2ef1c970e))
- Rename all component docs +page.md to +page.svelte (no longer use markdown/mdsvex for those pages) ([1458aa](https://github.com/techniq/svelte-ux/commit/1458aab0280ab3ac6785b327a3c49a144164b3ce))
- Use svelte-ux's NumberStepper ([47a035](https://github.com/techniq/svelte-ux/commit/47a0352d1adcdb3b0b38165574d252fcdef966e2))
- Replace all markdown headers (# Foo) with elements (<h1>Foo</h1>) ([a7b27e](https://github.com/techniq/svelte-ux/commit/a7b27e7096278d0673ed61f54a3ae1cdaa465a19))
- Replace all markdown blockquotes (> TODO) with <Blockquote> component ([589709](https://github.com/techniq/svelte-ux/commit/589709ce2910bcc7f9e77eda38037731b1a442bd))
- Update README ([9f4c74](https://github.com/techniq/svelte-ux/commit/9f4c74c3db13f1321cc27a098befaa272d402b7b))
- Add types to quadtreeRects() ([56a9be](https://github.com/techniq/svelte-ux/commit/56a9bec50c8e5d652b54e762f8ce1ccade7a51a9))

## 0.15.6

### Commits

- Upgrade svelte-ux to 0.35.4 (fix build due to bad import) ([ad64c2](https://github.com/techniq/svelte-ux/commit/ad64c2266089d3faad29dd81a77953312100678f))

## 0.15.5

### Commits

- Upgrade svelte-ux to 0.35.3 ([36bef1](https://github.com/techniq/svelte-ux/commit/36bef1764891e4c7c66ce7f9fe5fcb7bbb587a26))

## 0.15.4

### Commits

- Upgrade svelte-ux to 0.35.0 ([4c08a2](https://github.com/techniq/svelte-ux/commit/4c08a2f34a440055ee53eec16b2144fc0c233f5f))

## 0.15.3

### Commits

- Upgrade svelte-ux ([95c4b7](https://github.com/techniq/svelte-ux/commit/95c4b7b8c5ed3e00a10cf76acbc512a12285b1c3))

## 0.15.2

### Commits

- Update svelte-ux and use internal Code (since no longer top-level exported from svelte-ux due to prismjs) ([41e42d](https://github.com/techniq/svelte-ux/commit/41e42d55b8f372deb0d6445b2c0f00757ed07437))

## 0.15.1

### Commits

- Update dependencies ([c7cf53](https://github.com/techniq/svelte-ux/commit/c7cf5313311426b0367d4558ea1ca79ed3d96565))
- Upgrade svelte-ux (improves ApiDocs wrapping). and add Quick Search ([bf581c](https://github.com/techniq/svelte-ux/commit/bf581c7c23382dff98cd072cdfb79af5611d7dae))
- Fix RangeField (and similar) button sizes ([d415b9](https://github.com/techniq/svelte-ux/commit/d415b9cee2af0bee1840e972c3d3ab4343fa4c8d))
- Upgrade svelte-ux ([d2c61f](https://github.com/techniq/svelte-ux/commit/d2c61fe5db287bec2f3577d092c55d9a83f9ac0f))
- Add usage examples to all components, and add overflow-auto to main docs container ([d0b401](https://github.com/techniq/svelte-ux/commit/d0b401d44309a4fd1df09c7b2e5fc08d12dd3e6b))
- Replace codePreview remark plugin with svelte preprocessor ([7e8074](https://github.com/techniq/svelte-ux/commit/7e8074972a7e67721d684237fa4dc1d3925c3151))
- Remove load() explicit types ([404676](https://github.com/techniq/svelte-ux/commit/404676dd305cf1df180e72026b28b8c95d064f91))
- Remove source links from examples (just doc links) ([04485b](https://github.com/techniq/svelte-ux/commit/04485b741c1bf2dc837e48aba2d663f0f2775108))
- Fix component source/doc links ([3c55c4](https://github.com/techniq/svelte-ux/commit/3c55c40c33b36deba6269e3e1fb6d79bd486a628))
- Replace `markdownToc()` svelte preprocessor with `TableOfContents` component and simplier $page.url.pathname regex and page load() for extra meta properties (description). Remove all mdx frontmatter. Fix heading hierarchy (always have h1 before h2) ([12c704](https://github.com/techniq/svelte-ux/commit/12c704d7e50bdf7cdfda0736ca8d5e6cdb3da4ea))
- Improve layout by moving toc to right (sticky on scroll) ([78d3df](https://github.com/techniq/svelte-ux/commit/78d3df6a506fb2502cdb179b4db79d4e6bbfa9fd))

## 0.15.0

### Commits

- Update dependencies ([4d6ac6](https://github.com/techniq/svelte-ux/commit/4d6ac696182eba1bd8bb83cf9b457515f160cfaf))
- Setup vercel analytics ([ff2b30](https://github.com/techniq/svelte-ux/commit/ff2b30f5db8903985acb10eba41db6f332e2defa))
- Fix ClevelandDotPlot tooltip example ([3604b0](https://github.com/techniq/svelte-ux/commit/3604b01694e8cc32a52ba099ab905f35422ca5e0))
- Remove console.log() ([f97696](https://github.com/techniq/svelte-ux/commit/f976963c21e2ba93d5a2a8c48f7afd6dd282e02c))

## 0.14.2

### Commits

- [Legend] Support slot rendering ([b9de57](https://github.com/techniq/svelte-ux/commit/b9de57d42af5ce7a084c98eab45c7c9851dcb490))

## 0.14.1

### Commits

- Use svelte-ux top-level export ([a59896](https://github.com/techniq/svelte-ux/commit/a598960c675ccd38b76e8d240d53bbb3c0aec50c))

## 0.14.0

### Commits

- Upgrade dependencies ([fab81d](https://github.com/techniq/svelte-ux/commit/fab81da3c3517fcbbf56489e44532d81e3b7fa01))
- Add component API doc pages for new Geo components ([9d53e9](https://github.com/techniq/svelte-ux/commit/9d53e9e43be65e33a53c42a7628ba4f577a0625e))
- Simplify building NavMenu ([f19a07](https://github.com/techniq/svelte-ux/commit/f19a0773d315d1ea4b516c65988cbb8b31eee2d2))
- [GeoProjection] Only show US feature when using AlbersUsa projection (work around draw order of Mexico with AK/HI) ([10fcad](https://github.com/techniq/svelte-ux/commit/10fcad4e4f25dfa3db6fdbc5f3bc7e20fce3fe22))
- Upgrade svelte-ux ([457286](https://github.com/techniq/svelte-ux/commit/457286267089c0cdb16fe3595b1b113069a09ba7))
- [GeoTile] Add debug switch to example ([28fa42](https://github.com/techniq/svelte-ux/commit/28fa42fe8e690dec05df6faf67669f21203940e2))
- [TilesetField] Support opting in/out of 2x tiles (default based on device) ([3bfb5f](https://github.com/techniq/svelte-ux/commit/3bfb5f162b230621f2777f999283b82ebc6baabc))
- Add new Geo components to top-level exports ([0eed8a](https://github.com/techniq/svelte-ux/commit/0eed8a4dd973339c56b2ae0c48a0732a7c286064))
- Merge pull request #36 from techniq/geo ([aa2deb](https://github.com/techniq/svelte-ux/commit/aa2debc220a911841db8329c06cf2546773ee79c))
- Add Blur component ([7332ab](https://github.com/techniq/svelte-ux/commit/7332ab43c1abaf1d93e41f3422f410fddec3b5af))
- Update draggable globe with lofted arcs ([461cdb](https://github.com/techniq/svelte-ux/commit/461cdb38cbc66a2d67709993918ff5e173cdabda))
- [Zoom] Relace "projection" mode with "manual". Add DraggableGlobe example ([0606ab](https://github.com/techniq/svelte-ux/commit/0606ab9c0ee0aec355a70933af335c39c1e8b082))
- [Zoom] Maintain center when zooming with increase/decrease buttons, and zoom towards mouse when double clicking, including zooming out with shift. ([a7f380](https://github.com/techniq/svelte-ux/commit/a7f38064713c2f3fe12b0ee63a3e32b62048382e))
- [ZoomableTileMap] Remove outline ([a4bdee](https://github.com/techniq/svelte-ux/commit/a4bdeed3b4b9a6a51d318ebe90e525e18ffeedf0))
- [TileImage] Add tile coords as debug text ([e8ace9](https://github.com/techniq/svelte-ux/commit/e8ace91fa8a3f4515da3ec9366cfe13a8c52690a))
- Add TileImage with basic caching ([e69eb2](https://github.com/techniq/svelte-ux/commit/e69eb2ce4d131583204df1f7f2dcd346e9f423db))
- [ZoomableTileMap] Wire up debug field ([aa0382](https://github.com/techniq/svelte-ux/commit/aa03829708701aea47ca60ada3a927e3a15faf46))
- [Zoom] Add `mode` prop with `svg` (original) and `projection` options. ([37ecfd](https://github.com/techniq/svelte-ux/commit/37ecfd7221d8d10f50d7aec581baa79f28f5ace9))
- [GeoDebug] Add showCenter toggle to render circle at projection center ([0921c5](https://github.com/techniq/svelte-ux/commit/0921c59b4f9ad23e1b64a09dfb1e48761fd4e1f9))
- [GeoTile] Add debug prop ([317e2e](https://github.com/techniq/svelte-ux/commit/317e2e9dd6e60d51283abda1d51a5c2456e51fcb))
- [GeoDebug] Add helpful component to inspect geo/projection ([a9c163](https://github.com/techniq/svelte-ux/commit/a9c1630de1470a05519c7d0525c609403ef157df))
- [GeoContext] Only store projection in store ([27c141](https://github.com/techniq/svelte-ux/commit/27c141692421f5f38820a4dbd2276c38d62c4593))
- Fix typo ([9af701](https://github.com/techniq/svelte-ux/commit/9af701cd58e91d422edbeaab3ab7ae248932832e))
- [ZoomContols] Add placement and orientation props to simplify usage. Default to vertical top-right ([1babe5](https://github.com/techniq/svelte-ux/commit/1babe527ea4a934753485ebdc3e777b9706cfae9))
- [ZoomableMap] Add tooltip and hover state to counties ([ed9180](https://github.com/techniq/svelte-ux/commit/ed9180cdcfbae9f3f0251090b62e42ab61954871))
- [ZoomableMap] Show county details on selected state. Support resetting zoom if selected same state ([0fdc7d](https://github.com/techniq/svelte-ux/commit/0fdc7d7da04b5f25b87f4699c23764bfe0cbb7b0))
- [Zoom] Improve `zoomTo()` by passing bounding rect ([52a753](https://github.com/techniq/svelte-ux/commit/52a75340d67e287de47fe466ffab2073f32d5000))
- [RangeField] Add invisible min/max values overlayed on value to fix range input resizing as value changes (causing jank) ([f1d1e1](https://github.com/techniq/svelte-ux/commit/f1d1e104aba044b853f214f130fb557f158496ae))
- Add RangeField to simplify usage and apply improvements consistently ([d86527](https://github.com/techniq/svelte-ux/commit/d8652786e6038cb4b751c69cee15fc1c2d761eed))
- [AnimatedGlobe] Add SVG version. Support clicking on countries, list all countries, and highlight selected (selected from list or from globe) ([61f4ef](https://github.com/techniq/svelte-ux/commit/61f4efcf02e54c61b6afb4c48576b9f257c8bd52))
- Improve Choropleth examples ([47afc1](https://github.com/techniq/svelte-ux/commit/47afc150c4e8c716c07aba6f0c5ee1fd66253554))
- Add 2016 county unemployement data ([3adeb6](https://github.com/techniq/svelte-ux/commit/3adeb6d66faf3435d0d81d1bdb2c08ad4bd37b66))
- Update NavMenu order and adjust Albers USA display name ([38e3bb](https://github.com/techniq/svelte-ux/commit/38e3bb10db6711518e59a409b0921c6677fb8387))
- [GeoContext] Verify projection has fitSize before calling (custom projections) ([2d025d](https://github.com/techniq/svelte-ux/commit/2d025dd319fdf9fa5c9a6f341d21db4804f2c5c7))
- Add Legend to Bubble Map example ([29072e](https://github.com/techniq/svelte-ux/commit/29072e9f26ac49e2bcbb41c0eb2e4d55c9877522))
- Add new Legand impl. with support for most color scales (not just ordinal). Add `placement` prop, and additional styling options ([ef0280](https://github.com/techniq/svelte-ux/commit/ef028077ff03a29c28714cde2c4993cf4e74da46))
- [ColorRamp] Add chromatic scheme and d3-interpolate examples ([63a371](https://github.com/techniq/svelte-ux/commit/63a371c58d371a4f05a05c39de1d398c139ca87f))
- Add ColorRamp ([c962a2](https://github.com/techniq/svelte-ux/commit/c962a2c4da4d7c6d7c47f040400201a9b1519d05))
- Add Spike Map Canvas example ([34a69c](https://github.com/techniq/svelte-ux/commit/34a69c4456af61d4244b40c27bf8f45af2eca6bf))
- Add Bubble Map Canvas example ([16aeab](https://github.com/techniq/svelte-ux/commit/16aeab438399b46bdce852a395786ccdfb89f799))
- Add Spike Map example (SVG only currently) ([79d138](https://github.com/techniq/svelte-ux/commit/79d138b6b46c73a95493ed8994df71f6cd2e4a35))
- Add Bubble Map example (SVG only currently) ([b7a414](https://github.com/techniq/svelte-ux/commit/b7a4140ad6f6ccdcee98b93e0d65762afcc87b2a))
- [Zoom] Support pinch to zoom from wheel event + control key ([75e8d3](https://github.com/techniq/svelte-ux/commit/75e8d300b333162b7b651a7de4b1beb222e551f6))
- Add Zoomable Tile Map (WIP) ([713920](https://github.com/techniq/svelte-ux/commit/71392095c0067f04c0c458e5379860f0dd882eec))
- Remove lat/long from GeoPath tooltip example until accurate ([77263e](https://github.com/techniq/svelte-ux/commit/77263ec3ed31a22e82253dad9ea1b29d5cff92c0))
- Extract TilesetField for easier reuse ([240cb0](https://github.com/techniq/svelte-ux/commit/240cb012457f7d255451d050f1deb6b672d69cf4))
- [ZoomableMap] Support changing scrollMode ([43b361](https://github.com/techniq/svelte-ux/commit/43b3617d4ef48a17b828dcaea5d3732ec578066c))
- Add more tile services and organize using optgroup ([df2198](https://github.com/techniq/svelte-ux/commit/df219800197be10f26078423aa283b4a0405a6ec))
- [GeoPath] Show lat/long for tooltip example ([5a0b80](https://github.com/techniq/svelte-ux/commit/5a0b80ef282e029edb4272bceedd6fcaef35615e))
- [Zoom] Improve types ([aa0013](https://github.com/techniq/svelte-ux/commit/aa0013abe9bee370507cd25038f5bfd97a7be0ee))
- [Zoom] Simplify and improve wheel scrolling ([f79422](https://github.com/techniq/svelte-ux/commit/f794224299921c60d6355087f53267a5b83033c4))
- [Zoom] Do not propagate click to children if dragged beyond clickDistance threshold (default: 10) ([b66913](https://github.com/techniq/svelte-ux/commit/b66913c9947b932845c4c8b8098bb64504d96d7a))
- [GeoContext] Rename `geojson` to `fitGeojson` to better describe and differeniate from other geojson usage ([7beb59](https://github.com/techniq/svelte-ux/commit/7beb59397e81cbc8cbf74da573e1f752ca771fec))
- [GeoTile example] Show lat/long on tooltip ([7bbd8e](https://github.com/techniq/svelte-ux/commit/7bbd8ed3269841ba1322d8fe11cb6b31e4e532f2))
- [GeoTile example] Support selecting states to zoom/fit ([b73c09](https://github.com/techniq/svelte-ux/commit/b73c09ecdd431b2e17f287e64ca5ad676afb428e))
- [GeoTile] Support passing `tileSize` and do not reuse image elements when URL changes to fix odd display artifacts while zooming ([3ba392](https://github.com/techniq/svelte-ux/commit/3ba392bacbdfdfc648c8811908b7f3fd7e600cb4))
- [GeoContext] Reactively rebuild all of projection if any properties change ([80d741](https://github.com/techniq/svelte-ux/commit/80d741c2407b832d26fc65dfe96a9414b5982795))
- Add GeoTile ([ebe0ad](https://github.com/techniq/svelte-ux/commit/ebe0adefc03cbda61780ce2c994848f1394dc0d8))
- [GeoContext] Add support for center projection ([50c7fb](https://github.com/techniq/svelte-ux/commit/50c7fb0937d1a58bfea942d74f98b7c26b7da02f))
- Cleanup some imports ([377bb6](https://github.com/techniq/svelte-ux/commit/377bb6ab636167669dfade4d9677968c04e87fa1))
- [GeoPath] Support overriding slot (SVG) or render (Canvas) to access centroid of path for labels, etc. Add County Map example with state names at centroid of state path. ([672f3b](https://github.com/techniq/svelte-ux/commit/672f3bcdf7a9139c6f67217685d866950c78d5b6))
- Move docs/examples/data to \_data ([0919e0](https://github.com/techniq/svelte-ux/commit/0919e06b6da17ccce7fc68c60fa7e31fc8520894))
- [ZoomableMap] Scale stroke width based on zoom/scale ([b07a12](https://github.com/techniq/svelte-ux/commit/b07a12e4de148a7606f9a9d7f13855de21748395))
- Fix ZoomableMap example ([633393](https://github.com/techniq/svelte-ux/commit/633393a11a34ebe545a8a39bf23bffcb2e5ae0c6))
- WIP mixing pre-projected maps (using geoIdentity) with non-projected points ([7a2194](https://github.com/techniq/svelte-ux/commit/7a2194edaae0374779a250cb9ab72b87b12c9167))
- Add GeoPoint component ([c17d8a](https://github.com/techniq/svelte-ux/commit/c17d8a7fa1b3ded58faea7512830791e81ef4022))
- [GeoContext] Support passing `translate` ([c70cb9](https://github.com/techniq/svelte-ux/commit/c70cb9d061c9047401b760bce5d65c701571316a))
- Cleanup GeoPath example ([b6e619](https://github.com/techniq/svelte-ux/commit/b6e6198cf4433db8aff4c3668232fe0bc2001be8))
- Simplify Choropleth example ([792ba1](https://github.com/techniq/svelte-ux/commit/792ba16eb48f77b19fd9b60099142fa853121760))
- Add Zoomable Map example ([fccba9](https://github.com/techniq/svelte-ux/commit/fccba984468d0b594fd4c0343346ecc2af5fa925))
- [Chart] Expose the geo projection as a slot prop ([112f2d](https://github.com/techniq/svelte-ux/commit/112f2dc2725a20f656d76926b4f31e18f7ff7212))
- [GeoPath] Add click event, currently passing geoPath function and original event ([65bb18](https://github.com/techniq/svelte-ux/commit/65bb1828a89903a78223c540fe63a5b727f8dd76))
- Add ZoomControls for docs (remove redundancy) ([083ab8](https://github.com/techniq/svelte-ux/commit/083ab804044637ae7b4b51a8bb2740259bf24545))
- [Zoom] Add `scroll` prop to control how mousewheel/scroll is handled. Add support for scroll="translate" and scroll="none" (new default). Add `zoomTo` as slot prop and forward more events ([6f5d76](https://github.com/techniq/svelte-ux/commit/6f5d76e98094397ab84cc0948016b7fcc4057a72))
- Move Choropleth as separate example. Add Canvas example ([fcf471](https://github.com/techniq/svelte-ux/commit/fcf4715814fc7ec39674ccf47c4ec502292fb5ea))
- [GeoContext] Set optional props as undefined by default ([8e9de9](https://github.com/techniq/svelte-ux/commit/8e9de9c4769f1d7d146d66837c6009b084f7e5a9))
- [GeoContext] Add scale support ([1edf70](https://github.com/techniq/svelte-ux/commit/1edf7063d163c858b53f8b2074b6e2a6a1db5c59))
- [StateMap] Use state FIPS id for selection instead of name. Remove non-states ([9af7f7](https://github.com/techniq/svelte-ux/commit/9af7f794af6514cad359ddd23971926b39ae72cf))
- Rename GeoPathProjection to GeoProjection and simplify menu name ([f7650a](https://github.com/techniq/svelte-ux/commit/f7650a8583b20065efb4d418181068d2328b4dfe))
- Support toggling between detail (1:50) and simple (1:110) scales ([d21be1](https://github.com/techniq/svelte-ux/commit/d21be113aae0ed5874576b127185d14f96951a4a))
- [AnimatedGlobe] Use 1:110 scale to reduce draw time and improve animation performance ([37bdc3](https://github.com/techniq/svelte-ux/commit/37bdc356674618d62879f4c118cd2cca5d336740))
- Lighten up Graticule lines 10% ([ec892c](https://github.com/techniq/svelte-ux/commit/ec892c040c3e4ca6b70010c863e08c1a04d0ad2e))
- [AnimatedGlobe] Move graticule under countries/land ([f67e0e](https://github.com/techniq/svelte-ux/commit/f67e0e169e86205497acf142932dc2b46f55198f))
- [StateMap] Remove useless projections, filter counties by FIPS instead of flip path. Add more examples ([d0572e](https://github.com/techniq/svelte-ux/commit/d0572e8cbe949e486937accb9e78c46a86931df2))
- Add State map example ([78603e](https://github.com/techniq/svelte-ux/commit/78603ecd89bd5f3cb4932a240add44ffca8aafaa))
- Add ClipPathUse component to conveniently reference another path by id to use as clip-path ([5d9475](https://github.com/techniq/svelte-ux/commit/5d9475e1c38eba68a82debbf9621b311f6aea99c))
- [GeoContext] Add clipAngle and clipExtent ([6f4d46](https://github.com/techniq/svelte-ux/commit/6f4d461709a2d6f8122dfbc3f8c8bee3ae5b1ad9))
- Add a few more destiations to the animated globe example ([14336d](https://github.com/techniq/svelte-ux/commit/14336d805924af8eb42d116bc5840f1aaebce042))
- Add animated globe example ([b2309e](https://github.com/techniq/svelte-ux/commit/b2309eb0f9e8cd18dee47ef327fbf0b7cdfd3551))
- Add canvas example to projection example ([a058c2](https://github.com/techniq/svelte-ux/commit/a058c26952693b2dae492fcf22da7fa956590325))
- [GeoPath] No reason to iterate features when using canvas context ([2a5ec9](https://github.com/techniq/svelte-ux/commit/2a5ec983cf67aadd8104d4713ad3de0a9bdcc4d7))
- Remove pointer events from Graticule so tooltips detects on features ([cc35cc](https://github.com/techniq/svelte-ux/commit/cc35ccfa3ff79bbcb9e2c30d6c7323a67b265d74))
- Remove console.log ([5b5002](https://github.com/techniq/svelte-ux/commit/5b50025c9a579841f7ffaf07369c620c0ff7cf09))
- Add Graticule component ([38ab68](https://github.com/techniq/svelte-ux/commit/38ab686bcf53716575e0ae5d6df42e4b38c90510))
- Add outline/water to projection example ([28e99e](https://github.com/techniq/svelte-ux/commit/28e99e8f84661ac3119b4bacfce2a27cfd74e64d))
- Check if default slot defined before rendering wrapper. Move padding from header to content (to better support header-only tooltips) ([a62fcb](https://github.com/techniq/svelte-ux/commit/a62fcbb76eb543fd3d6224b1de038805098f370d))
- Add geoEqualEarth example ([e6ebbf](https://github.com/techniq/svelte-ux/commit/e6ebbfcbb0b4b8b71d46f8f5d8ba88ee1c1e12c4))
- [GeoPath] Fix browser projections, support rotation, add examples ([495426](https://github.com/techniq/svelte-ux/commit/4954268bcf193e8368e0003ca35ff3318776d463))
- Move GeoPath example to markdown with Preview component ([392f5e](https://github.com/techniq/svelte-ux/commit/392f5e176c0ef0a50b39138064a9801b5f5368a2))
- [GeoPath] Add Choropleth example ([b20901](https://github.com/techniq/svelte-ux/commit/b2090105ca50a7014d8e2aa0fde235c34278b2f1))
- [TooltipContext] Add `raiseTarget` to re-insert event.target as last child. Helpful for maps ([6bcb74](https://github.com/techniq/svelte-ux/commit/6bcb74778cd87088d44d63b4d15b404535182583))
- [GeoPath] Support Canvas render context ([be3173](https://github.com/techniq/svelte-ux/commit/be317300c6137a287c7b3f4a590961593241a9d4))
- [Chart] Add re-exports for Canvas and WebGL (like Html and Svg) ([8c8f7c](https://github.com/techniq/svelte-ux/commit/8c8f7c49a8e975bf8b22f06eadb6247c349d15a1))
- Add GeoContext and GeoPath (WIP) ([febdf6](https://github.com/techniq/svelte-ux/commit/febdf66aa7e3b98b782aa5d81f5da5e34a9442fb))
- Add @types for d3-geo and topojson-client ([becbbf](https://github.com/techniq/svelte-ux/commit/becbbf628bc2fa30e474da448c07bfa330987a51))
- Add d3-geo and topojson-client deps, and us-atlas as devDep ([ab7fc4](https://github.com/techniq/svelte-ux/commit/ab7fc4408548c90595a4faefffd6a8398bfe3d0a))

## 0.13.4

### Commits

- [Tooltip] Also use full containerWidth/Height (ignore padding) since no longer in LayerCake Html layer ([11c2b9](https://github.com/techniq/svelte-ux/commit/11c2b975f4326d9e844daa1cc9b468d66441a5c1))

## 0.13.3

### Commits

- Fix type imports ([e3ebcc](https://github.com/techniq/svelte-ux/commit/e3ebccd7248832f16467b33d1fab3d54f53421bc))
- Fix SpringOptions / TweenedOptions type import ([e694d8](https://github.com/techniq/svelte-ux/commit/e694d8079cffae6d907a6dfe70fde621253348dc))

## 0.13.2

### Commits

- [TooltipContext] Fix tooltip positioning by remove padding left/top offsets from localPoint since Tooltip no longer in LayerCake Html layer ([d7da65](https://github.com/techniq/svelte-ux/commit/d7da6588d8826d967094de7f60387f56ef022b69))
- Update ClevelandDotPlot tooltip example to use `bounds` mode ([41bf55](https://github.com/techniq/svelte-ux/commit/41bf55d1e0da1a99f1063a7eebd2a278a3e0b511))
- [TooltipItem] Add `format` for easy formatting. Also replace most usage of formatNumberAsStyle() with format() (or remove if not needed) to simplify examples. ([598e9c](https://github.com/techniq/svelte-ux/commit/598e9c8a6dabd8662f274ed3ab33436940ba8c3f))
- Update `tsconfig.json` to match current new SvelteKit project, and fix typing of `./$types` ([38a4f7](https://github.com/techniq/svelte-ux/commit/38a4f7e919201e30a6683a1746ffe072d29a3eb5))

## 0.13.1

### Commits

- [Baseline] Support passing `class` prop ([1ac147](https://github.com/techniq/svelte-ux/commit/1ac147e3baaf9102620cca4688e7174649ad48df))
- [TooltipItem] Use svelte-ux's `cls()` instead of `clsx()` directly. Support passing `class` ([953e9d](https://github.com/techniq/svelte-ux/commit/953e9da598db0970def05facfb3223e7e3bb26d7))

## 0.13.0

### Commits

- Update dependencies ([159097](https://github.com/techniq/svelte-ux/commit/1590979183e1ba5b6f7606b1b91d9e551b31ae64))
- [Chart] Pass tooltip instance instead of showTooltip/hideTooltip. Rename tooltip showTooltip/hideTooltip to just show/hide. Update Pie to require instanced passed before registering mouse events (to control which shapes trigger tooltip if more than one) ([c66394](https://github.com/techniq/svelte-ux/commit/c66394c8ed075f5587a7ee7458f11be1e82bef3f))
- Merge pull request #32 from techniq/tooltip-rework ([904bc7](https://github.com/techniq/svelte-ux/commit/904bc71d6ffee1a1b0d8442503f683fb28672fb9))
- Recommend `voronoi` / `quadtree` for stacked area charts (better highlight line / point detection) ([e0d087](https://github.com/techniq/svelte-ux/commit/e0d087783ff12d54b18c71b377fba207e31409a7))
- [Tooltip] Update examples to use named instead of positional settings ([e78ee0](https://github.com/techniq/svelte-ux/commit/e78ee0535e7416d287d93166f39e0187e04657f0))
- Forward click, mousemove, and mouseleave on more primative components ([1df0d7](https://github.com/techniq/svelte-ux/commit/1df0d7f9e2266268f8d0723466c3104b3ac49f81))
- Add Treemap tooltip example ([0597c7](https://github.com/techniq/svelte-ux/commit/0597c72321121612e3a100980f6275f3c485ae02))
- Pass `showTooltip` and `hideTooltip` as slot props on both TooltipContext and Chart ([d00023](https://github.com/techniq/svelte-ux/commit/d000238e4b7162b477a256bdf5a240f2be0b4cf1))
- [HighlightLine] Fix multi-series coloring using rScale ([a9bc26](https://github.com/techniq/svelte-ux/commit/a9bc26724af24e5cc41ec9c261fb6d6dac437676))
- Add TooltipContext docs ([23e7c6](https://github.com/techniq/svelte-ux/commit/23e7c6d206591332b455d683163e3093cadcde1c))
- Move TooltipContext component (context handling) into Chart ([3ce668](https://github.com/techniq/svelte-ux/commit/3ce6685acf24612322672bcd2cbdbe0c8723bc6b))
- Update Highlightline to use rScale for color. Update AreaStack to use rScale instead of zScale for color ([0c86a9](https://github.com/techniq/svelte-ux/commit/0c86a951b6b19d5f1d848db8dd67822f9bbd8bb8))
- [Pie] Add percent to tooltip example ([8334c7](https://github.com/techniq/svelte-ux/commit/8334c7eba5d2de6d2f6b5ad912a765499651122f))
- Rename TooltipContainer to Tooltip ([7c9928](https://github.com/techniq/svelte-ux/commit/7c992871cac0e5fe7de083c92922b722eeb29100))
- Rename Tooltip to TooltipContext ([c89487](https://github.com/techniq/svelte-ux/commit/c894878c47120c0b2d2afd597e885759e61fb748))
- Merge branch 'tooltip-rework' of https://github.com/techniq/layerchart into tooltip-rework ([ed893e](https://github.com/techniq/svelte-ux/commit/ed893e5d83283d2ef641dbc26ef02f939b630199))
- Move tooltip data slot prop access from Tooltip (context) to TooltipContainer (rendering) in preparation for further refactoring ([8086b3](https://github.com/techniq/svelte-ux/commit/8086b30d50d7f4ca50dd1a3f037d4997d8925e5e))
- Move tooltip data slot prop access from Tooltip (context) to TooltipContainer (rendering) in preparation for further refactoring ([a23b41](https://github.com/techniq/svelte-ux/commit/a23b417b7d1af901bc6119090673b0ddce136845))
- [Tooltip] Add manual mode (name WIP) which requires calling showTooltip/hideTooltip. Add Pie tooltip example ([26b2a3](https://github.com/techniq/svelte-ux/commit/26b2a33c5f9a5d686d9e1bf082400e8128f61157))
- [Pie] Add centroid labels ([c88c48](https://github.com/techniq/svelte-ux/commit/c88c4886df24aa034763a784d596ffa961c306a3))
- [TooltipContainer] Remove unneccessary Html wrapper (also fixes pointerEvents reaching Svg layers below) ([49fadf](https://github.com/techniq/svelte-ux/commit/49fadfaff1f650f5287d0921a5b026c822a50254))
- [TooltipContainer] Use style directive and emove max-width ([5a9c5c](https://github.com/techniq/svelte-ux/commit/5a9c5c369a04de1d0df9fd5c74c2f5c1ed764ba6))
- [Tooltip] Use switch statement to improve readability ([5f88b8](https://github.com/techniq/svelte-ux/commit/5f88b8e77fc5de363a3f128bd9c77826b2a9457b))
- Add showTooltip() and hideTooltip() to TooltipContext ([8b7abd](https://github.com/techniq/svelte-ux/commit/8b7abda1f58bde13cbe4827aec013e26ece69dc6))
- [Tooltip] Move context component around all layers. Update examples ([d755ea](https://github.com/techniq/svelte-ux/commit/d755ea800b7fb57baa47455c7b9800de65d2066f))
- Use includes instead of indexOf ([cea801](https://github.com/techniq/svelte-ux/commit/cea8018f7475310117ce60280a2f5e95a605b37f))
- [Tooltip] Use context to pass data. TooltipContainer now handles positioning within chart container. Other improvements ([60d38b](https://github.com/techniq/svelte-ux/commit/60d38be0cc4d954c421e13782d0f2ed9cd0fab80))
- Update svelte-ux with fixed sourceUrl after SvelteKit upgrade ([287617](https://github.com/techniq/svelte-ux/commit/28761762f9722d1df9d10f90cafa187fd09d7825))

## 0.12.1

### Commits

- Upgrade svelte-ux to 0.22 with removed usage of $app ([13ef35](https://github.com/techniq/svelte-ux/commit/13ef35554fd3b0cf9d1caefa63d5f010d256842c))

## 0.12.0

### Commits

- Relax svelte-ux version ([e3f385](https://github.com/techniq/svelte-ux/commit/e3f3858928022063b479fbcd7577276aa6eb3e83))
- Workaround sveld re-export issue ([3e0d88](https://github.com/techniq/svelte-ux/commit/3e0d88ede1033a230597ad15160c4e8a6ca6f008))
- Fix example data ([ac1f26](https://github.com/techniq/svelte-ux/commit/ac1f26d5a162bc7748c1049858e0929d17b243c6))
- Do not prebundle svelte-ux due to $app usage ([dcf29d](https://github.com/techniq/svelte-ux/commit/dcf29d7db38e47a4b3fccaf71acdc683c58b1f00))
- Replace `svelte-kit package` with `svelte-package` ([a55567](https://github.com/techniq/svelte-ux/commit/a55567529b290c7f8b82cae1e6b5130b9d905687))
- Upgarde SvelteKit to latest ([0bda78](https://github.com/techniq/svelte-ux/commit/0bda7845d0d77db9772727475acdad80eee9bc55))
- Remove docs Layout console warnings ([6e1862](https://github.com/techniq/svelte-ux/commit/6e186277e8b5eaa545e97e1450af6cb1dd3bebf4))
- Upgrade svelte-ux to 0.20.5 (with NavItem removed top-level) ([3443eb](https://github.com/techniq/svelte-ux/commit/3443eb101cb19c18c0a65f8991698defb882efa9))
- Fix labels ([5e0284](https://github.com/techniq/svelte-ux/commit/5e0284b3ad5b21cc2bb32fc487ed262bf27445e5))
- Fix stroke-width after switching from style to classes (tailwind) ([725c6d](https://github.com/techniq/svelte-ux/commit/725c6d6d5bffeda22c6d0c4fdc6b18428a5cb1db))
- Upgrade svelte-ux and update ToggleGroup usage ([174ba7](https://github.com/techniq/svelte-ux/commit/174ba79f48d6bbe0c0d29fb3d2a4a42e7f37130b))
- Fix home link ([a48102](https://github.com/techniq/svelte-ux/commit/a48102ee078a84dfd201d2356e6ece601a30aa55))
- Update svelte-ux with improved routing isActive util ([a2258c](https://github.com/techniq/svelte-ux/commit/a2258c2ea135c1d51c2227cc6eae0e824d520950))
- Relax svelte-ux dependency version ([356e6c](https://github.com/techniq/svelte-ux/commit/356e6cba5c48e139651f9a2ea3d763c3e7c3d1da))
- [Pie] Use centroid to add labels to slot example ([3c2673](https://github.com/techniq/svelte-ux/commit/3c2673cf1c9e29b808bfdc2f036ea1e44f1031db))
- Simplify `r` accessors ([ed9e06](https://github.com/techniq/svelte-ux/commit/ed9e0652b0f0f9fdf8ef6e13d23866658bcfdac7))

## 0.10.1

### Commits

- [Legend] Remove console.log ([fed481](https://github.com/techniq/svelte-ux/commit/fed481a927b71789f233a1f391736bd1aba30d9d))

## 0.10.0

### Commits

- [Legend] Get domain/range from context instead of directly from scale ([021820](https://github.com/techniq/svelte-ux/commit/0218208821012445c367a48b5bbc6504bfa86265))
- No longer provide explicit scaleBand domain in examples after LayerCake 7.x upgrade ([aa6fe9](https://github.com/techniq/svelte-ux/commit/aa6fe9700dcca5066b6996b7a1c9180cefc3f456))
- Update all but SvelteKit dependencies, including LayerCake and svelte-ux ([b01a54](https://github.com/techniq/svelte-ux/commit/b01a5465597581411af63618c3457756df63d109))
- [TooltipItem] value not required if using slot ([295d06](https://github.com/techniq/svelte-ux/commit/295d068f5ee2b876aa06bd016fb293b36c9441a8))
- [Labels] Use tailwind classes instead of styles for easier overwriting ([4c13ad](https://github.com/techniq/svelte-ux/commit/4c13ad4bcdc4644518acbf5c4a4cec0c35d4b13f))

## 0.9.3

### Commits

- [Labels] Add more versatile `format` prop ([2d9441](https://github.com/techniq/svelte-ux/commit/2d9441376ce9150e62c887a0b553826d0b3ec023))

## 0.9.2

### Commits

- [Bars] Add groupPaddingInner and groupPaddingOuter ([76463c](https://github.com/techniq/svelte-ux/commit/76463cdd28a77b08a85c2216e2039fbe0b2f9859))
- [Legend] Add formatLabel prop ([2e4d8c](https://github.com/techniq/svelte-ux/commit/2e4d8c29630780db4919a85606a6803aa51a7e2e))
- [Legend] Add examples for "top center" and "bottom center" position ([6917be](https://github.com/techniq/svelte-ux/commit/6917be68ac9caec2da464bd43de332f4e801ed0a))
- Add rehype-slug to fix ToC links ([09571b](https://github.com/techniq/svelte-ux/commit/09571bcdf54d89a01ee5ad104818555ed8468254))

## 0.9.1

### Commits

- Add Tooltip[Container / Item / Separator] components to provide ready to use styled components ([4c1d2d](https://github.com/techniq/svelte-ux/commit/4c1d2d5dabb69a96e7541690840a71709a50b90b))

## 0.9.0

### Commits

- [Chart] Do not require x, y, or yScale props ([7d8626](https://github.com/techniq/svelte-ux/commit/7d8626c2ca63becef8fce01896c0c1f20d4e7734))
- [Axis] Support passing labelProps. Move all styling to class prop (instead of style prop and component classes) to allow easy overwriting. Increase default label font-weight from 200 to 300. ([0dc042](https://github.com/techniq/svelte-ux/commit/0dc04266136f22090f618b2eced36a92b7de7191))

## 0.8.0

### Commits

- Add simple Legend. Issue #22 ([a60864](https://github.com/techniq/svelte-ux/commit/a60864f5ba6b777ac5df36867cb4be24f687f845))
- [Partition] Add full size leaf nodes to examples ([215b2c](https://github.com/techniq/svelte-ux/commit/215b2c77f2b4cd2168c50a728f2eaf6b1c8bacd0))
- [Chart] Expose slot props from LayerCake ([2352dd](https://github.com/techniq/svelte-ux/commit/2352ddacce302d73fe9627eff944998f13833783))

## 0.7.6

### Commits

- [Area] Add multi-series overlapping example ([46e406](https://github.com/techniq/svelte-ux/commit/46e406bc1843eed0995e183cbbb1e3ea85901a11))
- [Labels] Iterate flatData instead of data ([f3a357](https://github.com/techniq/svelte-ux/commit/f3a3573f506b07bd41287f6f881bc805aa0217f5))
- [Area] Pass data prop to Path (in case overridden from context) ([464809](https://github.com/techniq/svelte-ux/commit/46480920df0b741fcaa90b4148881490c4fbe0d0))
- [Path] Remove unused context accessor ([8f8de3](https://github.com/techniq/svelte-ux/commit/8f8de351c028cf605f71568ee566fd85378bb12c))
- Update svelte-ux with improved frontmatter replacement. Add frontmatter to examples and utils docs. ([1adefc](https://github.com/techniq/svelte-ux/commit/1adefcb26f3fe003fc7029fa4891fdf0a3d5e009))

## 0.7.5

### Commits

- Update scaleBandInvert() to handing paddingOuter with scalePoint() (variant of band scales) ([e464eb](https://github.com/techniq/svelte-ux/commit/e464eb3ac2c3d0743508264f975e1afaa6752c2a))

## 0.7.4

### Commits

- [scaleBandInvert] Properly capture paddingOuter pixel value instead of using `scale(domain[0])` or `scale(min(domain))`, which fixes <Tooltip mode="bisect-band"> in some cases. Issue #29 ([81fade](https://github.com/techniq/svelte-ux/commit/81fadec5068d5aad4036266db06470906004034e))
- [Bars] Add group/stack/group and stack transition example. Issue #21 ([ca8c83](https://github.com/techniq/svelte-ux/commit/ca8c838cfe30eed496eaebcce4088677d190285a))
- [Rect] Support passing per-property motion options. Issue #21 ([4a0c5c](https://github.com/techniq/svelte-ux/commit/4a0c5c5c0c042333d0bdd28403980f967a1d78d4))

## 0.7.3

### Commits

- [Tooltip] Add "Snap to data" options to examples ([09a92a](https://github.com/techniq/svelte-ux/commit/09a92a7b985259db2e350b26b4fd606294e69fa8))
- [Tooltip] Fix tooltip position for non-bisect modes (band, voronoi, etc) as event.target != inner chart container ([df81fa](https://github.com/techniq/svelte-ux/commit/df81fa1ea659a5e242dc7b199f5f6196717d1622))
- [Baseline] Fix non-bandwidth scale y-axis alignment (use `0` not max/bottom). Issue #29 ([e33168](https://github.com/techniq/svelte-ux/commit/e33168600484b979bd3c40d656891bbc7fe9e804))
- [Zoom] Add gap below controls on example ([409f1f](https://github.com/techniq/svelte-ux/commit/409f1ff72586dba495067c5c9497ef0450e96078))
- [Tooltip] Improve example descriptions ([858e83](https://github.com/techniq/svelte-ux/commit/858e83e71e1cacfa1c999d48ae8a4a529e5f088b))
- Upgrade svelte-ux with improve code preview. ([a65d55](https://github.com/techniq/svelte-ux/commit/a65d556a6ce7d27c137e7540afc169c3e1bdfc75))
- Move component docs to "docs" subfolder so svelte-ux's markdownToc() preprocessor is used. Update all docs to have component name and link to source / page. Other minor tweaks ([9a901c](https://github.com/techniq/svelte-ux/commit/9a901c17a2d9bf50a75728d78b11170ad227907f))

## 0.7.2

### Commits

- [Tooltip] Dispatch click event for band, bounds, and voronoi (already for bisect and quadtree) ([eb0153](https://github.com/techniq/svelte-ux/commit/eb01536e8b55fac645fb34470940697b615c6ae8))

## 0.7.1

### Commits

- Add a few more scaleBandInvert references ([6de555](https://github.com/techniq/svelte-ux/commit/6de555955533cb38d1a51cd4b370e992fa20cb90))
- Remove console.log ([6ff145](https://github.com/techniq/svelte-ux/commit/6ff1454f591d2726e23631c73c1106cc626ed3d8))
- [Tooltip] Set multiple (overlapping) durations axis to "both" by default ([e18fb0](https://github.com/techniq/svelte-ux/commit/e18fb0e81aab327c79a3213596ecd4ee5d138f15))
- Remove extra line in jsdoc comment ([d56c98](https://github.com/techniq/svelte-ux/commit/d56c98ae6413d993acfc2293a70251d1a07dd197))

## 0.7.0

### Commits

- Rename bisect to bisect-x and support bisect-y (although needs sorted). Add bisect-band for better overlapping duration support. Issue #28 ([9e6b88](https://github.com/techniq/svelte-ux/commit/9e6b88768718b967dd277057416414abbeae310e))
- [Tooltip] Sort bounds and bands rects by `x` to render later rects on top ([af8551](https://github.com/techniq/svelte-ux/commit/af85519132faf2b4613ff2e21a86ca88d3841a47))
- Do not reverse yDomain for scaleBand after Chart update to no longer set yReverse={true} for yScale={scaleBand}. ssue 29. ([4950ca](https://github.com/techniq/svelte-ux/commit/4950ca965e077d16ffcf2c15a24efdc48e057a15))
- [Tooltip] Add low opacity red fill to debug shapes to better see overlap ([5b45f0](https://github.com/techniq/svelte-ux/commit/5b45f05ed13ca0fcdc388d321bbc90d33d69ad66))
- [Chart] Do not set yReverse={true} if using scaleBand. Displays yDomain values top-down instead of bottom-up. Issue 29. Issue mhkeller/layercake#83 ([cfa11b](https://github.com/techniq/svelte-ux/commit/cfa11b0f62a91729ce45c3256223022c8e68e2ab))
- Use min/max instaed of [0]/[1] when accessing range values. Closes #29 ([c1a2c5](https://github.com/techniq/svelte-ux/commit/c1a2c560b6bd05c7c922019f01ff0d8605d99bb7))
- [AxisX] Always use smallest value (not always guaranteed to be the first value). Issue #29 ([16042b](https://github.com/techniq/svelte-ux/commit/16042b05e071c135a3db7be5a8d4574b771a5593))
- [HighlightRect] Always use smallest value (not always guaranteed to be the first value). Issue #29 ([046314](https://github.com/techniq/svelte-ux/commit/04631411c08cf85042b2f03dc984262b2dd6210c))
- Update scaleBandInvert() to always use smallest value (not always guaranteed to be the first value). Issue #29 ([bf9843](https://github.com/techniq/svelte-ux/commit/bf984326f3e4ee713097a413b5d2f7427ffd1174))

## 0.6.9

### Commits

- [Tooltip] Handle voronoi mode when width and/or height are negative (sometimes when loading data remotely and updately) ([c3e07c](https://github.com/techniq/svelte-ux/commit/c3e07cc1563735e2f3d36bc24b0a4fc28438106d))
- Update dependencies, including svelte-ux, which updates document.title from AppBar ([d6e7d1](https://github.com/techniq/svelte-ux/commit/d6e7d1a17b8e73322402c3a53ef2945fcdc1bddd))

## 0.6.8

### Commits

- Add explicit else for clarity (and support additional modes in future) ([2b1028](https://github.com/techniq/svelte-ux/commit/2b10288a7295d5f4afdf85df6e599e13d8881179))
- [AxisX/Y] Improve type on gridlines (<line> props) ([4b9703](https://github.com/techniq/svelte-ux/commit/4b97036db76de88b664aaccc1f7850293e1bad70))
- [HighlightLine] Support `axis="none"` ([e0bb83](https://github.com/techniq/svelte-ux/commit/e0bb8371b0fc9129eae670994d52476b3eed7a57))

## 0.6.7

### Commits

- [HighlightLines] Support "both" axis (useful for crosshairs on scatter plots). Issue #28 ([4a1073](https://github.com/techniq/svelte-ux/commit/4a10737d9fc3b18a48384313aa37cd0d5148d049))
- [HighlightRect] Support "both" axis (useful for durations). Issue #28 ([01dc7e](https://github.com/techniq/svelte-ux/commit/01dc7e9489e1b0e04f79d18d3f4866b96990c36e))
- [HighlightRect] Support "y" axis highlighting (useful when yScale={scaleBand()}. Default to axis with scaleBand, but can be overridden. Issue #28 ([8cc897](https://github.com/techniq/svelte-ux/commit/8cc897a0a45bbe767aad6c85d744135644d993bf))
- [Tooltip] Document recommend / supported modes based on scales ([39218b](https://github.com/techniq/svelte-ux/commit/39218bdbd07329f7bf4d5d88ee5b06c46cf8cb73))
- [Tooltip] Improve support for using voronoi/quadtree with Area Stack ([f8d6a0](https://github.com/techniq/svelte-ux/commit/f8d6a0f38935871dc98e9b637c88866c96425a0a))
- [HighlightRect] Handle last point on continuous xScale (time, linear) ([4bfcc1](https://github.com/techniq/svelte-ux/commit/4bfcc19615e6c61d237c028f6f2fc5571d42de6b))

## 0.6.6

### Commits

- Add scaleInvert() scale util ([8bfa2e](https://github.com/techniq/svelte-ux/commit/8bfa2e7f5f57ed4bd1ee45f523edb96131455ea1))
- [Tooltip] Add TODO to set default mode from scales (if possible). ([adaade](https://github.com/techniq/svelte-ux/commit/adaade52488a2fd7f407d72bd043bd2acfc6a213))
- [Tooltip] Allow changing highlight type (line, rect) in examples ([66d1d2](https://github.com/techniq/svelte-ux/commit/66d1d2da7e03c2282e065438a836f32471f6a2a2))
- Improve multiple (overlapping) bar chart examples. Simplifies and improves Tooltip mode="bounds" ([8bf42c](https://github.com/techniq/svelte-ux/commit/8bf42c29a026684c8a7bc2fa03b2eb3d58cf6703))
- [Tooltip] Rename "rect" mode to "bounds". Add "band" mode. Update voronoi to partially handle array getters. ([8a72a7](https://github.com/techniq/svelte-ux/commit/8a72a764afab82552a4629833f34bc8b971a3d9c))
- [Points] Allow setting color via rScale or color function/constant (or slot) ([535acd](https://github.com/techniq/svelte-ux/commit/535acdd36caea44cfeb86fee22d7ae311febb5c8))
- [Tooltip] Add rect mode (WIP). Update examples to change modes/toggle debug. Issue #28 ([45bd1b](https://github.com/techniq/svelte-ux/commit/45bd1b9910dc5276ac2f2b95f5cabd82f49b2e6c))
- [genData] Add createTimeSeries() ([3dfe8b](https://github.com/techniq/svelte-ux/commit/3dfe8b1061f3f53aaab79b31ee84fb634e8756da))
- [Tooltip] Add quadtree mode. Add debug prop to visualize voronoi and quadtree. Issue #28 ([cbb77c](https://github.com/techniq/svelte-ux/commit/cbb77c1ba3abb603a180afb708fcb65ab819bc60))
- [Tooltip] Add voronoi mode. Issue #28 ([7e7be9](https://github.com/techniq/svelte-ux/commit/7e7be9712b27f24a4ba11fcc7192dded7ecb5ac6))
- Add link to repository in AppBar ([25fc7b](https://github.com/techniq/svelte-ux/commit/25fc7b2eaa60c7ee085ac26bcb9d63986b002256))
- [Tooltip] Add single time chart example ([c3a97f](https://github.com/techniq/svelte-ux/commit/c3a97ff661324d3cb7860bc79445740521a7e11a))

## 0.6.5

### Commits

- [AxisY] Fix location when using yScale={scaleBand()) ([ddb7ba](https://github.com/techniq/svelte-ux/commit/ddb7ba878e020bc01f731ef04a067af1ef9f2bdd))
- [Tooltip] Add examples (consolidated from each chart example) ([1adebc](https://github.com/techniq/svelte-ux/commit/1adebc948cb9a778236b8c6441897532adf33f1e))
- [Tooltip] Handle `x` accessor with multiple properties (ex. `x={['start', 'end']})`). Issue #28 ([bc453c](https://github.com/techniq/svelte-ux/commit/bc453c2b4291b23b8fb5039e8b3c0b3a61240aa3))
- Add back explicit springScale (to match tweenedScale). Still have motionStore which will use the applicable store based on MotionOptions ([c9b4f2](https://github.com/techniq/svelte-ux/commit/c9b4f2f220b8710d2351d6c50569ac1125b11314))

## 0.6.4

### Commits

- Add top-level exports for many common utils ([84a56c](https://github.com/techniq/svelte-ux/commit/84a56c2eff5d942eb86885d42275169c22f6b9aa))
- [utils/stack] Allow passing order ([1da685](https://github.com/techniq/svelte-ux/commit/1da6851095547805a7638fecfa1d2dc7252b8693))
- [Pack] Fix click propagation in example ([36187a](https://github.com/techniq/svelte-ux/commit/36187ae58e367dae10eafa7c85f552073ed05d17))
- [Path] Add more path examples ([ac7d48](https://github.com/techniq/svelte-ux/commit/ac7d48b258ebaa2f6027668a20ea6aac288e7425))
- [Sunburst] Show arcs are clickable and tweak stroke color ([bd6922](https://github.com/techniq/svelte-ux/commit/bd692294e9c6bf5b90faf124e40ad0b7b90157b2))

## 0.6.3

### Commits

- [Zoom] Add wrapping <g> for mouse events so drag is propagated from <slot> objects (Tree nodes, etc). Issue #16 ([a5559c](https://github.com/techniq/svelte-ux/commit/a5559ccdc6a80cf8ec4c5372b2565b9c0481f9b0))
- [Tree] Update zoom reset icon and adjust order to match other examples ([f602ac](https://github.com/techniq/svelte-ux/commit/f602ac6f76093499e69a6f6e86d27dcb8047b3a6))
- Forward click event from clip paths and Zoom ([9936cd](https://github.com/techniq/svelte-ux/commit/9936cd1e0c89473678c662158da56255932cea2b))

## 0.6.2

### Commits

- [Pack] Disable Zoom pointer on example. Allow clicking outside to select root. ([26500f](https://github.com/techniq/svelte-ux/commit/26500ff026448d2334a0af0c48cbe3c3e8f7de37))
- [Zoom] Add disablePointer to remove dragging/mousewheel/etc. Can still be controlled programmatically (zoomTo(), etc) ([e678ee](https://github.com/techniq/svelte-ux/commit/e678eeb630b99a25c6233e34cd9cf743b29c405d))
- [Pack] Add stroke to text for better readability. Issue #27 ([3f3f13](https://github.com/techniq/svelte-ux/commit/3f3f1358dde6b151f53d78317c21831ff2916bdc))

## 0.6.1

### Commits

- Add Pack to top-level exports ([d381a5](https://github.com/techniq/svelte-ux/commit/d381a5e67e5a8fe577224315384a5f08ec8a45e9))

## 0.6.0

### Commits

- Remove unneeded <g> with transition ([d87cc1](https://github.com/techniq/svelte-ux/commit/d87cc16d4c55bd17d586582e0570354476675cb1))
- Add Circle Pack ([3e75a4](https://github.com/techniq/svelte-ux/commit/3e75a4b215e02bbf43a10503380d1ea50f788aaf))
- [Zoom] Hard set values when using tweened() store (like spring()) ([3fb791](https://github.com/techniq/svelte-ux/commit/3fb791eec3d9e47e064539178c7362524f5b734b))
- [Zoom] Add zoomTo(). Comment out on Tree example until expanded/selected work better together ([128026](https://github.com/techniq/svelte-ux/commit/128026e492bab753a73eaf0c595d1f59b25ddb31))
- Add backdrop-blur to zoom controls ([1c47f2](https://github.com/techniq/svelte-ux/commit/1c47f20fe9e120e50cbd8aa95ca6ff7bad4ceded))
- [Zoom] Now requires opting in to transitions, but supports configuration (tweened or spring, with options) ([89704e](https://github.com/techniq/svelte-ux/commit/89704e32ec04050b60fecfdc20ea239a41da99f4))
- [Tree] Pass orientation to layout (example) ([28b3c8](https://github.com/techniq/svelte-ux/commit/28b3c8294fba8378a3470d2f751a385c240fa686))
- [Circle] Default cx / cy to to align with Rect x / y, fix console warnings ([9b97a3](https://github.com/techniq/svelte-ux/commit/9b97a3185e0ac79654f994f9b0f316051a70ed75))
- Use const for stores to represent intent ([84a171](https://github.com/techniq/svelte-ux/commit/84a1716d016d1a64dbc7ae1c82aed3a2b8a7c015))
- [Treemap] Simplify by using `root.descendants()` and passing to default slot (matching other hierarchy layout components). Saves group() iteration and removes `nodeKey()` prop (provided at usage). ([d226c7](https://github.com/techniq/svelte-ux/commit/d226c7743ed890392258da74189d49ed85716b7f))

## 0.5.2

### Commits

- [Partition] Add filterable example ([99cb58](https://github.com/techniq/svelte-ux/commit/99cb58910e6b3277e4bff15d6ea3f58fd6fb92ad))
- [Partition] Update Horizontal example to always show values to right for better visibility for small values/heights ([8d3971](https://github.com/techniq/svelte-ux/commit/8d3971222128c488e33397416eda4f899fc8b5c8))
- Consolidate tweenedScale() and springScale() to motionScale(), working similar to motionStore() (and using under the hood). Update Bounds to require opt-in to tweened (and also support spring). Improves performance of filterable treemap / partition, etc ([b4ea2d](https://github.com/techniq/svelte-ux/commit/b4ea2d26c5e749e68e5fef49476ffa5140cbad00))
- Rename createMotionStore() to just motionStore() ([80a246](https://github.com/techniq/svelte-ux/commit/80a246b64664e0c681454f89961afe31a6a65ba1))

## 0.5.1

### Commits

- Add Bounds, Partition, and Tree to top-level exports ([b5aea4](https://github.com/techniq/svelte-ux/commit/b5aea4cce72c836d3bf9167a9b2c31fd6d92d8ce))

## 0.5.0

### Commits

- [Sunburst] Use <Bounds> instead of direct use of tweenedScale for xScale/yScale ([6b85bb](https://github.com/techniq/svelte-ux/commit/6b85bb82e3578877b9c770a1722726b6780103d4))
- [Bounds] Support passing function to domain/range with access to $width/$height to calculate. Needed for Sunburst (height / 2) ([0accab](https://github.com/techniq/svelte-ux/commit/0accab5b23e1050144c83b6a6004a4bf9ff73ce5))
- [Bounds] Rename `extents` to `domain` and expose setting `range` ([073525](https://github.com/techniq/svelte-ux/commit/07352567c0f0ae76360b0b2e767acbfc56ca7864))
- Adjust stroke color ([6bf7cd](https://github.com/techniq/svelte-ux/commit/6bf7cdcdccfd45d20ed6d30b5032ef8ce78b4a89))
- Add SunBurst WIP ([2d2588](https://github.com/techniq/svelte-ux/commit/2d2588f1cf56f1d27232013708915cfa92aeeb1b))
- [Partition] Support passing in size (override back to default [1,1], for example) ([ff9f2f](https://github.com/techniq/svelte-ux/commit/ff9f2f0f4391eac293612e781261efb1f73fc395))
- [Arc] Add on:click event forwarding ([5f9e03](https://github.com/techniq/svelte-ux/commit/5f9e03ed5012145e9b75145ba835609307c63d7d))
- [Partition] Minor cleanup ([7cad93](https://github.com/techniq/svelte-ux/commit/7cad933c5d597fbb112586a1ea7517dbc979b0cd))
- [Treemap] Require user to wrap with ChartClipPath as needed, instead of always. Not always needed (see filterable treemap) and matches Partition usage ([e31057](https://github.com/techniq/svelte-ux/commit/e310574a87c36987bd290528393d2fec3052f960))
- [Partition] Add selection zooming using Bounds and ChartClipPath ([f55a0a](https://github.com/techniq/svelte-ux/commit/f55a0a2c5690fed12a8594ce3a78684d04c4973e))
- [Partition] Cleanup example ([3732c4](https://github.com/techniq/svelte-ux/commit/3732c4ff5ab7f4f05fb1cee6082b6ed4547c294b))
- [TreeMap] Use Bounds directly instead of within Treemap, which allows removing `rect` slot prop ([b1082b](https://github.com/techniq/svelte-ux/commit/b1082b717b32d8d3d29de6584229906482d821c6))
- Add Bounds component to simplify using tweenedScales to "zoom in". Use with Treemap (and soon Partition) ([f92811](https://github.com/techniq/svelte-ux/commit/f9281174873b53fb0384cff1e30e97e4948ae749))
- Add tweenedScale() and springScale() and use to simplify Treemap transitions ([b8d505](https://github.com/techniq/svelte-ux/commit/b8d505aa47c7c232633be2c7d4fae8f81bfe8b41))
- [Treemap] Simplify updating tweened extents ([72e262](https://github.com/techniq/svelte-ux/commit/72e2629d5a31379c6b2b24450e61e4895f5d136e))
- [Treemap] Use new ChartClipPath instead of RectClipPath to simplify ([0d22fc](https://github.com/techniq/svelte-ux/commit/0d22fcd71ae3d2d3839d4af963f0da1f61ae7b6b))
- Add Partition layout. Issue #10 ([6c9051](https://github.com/techniq/svelte-ux/commit/6c9051fdcbc3bbae7f3b4cb46c71d7495a41ea9a))

## 0.4.1

### Commits

- Update svelte-ux ([1c3c7b](https://github.com/techniq/svelte-ux/commit/1c3c7bdbb04cd1df9ae521db1de11b3fff8dc6ad))
- Upgrade SvelteKit and remaining dependencies ([d4041d](https://github.com/techniq/svelte-ux/commit/d4041dbbb9d0e699e8ee2795b1ca116591380da4))
- Upgrade non-major dependency versions ([2b34e7](https://github.com/techniq/svelte-ux/commit/2b34e7a4ab77b330651dc0732b2ceae5c82fd272))

## 0.4.0

### Commits

- Upgrade svelte-ux, which replaces "tailwindcss-elevation" with "svelte-ux/plugin/tailwind" ([427653](https://github.com/techniq/svelte-ux/commit/4276538b5b23725e92f350f5fc3c3fd4f8d7166d))
- [Zoom] Immediately set translate and zoom when dragging or using wheel ([3e3a93](https://github.com/techniq/svelte-ux/commit/3e3a9380fbe6e9b1558b28fab5ab2d51d2509e35))
- [Zoom] Add interactive example using getSpiral(). Issue #16 ([5e2cfb](https://github.com/techniq/svelte-ux/commit/5e2cfb32ea33327683ad83209e1d073772e39024))
- Add getSpiral() and specific getPhyllotaxis() data generators ([3b5d3b](https://github.com/techniq/svelte-ux/commit/3b5d3bb62832f712cdc43c80d26c8da800195dc0))
- [Points] Allow passing <slot /> to override full override rendering ([00b595](https://github.com/techniq/svelte-ux/commit/00b5954ec19f2ae489e3d590bc5557803cf41763))
- [Zoom] Use spring() to tween scale and translate values. Issue #16 ([67585c](https://github.com/techniq/svelte-ux/commit/67585c2f84b5899e692d63d4dc33ea73da7995fc))
- Add radiansToDegrees() math util ([4ac9bf](https://github.com/techniq/svelte-ux/commit/4ac9bf19983c703cdc97f12ea4b3c4b027f7b64a))
- [Tree] Add top padding to not overlap controls ([48932a](https://github.com/techniq/svelte-ux/commit/48932a1b76dc79b45b575da6049d4f49e0e13abe))
- Add Zoom docs placeholder ([1ea051](https://github.com/techniq/svelte-ux/commit/1ea051d99e53c9a8e754afd226f1e804ed811fa9))
- Add Zoom component (WIP). Issue #16 ([49272f](https://github.com/techniq/svelte-ux/commit/49272fe9f2a47b10154bbc4a5240685e9b23c323))
- [Tree] Hide overflow in example ([35eb19](https://github.com/techniq/svelte-ux/commit/35eb194da8f3dec99f0216429c355a02641444ec))
- Add ChartClipPath ([ef6ba1](https://github.com/techniq/svelte-ux/commit/ef6ba1a3b7e9aecd137be66abefa4e0dad8f13d6))
- [Tree] Remove unneccessary tweened in example ([26fcbb](https://github.com/techniq/svelte-ux/commit/26fcbb47465b0ce81652836729325cc32149ebf7))
- Remove (WIP) from Tree example menu item ([2498df](https://github.com/techniq/svelte-ux/commit/2498dfc1623e14c804f4355c598ec9f7817e2704))
- [Tree] Support passing nodeSize for sizing (vs using chart size). Add to example ([6e8fd1](https://github.com/techniq/svelte-ux/commit/6e8fd1f4b197077bdce132a60a759a9d3c798b09))
- [Tree] Add expandable nodes to example ([d9ffef](https://github.com/techniq/svelte-ux/commit/d9ffefd27588bb4183b4f238aad4d495b7778ca4))
- Cleanup Tree example ([26763c](https://github.com/techniq/svelte-ux/commit/26763c29fa2aa6d5b2006454f861a5e978b4a8a0))
- [Tree/Link] Support changing curve ([e3fea3](https://github.com/techniq/svelte-ux/commit/e3fea31bdfb5574aa7b4c7e5c2ea76c916ed78b1))
- Set Link x/y getters based on orientation. Cleanup Tree example and allow changing orientation. ([0bd95c](https://github.com/techniq/svelte-ux/commit/0bd95c0ef0cbee4f6814e65c5546774f566ff663))
- Add Tree component WIP ([bd7452](https://github.com/techniq/svelte-ux/commit/bd7452c75bfb8bf5cd7e1f79994146fb99ba677a))
- [Link] Support orientation to specify curve and update/expose x/y props for getters (support sankey and non-sankey) ([56088a](https://github.com/techniq/svelte-ux/commit/56088a860d2be9f003a3b9405058b4ea9040ecae))
- Fix menu text for CircleClipPath ([6fb7ec](https://github.com/techniq/svelte-ux/commit/6fb7ecf91a643cd043a560adffca494133bae8b5))

## 0.3.6

### Commits

- Add cereal dataset ([0b723d](https://github.com/techniq/svelte-ux/commit/0b723d7134738b1a565cbfcc4bbfcc894d5cebe3))
- [Treemap] Rename key prop to nodeKey. Show rootNode breadcrumb if none initially selected ([046ec7](https://github.com/techniq/svelte-ux/commit/046ec7d93bbd6c405102e7861e38c2fb5e057f59))
- [Treemap] Add filterable treemap example with transitions. Add large cars.csv dataset ([8c3673](https://github.com/techniq/svelte-ux/commit/8c3673f65914ae9059db67c016969eb5b34632c6))
- [Treemap] Support passing key lookup ([6450b1](https://github.com/techniq/svelte-ux/commit/6450b13686b462fd5d49e7064e31cf285387170b))
- Setup @rollup/plugin-dsv to support csv import. Add Treemap CSV example ([0012ae](https://github.com/techniq/svelte-ux/commit/0012ae26fc83c17f200e7496b317a24871d4c548))

## 0.3.5

### Commits

- Group by depth instead of height to fix stacking of inconsistent heights ([8a80e7](https://github.com/techniq/svelte-ux/commit/8a80e76927b9304b90443899edca0eb1a53fb7c4))

## 0.3.4

### Commits

- Move isNodeVisible() to treemap utils ([298e13](https://github.com/techniq/svelte-ux/commit/298e13ae74632e8e5f07e8bf7933c687274e8aa7))
- [Treemap] Update after prop changes (padding, etc). Add controls to Nested example to control padding ([f9b33e](https://github.com/techniq/svelte-ux/commit/f9b33e147d47cc4928eb696c8f5c1dbfcd63623f))
- [Threshold] Use Field on curve selection example ([1eff12](https://github.com/techniq/svelte-ux/commit/1eff125713aa62e674b04469f420c4c17c609fcf))
- [Treemap] Improve color by option width and filter out hard to see yellow and green from schemeSpectral ([9a2075](https://github.com/techniq/svelte-ux/commit/9a2075dd3dd9d4effefc3521a9b58caa488d7526))

## 0.3.3

### Commits

- [Treemap] No longer clip nodes by default to give better control. Fix clipping half of stroke for example. Change to named "node" slot instead of default to allow overwritting nodes iteration (if <slot /> ever added) ([52a6de](https://github.com/techniq/svelte-ux/commit/52a6de54f3ffb2ff2c2dbb08d53af3c0847c2f83))

## 0.3.2

### Commits

- [Treemap] Add color to examples ([0a64a5](https://github.com/techniq/svelte-ux/commit/0a64a58fafd0957ec021b6ebaf29cc4abbb1123d))
- Add findAncestor hierarchy util ([fcfdf9](https://github.com/techniq/svelte-ux/commit/fcfdf9dbfc78877078c5c3d1a510d14bcd3cd21d))

## 0.3.1

### Commits

- Add missing exports ([515943](https://github.com/techniq/svelte-ux/commit/5159434da4b88ce89fc77a78ab7839c0ce8380ab))

## 0.3.0

### Commits

- [Bars] Add commented-out Horizontal example (to fix) ([e63b0e](https://github.com/techniq/svelte-ux/commit/e63b0edebf7f93d6e8976f1e5f35df76b8a60028))
- [Bars] Do not allow negative width (from negative widthOffset) ([d6246f](https://github.com/techniq/svelte-ux/commit/d6246ffcef2d86924d1e871398c8178d7fc1e644))
- Add documentation placeholders for ClipPath, RectClipPath, and CircleClipPath ([f57664](https://github.com/techniq/svelte-ux/commit/f57664bdf99b831a3f90b5ca98bba6ba9a53d96c))
- Simplify Treemap implementation. Remove zoomable prop, use consist height-based render regardless, handle node layout/clipping. ([830d53](https://github.com/techniq/svelte-ux/commit/830d53d21e7fdd01db30b1a8f9567d71ac0c1d95))
- [Sankey] Improve showing text to left if right-most node ([bbb4be](https://github.com/techniq/svelte-ux/commit/bbb4be9f3a95c1fa5d27638a1c8f8a8f2f280226))
- [Sankey] Improve selected example (handle duplicate links, use unique data source due to mutation by d3-sankey) ([2f68a3](https://github.com/techniq/svelte-ux/commit/2f68a3cb3c7149d50b76a2d5bde01d18f1f660ba))
- Add more example graph data ([f00255](https://github.com/techniq/svelte-ux/commit/f0025555f983d52b32a788f37d1784a31136d04e))
- [Sankey] Add selection example ([ed7bff](https://github.com/techniq/svelte-ux/commit/ed7bffa91a0b7d544c07c54d2e2bbef4305e0fdf))
- Extract linkOpacity config for easier adjusting ([9fe1f9](https://github.com/techniq/svelte-ux/commit/9fe1f97f82e1d1cbad0a13b543979fdbd7aa4e76))
- Add graphFromHierarchy() util and add Sankey example using hierarchy data ([008603](https://github.com/techniq/svelte-ux/commit/0086030b9725762f0f695efd7e77452a0b2086c7))
- [Sankey] Add `update` event when initialized / updated to access nodes/links imperatively ([b98a84](https://github.com/techniq/svelte-ux/commit/b98a841a42c2dc5be9da9780703103c00d6fc77b))
- [Sankey] Support changing link color in example ([dc5327](https://github.com/techniq/svelte-ux/commit/dc5327df35ad3f0c10f4cdb090ac57d5e4bf8aa5))
- Remove prototyping remnants ([5f64c2](https://github.com/techniq/svelte-ux/commit/5f64c2869fdf60ef09d4cf433ed4338bd9d8315f))
- Consolidate Treemap and NestedTreemap into same component ([d2e1cf](https://github.com/techniq/svelte-ux/commit/d2e1cfa7bcb0614b377ed6e462acb8b80d077512))
- Tween overlooked RectClipPath in Nested Treemap example ([f2dcbc](https://github.com/techniq/svelte-ux/commit/f2dcbc55c36c757ae5313c02a9ff49cacb4c92c3))
- Support tweened RectClipPath and CircleClipPath. Update Nested Treemap example to tween transitions ([757e6b](https://github.com/techniq/svelte-ux/commit/757e6b2d921f43c33e6f588cb7c625ecb90dd8ab))
- Add NestedTreemap example ([f00514](https://github.com/techniq/svelte-ux/commit/f00514cba61a4740eabc2e9fb0f92872ee5742a2))
- Use d3-hierarchy's node.ancestors() to simplify breadcrumb ([c87a24](https://github.com/techniq/svelte-ux/commit/c87a24713d36d9c9d8d20b8aa02f75ecd47aea57))
- Add value to breadcrumb ([0ca251](https://github.com/techniq/svelte-ux/commit/0ca251adf7552a3d3e772836da5dd41b1db92061))
- Only allow selecting nodes with children ([513829](https://github.com/techniq/svelte-ux/commit/5138298a976c0692565f385bde27ae9f63d4634a))
- Simplify using RectClipPath/CircleClipPath by appling clip to children ([7a2b43](https://github.com/techniq/svelte-ux/commit/7a2b430e7a367d9455930d8bbaf49a1ff4cb8b1a))
- Add function comment ([1f6f39](https://github.com/techniq/svelte-ux/commit/1f6f39c49e91664f97b8d9589552e48a0f3e625f))
- [Treemap] Manage selection externally and use to build breadcrumb ([e3d08a](https://github.com/techniq/svelte-ux/commit/e3d08aabdbd629905b1712b42fba1ec8709e9d56))
- Treemap WIP ([ff345d](https://github.com/techniq/svelte-ux/commit/ff345d1dd20ea8a48d75e28a25cfe5f5db335bec))
- Add ClipPath components ([85100c](https://github.com/techniq/svelte-ux/commit/85100cec999d7bf75fb839f1f3761cd82e26777a))
- Rename size property to value ([3870e5](https://github.com/techniq/svelte-ux/commit/3870e526e5292b920b64782e0e146e860e243be5))
- [Rect] Default x/y to 0 to remove console errors when not used (width/height only required) ([ff0fde](https://github.com/techniq/svelte-ux/commit/ff0fdeb0809e4e93088d775d3e5dd4abd6e1499c))
- Remove console.log ([ca9a91](https://github.com/techniq/svelte-ux/commit/ca9a91123415e593c9b45b2382534d3c85251a28))
- [Sankey] Add color by option to example ([bb229e](https://github.com/techniq/svelte-ux/commit/bb229e844074f703e32979a4c5e4bf7a03610684))
- Update Sankey examples to use Group for Rect/Text transitions. Use @const to remove redundancy. Remove unnecessary imports. Issue ([879b15](https://github.com/techniq/svelte-ux/commit/879b1594fc5207768ef1f6ea584db362a5823234))
- [Group] Support tweened/spring props to animate x/y changes ([24fa31](https://github.com/techniq/svelte-ux/commit/24fa3154f5b96e5f457526d8e721388c44f7e3dd))
- Switch from static to vercel adapter in attempt to fix SSR initial page views ([184b68](https://github.com/techniq/svelte-ux/commit/184b687d3ab18b59b387fe85816edc12fc290188))
- Improve Sankey highlight example and add simpleData hierarchy example ([cc344c](https://github.com/techniq/svelte-ux/commit/cc344c3f688e837fcb5172ee3a2beb5177729773))
- Add graphFromCsv() util ([b9d0ca](https://github.com/techniq/svelte-ux/commit/b9d0ca99936fdde504d0dbbdc952dcaf137b1ad9))
- Rename getMotionStore() to createMotionStore() ([5cd795](https://github.com/techniq/svelte-ux/commit/5cd795e37eaa522cd3c40733a394de93ce010cef))
- Add Sankey / Link components and examples ([977406](https://github.com/techniq/svelte-ux/commit/977406bf71b75f0dd0fcda879b8c0e4f5e591860))

## 0.2.3

### Commits

- Add 2px white stroke by default to Axis and Labels (can be overridden) ([ce9587](https://github.com/techniq/svelte-ux/commit/ce9587c890922f072b6e21484e66ac4519962416))

## 0.2.2

### Commits

## 0.2.1

### Commits

- [Text] Add `paint-order: stroke` to easily support outlines ([a2a28c](https://github.com/techniq/svelte-ux/commit/a2a28c84ab385fde90f6f26e9cb226aac71eb51f))
- [Points / ConnectedPoints] Center within band scale by default (set offsetY). Resolves #18 ([5a9e8d](https://github.com/techniq/svelte-ux/commit/5a9e8df41f46b249bd79474bc760c8b232f55a65))

## 0.2.0

### Commits

- Upgrade LayerCake and remaining dependencies ([553978](https://github.com/techniq/svelte-ux/commit/5539782e44ef9e33d61ec1220075ea97db07ddb2))
- Fix location of hooks.ts ([f03d97](https://github.com/techniq/svelte-ux/commit/f03d97c5c9fbacc17752ac3c79d6aff247c4a4c1))
- Upgrade SvelteKit and non-major semver dependencies ([af5d27](https://github.com/techniq/svelte-ux/commit/af5d2725de106feb51f64fbbbc4d48aa57c901dd))
- Add comment about why offsetY is set. Issue #18 ([ec2250](https://github.com/techniq/svelte-ux/commit/ec22507cdafbe93baa6ecaa636bd76e6d6037be0))
- Move chart examples to top of menu ([bc0a76](https://github.com/techniq/svelte-ux/commit/bc0a76ce221c84c645f5cdb3c8476766afc7fb7a))
- [Pattern] Add diagonal grid example ([d72396](https://github.com/techniq/svelte-ux/commit/d72396456464629b8de6cbd0448e7038bb89fa5a))
- Add Pattern component ([60ec74](https://github.com/techniq/svelte-ux/commit/60ec746752c01cd86b87df0188d4e1009605a474))
- [LinearGradient] Tighten up preview heights ([78b99d](https://github.com/techniq/svelte-ux/commit/78b99d7d66802c0d7a082953dde89e80088955f1))
- [Path] Simplify curve names in docs ([88d774](https://github.com/techniq/svelte-ux/commit/88d7749d9f007e4d37419a6d1bb6bff438fea62d))
- Add api docs. Issue #6 ([fde315](https://github.com/techniq/svelte-ux/commit/fde31567b8bef47d87b777beb1ae3d9eb9f6d3a5))
- [Arc/Pie] Add offset (explode) and allow declaring arcs directly in Pie default slot ([d48743](https://github.com/techniq/svelte-ux/commit/d48743d4f8c90f971d9791ff9eb2e1453aa92132))
- Add TODO ([ae115b](https://github.com/techniq/svelte-ux/commit/ae115b313eb94d853cf923f15d6111f5c7b2d2aa))
- Update TODOs ([759e8f](https://github.com/techniq/svelte-ux/commit/759e8f2ff08c439e031f3a0223ba85ad356e5c10))
- [Arc] Support innerRadius as percent or offset of outerRadius ([1e3745](https://github.com/techniq/svelte-ux/commit/1e3745db62ecedf6dd80f3cd6fbb5c5869fc2c5a))
- Use tailwind fill/stroke color classes ([932b51](https://github.com/techniq/svelte-ux/commit/932b518f6b900c3227fa8d8ade9020337b751288))
- [Scatter] Improve labels example align ([8f0098](https://github.com/techniq/svelte-ux/commit/8f00981b3e0e55a9f5d3b6a8ee5e79da75a64990))
- Add tailwind typography plugin ([176a98](https://github.com/techniq/svelte-ux/commit/176a98810ae3c149d8646d20fc322946425fed86))
- [LinearGradient] Add docs and simplify usage with tailwind gradient colors (except via) ([af0048](https://github.com/techniq/svelte-ux/commit/af004830f8b3594a4ca416bfbee5200688990736))
- Fix indention ([e6b997](https://github.com/techniq/svelte-ux/commit/e6b997c68fed9bf24c7e32f252b375cc6fc45a95))
- Update dependencies ([7304bd](https://github.com/techniq/svelte-ux/commit/7304bda822b8c3033d4384696bd5e61fda1a7c30))
- [Pie] Support tweened / spring to animate ([35b9dd](https://github.com/techniq/svelte-ux/commit/35b9ddf31c38e7dbbe984b21957cc08b4d5196a5))
- Add Pie example ([f3dd10](https://github.com/techniq/svelte-ux/commit/f3dd101399e460bba54334a46f7d13f697bd3a5c))
- Add LinearGradient docs placeholder ([32b6c1](https://github.com/techniq/svelte-ux/commit/32b6c17aaffb768f13c30d23790ae7eb3134df69))
- [Group] Fix types ([81f1ff](https://github.com/techniq/svelte-ux/commit/81f1ff6e5a2c860cfdb3575869c091f4a057966d))
- Fix `Missing "./package.json" export in "d3-scale" package` by adding all used d3 packages to svelte.config.js vite.optimizeDeps.include ([c8d527](https://github.com/techniq/svelte-ux/commit/c8d52729def966773d883e9b95dc0ad0893e4d42))

## 0.1.0

### Commits

- Upgrade SvelteKit/Vite and svelte-ux ([5e8b5a](https://github.com/techniq/svelte-ux/commit/5e8b5a1436ebdd684738bf2624e121269cb9346c))

## 0.0.9

### Commits

- Update dependencies ([351240](https://github.com/techniq/svelte-ux/commit/35124013a5ba159593826ef7ece1d834cddd11c4))

## 0.0.8

### Commits

- Attempt to fix SSR error `ERR_UNSUPPORTED_DIR_IMPORT` after upgrading Vite to 2.7 ([277dde](https://github.com/techniq/svelte-ux/commit/277dde94a80628974609116183f2a9d941342d2c))

## 0.0.7

### Commits

- Update AreaStack and Bars to pass tweened/spring to underlying Path/Area/Rect ([e98cef](https://github.com/techniq/svelte-ux/commit/e98cef885f7240be21cc7924f5f6ab92c553e7fe))

## 0.0.6

### Commits

- Update top-level exports ([0d4f9b](https://github.com/techniq/svelte-ux/commit/0d4f9b28c9670c03831d19aa3f7d45fb974245ee))

## 0.0.5

### Commits

- [Area] Support tweened path and add example docs ([560d00](https://github.com/techniq/svelte-ux/commit/560d00498f9cb8c4418acb0d16bc9c812fbda7fc))
- [Path] Consolidate examples (add tweened playground option) ([50f509](https://github.com/techniq/svelte-ux/commit/50f5098a0c945d8b42257aec68aaa06c7927ca07))
- Add TODO ([61060f](https://github.com/techniq/svelte-ux/commit/61060f8ddd6132c975bb7b331da697249d07ce17))
- [Arc] Use LinearGradient on examples. Allow track to be configurable via prop (including enabled/disabled). Issue #4 ([39d5c1](https://github.com/techniq/svelte-ux/commit/39d5c1804ba5f56ad8cd2820d2328c2b88b86b4d))
- Add LinearGradient component. Closes #4 ([a32821](https://github.com/techniq/svelte-ux/commit/a328211a9d354959ed7b92f059a11785998a2e6d))
- Rename HighlightBar to HighlightRect ([b42579](https://github.com/techniq/svelte-ux/commit/b42579941b4e56da94b9279f3ebf3cbf5983d400))
- Rename Bar to Bars ([903b33](https://github.com/techniq/svelte-ux/commit/903b337a1583baff6f5a958a00fbad50c018e4df))
- Rename Label to Labels ([1392ac](https://github.com/techniq/svelte-ux/commit/1392ac1087e40d15cdaf057e0d7cab5f8d069dd5))
- [Arc] Use key to remount when changing spring until store can be recreated reactively ([cda983](https://github.com/techniq/svelte-ux/commit/cda9834478489c42381929e4dcde4dc16e80a072))
- [Arc] Simplify further ([8ea82b](https://github.com/techniq/svelte-ux/commit/8ea82bbe15cb2093633edbd95b0558fb700aee11))
- Add Group component for easy placement / center ([1c9c38](https://github.com/techniq/svelte-ux/commit/1c9c38ffc31605b74a508ee26ea52a26d018890b))
- [Arc] Add padAngle support ([4ec57e](https://github.com/techniq/svelte-ux/commit/4ec57e93aa951140e862b206ba52cfe860925aed))
- Reduce max number of point counts allowed ([6a3e02](https://github.com/techniq/svelte-ux/commit/6a3e028d6dbf7bd70c4ae376ebc9cce95197bf6b))
- Add Arc component WIP ([8627f9](https://github.com/techniq/svelte-ux/commit/8627f9938aaa564f75e41966f07fc124887e6636))
- [Path] Remove curve variants ending in "Open" and "Closed", add next/prev to point count, rename label, and improve label ([330b2d](https://github.com/techniq/svelte-ux/commit/330b2d28841a2a567673fe0372d9d63ee343eb36))
- [Path] Support tweened prop. Resolves #2 ([72e0ad](https://github.com/techniq/svelte-ux/commit/72e0ad46bc50d6209eaf2b0f02bac1b500679a3a))
- [Path] Improve selection of easings and curves ([96a94a](https://github.com/techniq/svelte-ux/commit/96a94aeba388bd0682001e512203b252e6c4a148))
- [motionStore] Update options to allow passing spring or tweened optionally ([77dea8](https://github.com/techniq/svelte-ux/commit/77dea8034244251696703d877e156dc6f9ed157a))
- [Path] Add docs example ([a430de](https://github.com/techniq/svelte-ux/commit/a430debd691157bdd86b8b6ab8cbbf7e6fcf0ee6))
- [Path] Change default color to black and update path data if curve or defined change ([2d2cd3](https://github.com/techniq/svelte-ux/commit/2d2cd3dbf45dc58abe350bd65ba81c6ac3354d8f))
- Add getEasingPath() util ([12e7d9](https://github.com/techniq/svelte-ux/commit/12e7d92b67d87e493b4ccd1c4337c715490a0cbc))
- [createStackData] Only group if groupBy specified, fixing support for separated stack offset as it needs the full data set (not by group) ([e39e47](https://github.com/techniq/svelte-ux/commit/e39e475ae2858a583e85eb300307f38a6c357344))
- Update README ([d0d59c](https://github.com/techniq/svelte-ux/commit/d0d59c1449f922c523215cafffef344972a99b74))
- Stub out most pages ([4f917a](https://github.com/techniq/svelte-ux/commit/4f917ab559b574d48149046b9ff38d6b0b4312a0))
- Support passing props to AxisX/Y gridlines ([434d1a](https://github.com/techniq/svelte-ux/commit/434d1a70a6e7737f08f4ec033afb2bda56ca9569))
- Update TODO ([63509a](https://github.com/techniq/svelte-ux/commit/63509a3e4faf29de1814141a1bde571f784030db))
- Add ConnectedPoints and use to replace ClevelandDotPlot with Points/ConnectedPoints combination. ([70c5a5](https://github.com/techniq/svelte-ux/commit/70c5a5a79af222127a564b6b9acbbcaf213a10f0))
- [Points] Support multiple per axis (ex. x={"prop1", "prop2"]). Pass context to function offsets for access to scales ([fd7f42](https://github.com/techniq/svelte-ux/commit/fd7f42d2e23dddf7f4e05b251fcd9764b1da34e6))
- Fix Threshold title ([5210e5](https://github.com/techniq/svelte-ux/commit/5210e5e163b9d71fcd660bf2bc2251fbeef56560))
- Rename Scatter to Points and use Circle (for animated layout). Add simple Scatter examples ([5f0e09](https://github.com/techniq/svelte-ux/commit/5f0e09aade84dade76f15b38cece44c7a77efc4c))
- Add TODO to update stackOffsetSeparated() to work with createStackData() ([b41240](https://github.com/techniq/svelte-ux/commit/b4124067e85a1698de6a9efe0a25bbdccfb84889))
- Support passing offset to createStackData. Add stacked expand/percent example ([ee4dc0](https://github.com/techniq/svelte-ux/commit/ee4dc0d9db3b710f0533a5ad73991782069704ca))
- Move all Bar-based examples under Bar ([d2421e](https://github.com/techniq/svelte-ux/commit/d2421e413933cb042521f04ecaa34d879024e6b0))
- Rename variable to reduce confusion / be more consistent ([5f6cdf](https://github.com/techniq/svelte-ux/commit/5f6cdf570e445e9f982c70ea30da226f7cb9ce65))
- Set extents on multiple bar chart example ([c9e4f9](https://github.com/techniq/svelte-ux/commit/c9e4f9613234f0409e4fdde9c3c215ee43cdd151))
- [Bar] Support using multiple per chart by allowing x/y overrides per instance ([14e0e5](https://github.com/techniq/svelte-ux/commit/14e0e5e159ddc02f857eb45b29baf2c2a10dc4a3))
- Add TODO ([8d0cb5](https://github.com/techniq/svelte-ux/commit/8d0cb5561431c21d6522d90d8acb000cdd02056e))
- Extract createStackData() util ([3140ec](https://github.com/techniq/svelte-ux/commit/3140ecfd2f4e29d3a4dadedc4aeef4476076a75e))
- [Threshold] Support changing curve and use in examples ([83fddb](https://github.com/techniq/svelte-ux/commit/83fddb56f88364ae2e8f15750137c5b4d1b9aa46))
- Add BarGroup, BarStack, and BarGroupStack examples (WIP) ([fbfd67](https://github.com/techniq/svelte-ux/commit/fbfd67aeb9114e4df4018f3510febd509c6a52c6))
- Add pivot utils example ([6ceea3](https://github.com/techniq/svelte-ux/commit/6ceea31371bd721bf5550ae567f47f5c413c5bee))
- Fix pivotLonger with non d3-csv data ([7d2a53](https://github.com/techniq/svelte-ux/commit/7d2a536d2edc29662670f81e502756ae2251d394))
- Reorder import ([0042ae](https://github.com/techniq/svelte-ux/commit/0042ae0d754d47be14e656c2397484faabfa6558))
- Upgrade dependencies ([021567](https://github.com/techniq/svelte-ux/commit/021567a873360ca1b481bc8572a72546fb12e958))

## 0.0.4

### Commits

- Re-export layercake Svg and Html for convenience ([5c9328](https://github.com/techniq/svelte-ux/commit/5c93285660e997b359ab025447696e5dc8ad120d))

## 0.0.3

### Commits

- Add exports ([2c2ea6](https://github.com/techniq/svelte-ux/commit/2c2ea6ed282190373007c40a46522b7256f3c695))
- Install svelte2tsx ([7f83a4](https://github.com/techniq/svelte-ux/commit/7f83a49744848dbac124db2bd32934181e291b30))

## 0.0.2

### Commits

- Add `npm run publish` ([cd0295](https://github.com/techniq/svelte-ux/commit/cd02953d8dad5cbcd243adeaa48c8bf911656257))
- Add AreaStack example ([cad054](https://github.com/techniq/svelte-ux/commit/cad054fae40d448ea600399442620d58d2e54ff6))
- Add AreaChart ([a38007](https://github.com/techniq/svelte-ux/commit/a3800749b3cdce9e0f27e1560e1a7dafbf2c6820))
- Rename fields to keys ([2142b9](https://github.com/techniq/svelte-ux/commit/2142b950cc2ddb763367620e629caad9d57a4907))
- Update genData to support customizable fields ([0a3767](https://github.com/techniq/svelte-ux/commit/0a37675babd9fc323669c5b8e9ebe7927dd77389))
- Fix indention ([e9b3a3](https://github.com/techniq/svelte-ux/commit/e9b3a35efac6dbacd3d4116524e9af4323f54dc7))
- Add Threshold examples ([0ae75b](https://github.com/techniq/svelte-ux/commit/0ae75bda26285806dded066f5afcaaca22f48366))
- More high level documentations ([8cbdcf](https://github.com/techniq/svelte-ux/commit/8cbdcf04a06d5404e44ec379a334174eded515b0))
- Simplify examples ([7baf08](https://github.com/techniq/svelte-ux/commit/7baf08d5934a849644b1dd610c4fbd65cee8f506))
- Remove unused styles ([36a98f](https://github.com/techniq/svelte-ux/commit/36a98fc53a3561100aacab34c481e60adb27d5ae))
- Convert index route to Markdown ([7bce36](https://github.com/techniq/svelte-ux/commit/7bce36d3f1de5355f97dbee9bda1d0a576e47bcb))
- Add ClevelandDotPlot WIP ([9e626b](https://github.com/techniq/svelte-ux/commit/9e626bff654d47d2bfbe9fd3bbf020ec310206a0))
- Remove lodash isFunction usage ([384bae](https://github.com/techniq/svelte-ux/commit/384bae134d79edaaaefa16f9b559dca882ecddd8))
- Upgrade dependencies ([632751](https://github.com/techniq/svelte-ux/commit/632751c51cd7cf7fac729f4fda985689d3e26023))
- Add label examples ([7a0372](https://github.com/techniq/svelte-ux/commit/7a0372110621c92e87c3fb3ed01c69c7a4f1a9f9))
- Fix whitespace and add jsdoc for xBaseline/yBaseline ([be96bd](https://github.com/techniq/svelte-ux/commit/be96bd895c13d05df0ce6f1bf981aa2e35169167))
- Refine chart example padding ([83a733](https://github.com/techniq/svelte-ux/commit/83a73352396146ee588a54ef964823abec6f04f5))
- Extract createDateSeries() util ([f288a5](https://github.com/techniq/svelte-ux/commit/f288a5cbfec8c43f4b098641961d03db0269c72a))
- Fix code previews. Use frontmatter for AppBar ([98ac12](https://github.com/techniq/svelte-ux/commit/98ac128d0a4c67db313d8abd8c068e9a4cd49da3))
- Add prism theme ([c2b2c2](https://github.com/techniq/svelte-ux/commit/c2b2c21ee678ecaa6ef6dbf05cdae95e411a9c7b))
- Add .md extensions to Tailwind processing ([361c5e](https://github.com/techniq/svelte-ux/commit/361c5e62b401e6f1cc8e3c908cf6bec548897d86))
- Upgardde Text.svelte route ([392441](https://github.com/techniq/svelte-ux/commit/392441d89de66e047913247698d4756036be07a4))
- Fix AreaChart app bar ([b557d9](https://github.com/techniq/svelte-ux/commit/b557d919fde56a700374b67ef1ffe073be3499e9))
- Add AreaChart example ([de99fe](https://github.com/techniq/svelte-ux/commit/de99fe376bec0ddc9643c6b9a4f0d1d145325027))
- Add more components. Begin setting up mdsvex ([8047ce](https://github.com/techniq/svelte-ux/commit/8047ce3ef9b35abc96ad77f82c92ce243739adfb))
- Add initial components and utils ([c6d795](https://github.com/techniq/svelte-ux/commit/c6d795bc3bb36c8d2539b6545c029078ab9ac462))
- Upgrade SvelteKit. Setup svelte-ux and tailwind ([c41b98](https://github.com/techniq/svelte-ux/commit/c41b9819eeecbc1f1064677cda71877a5f572ed5))
- Initial commit ([c0e8e9](https://github.com/techniq/svelte-ux/commit/c0e8e93a7c31d2804c1e91bfc233829c44c5d538))
