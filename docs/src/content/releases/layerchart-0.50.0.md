---
title: "layerchart@0.50.0"
tag: "layerchart@0.50.0"
date: "2024-09-23T12:48:55Z"
url: "https://github.com/techniq/layerchart/releases/tag/layerchart%400.50.0"
draft: false
prerelease: false
author: "github-actions[bot]"
---
### Minor Changes

-   feat: Add simplified charts to streamline creating common chart types with recommended conventions and granular extensibility (AreaChart, BarChart, LineChart, PieChart, and ScatterChart) ([#224](https://github.com/techniq/layerchart/pull/224))

-   feat(Svg): Add `center` to conveniently center children, useful for radial layouts without requiring `Group` wrapper ([#224](https://github.com/techniq/layerchart/pull/224))

-   refactor: Add `@layerstack/svelte-actions`, `@layerstack/svelte-stores`, `@layerstack/tailwind`, and `@layerstack/utils` packages and move `svelte-ux` package to `devDependancies` (components only for docs) ([#224](https://github.com/techniq/layerchart/pull/224))

-   breaking: Add new color `cScale` (and related `c` accessor, domain, range, etc) and replace `rScale` usage (which should be used for radius, etc) ([#224](https://github.com/techniq/layerchart/pull/224))

-   breaking(Tooltip): Rename Tooltip to Tooltip.Root ([#224](https://github.com/techniq/layerchart/pull/224))

-   breaking(Tooltip): Consolidate Tooltip components (TooltipItem, TooltipSeparator, etc) to Tooltip.Item, Tooltip.Separtor, etc ([#224](https://github.com/techniq/layerchart/pull/224))

-   breaking(Tooltip): Remove default grid on Tooltip.Root and add Tooltip.List as Tooltip.Item container ([#224](https://github.com/techniq/layerchart/pull/224))

-   breaking: Remove &lt;Tooltip.Root header={...}> and replace with &lt;Tooltip.Header> ([#224](https://github.com/techniq/layerchart/pull/224))

-   breaking(Chart): Default domain sorting to `false` (instead of LayerCake's `true`) to simplify bandScale use cases ([#224](https://github.com/techniq/layerchart/pull/224))

-   breaking: Remove `AreaStack` as use cases fully supported by `Area` ([#224](https://github.com/techniq/layerchart/pull/224))

-   breaking(Pie): Remove `placement` prop and instead rely Svg `center` or use `Group` for positioning ([#224](https://github.com/techniq/layerchart/pull/224))

-   breaking(Threshold): Simplify implementation and rename `pathAbove`/`pathBelow` slots to `above`/`below` ([#224](https://github.com/techniq/layerchart/pull/224))

-   breaking(Bar/Bars): Replace groupBy/groupPadding with Chart-level x1/y1 derived scales ([#224](https://github.com/techniq/layerchart/pull/224))

-   breaking: Rename `createStackData()` to `groupStackData()`, refine returned structure to simplify tooltips and make consistent with different options combinations, and add tests ([#224](https://github.com/techniq/layerchart/pull/224))

### Patch Changes

-   feat(Chart): Support x1/y1 derived scales, useful for grouped bar charts ([#224](https://github.com/techniq/layerchart/pull/224))

-   feat(tooltip): Update bisect-x mode to support radial coordinates ([#224](https://github.com/techniq/layerchart/pull/224))

-   feat(Tooltip.Item): Support `color` prop to add swatch, support theme colors and any color via `color="variable"` ([#224](https://github.com/techniq/layerchart/pull/224))

-   feat(Arc): Support passing `tooltip` and `data` props to simplify setting up tooltip pointer events ([#224](https://github.com/techniq/layerchart/pull/224))

-   feat(Points): Integrate with rScale ([#224](https://github.com/techniq/layerchart/pull/224))

-   feat(Bars): Support passing `data` override ([#224](https://github.com/techniq/layerchart/pull/224))

-   feat(Chart): Expose `config` as slot prop ([#224](https://github.com/techniq/layerchart/pull/224))

-   feat(Bar): Forward pointer events to enable individual bar tooltips ([#224](https://github.com/techniq/layerchart/pull/224))

-   feat(Voronoi): Support radial coordinates. Issue #112 ([#224](https://github.com/techniq/layerchart/pull/224))

-   feat(Points): Add `xValue` and `yValue` to each point, and improve types ([#224](https://github.com/techniq/layerchart/pull/224))

-   feat(Highlight): Support radial coordiantes for `points` and `lines`. Issue #112 ([#224](https://github.com/techniq/layerchart/pull/224))

-   feat(Labels): Support `center` placement (useful with Points) ([#224](https://github.com/techniq/layerchart/pull/224))

-   feat(Points): Add canvas support ([#224](https://github.com/techniq/layerchart/pull/224))

-   feat(Chart): Expose `x`/`y`/`z`/`r` accessors via slot props ([#224](https://github.com/techniq/layerchart/pull/224))

-   fix(Highlight): Handle non-zero y values when drawing lines (ex. radial line chart with inner radius) ([#224](https://github.com/techniq/layerchart/pull/224))

-   fix(Labels): Handle multiple x or y properties (stack, diverting) by leveraging Points component internally ([#224](https://github.com/techniq/layerchart/pull/224))

-   fix(Spline): Handle null data via defined by default ([#224](https://github.com/techniq/layerchart/pull/224))

-   fix(TooltipSeparator): Use theme color ([#224](https://github.com/techniq/layerchart/pull/224))

-   fix(Area): Handle null data via defined by default ([#224](https://github.com/techniq/layerchart/pull/224))

-   fix(Highlight): Handle null value points ([#224](https://github.com/techniq/layerchart/pull/224))

-   fix(Voronoi): Dispatch custom `pointerevent` instead of forwarding to fix console errors ([#224](https://github.com/techniq/layerchart/pull/224))

-   fix(Points): Remove incorrect points for null/undefined values ([#224](https://github.com/techniq/layerchart/pull/224))

-   fix(Area): Pass `x` override to internal Spline ([#224](https://github.com/techniq/layerchart/pull/224))

-   fix(Spline): Enable passing `fill` prop (useful for Bar with single rounded edge) ([#224](https://github.com/techniq/layerchart/pull/224))

-   fix(cartesianToPolar): Correctly calculate angle/radians between 0 and 2π ([#224](https://github.com/techniq/layerchart/pull/224))
