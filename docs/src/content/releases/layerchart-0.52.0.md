---
title: "layerchart@0.52.0"
tag: "layerchart@0.52.0"
date: "2024-09-27T18:49:31Z"
url: "https://github.com/techniq/layerchart/releases/tag/layerchart%400.52.0"
draft: false
prerelease: false
author: "github-actions[bot]"
---
### Minor Changes

-   breaking: Only show `0` baseline by default instead of always drawing axis line for simplified charts (LineChart, etc) ([#248](https://github.com/techniq/layerchart/pull/248))

-   feat: Add `stackExpand` and `stackDiverging` series layouts for AreaChart and BarChart ([#248](https://github.com/techniq/layerchart/pull/248))

-   feat: Add legend support (prop and slot) to all simplified charts ([#248](https://github.com/techniq/layerchart/pull/248))

-   feat(Rule): Support radial charts (x/angle and y/radius) ([#248](https://github.com/techniq/layerchart/pull/248))

-   feat(Legend): Add `orientation` prop ([#248](https://github.com/techniq/layerchart/pull/248))

-   feat(Axis): Support passing `class` and `classes` (root/label) ([#248](https://github.com/techniq/layerchart/pull/248))

-   feat(Legend): Add `variant` prop with `ramp` (default) and `swatches` ([#248](https://github.com/techniq/layerchart/pull/248))

### Patch Changes

-   fix(BarChart): Fix `groupPadding` not exposed on $Props ([`c01a9f597037f9f812c49ceb41c8752438537532`](https://github.com/techniq/layerchart/commit/c01a9f597037f9f812c49ceb41c8752438537532))

-   fix: Remove use of `SvelteComponent` which is not compatible with Svelte 5 ([#248](https://github.com/techniq/layerchart/pull/248))

-   fix(PieChart): Pass series props to underlying Arcs ([#248](https://github.com/techniq/layerchart/pull/248))
