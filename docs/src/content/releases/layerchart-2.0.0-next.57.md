---
title: "layerchart@2.0.0-next.57"
tag: "layerchart@2.0.0-next.57"
date: "2026-04-17T17:41:41Z"
url: "https://github.com/techniq/layerchart/releases/tag/layerchart%402.0.0-next.57"
draft: false
prerelease: true
author: "github-actions[bot]"
---
### Patch Changes

-   fix(AnnotationRange): Don't extend past chart bounds when `x` is omitted on band scales, and treat `null` on either side of `x`/`y` as "extend to chart edge". ([#449](https://github.com/techniq/layerchart/pull/449))

-   fix(Spline): Restore `series.props.opacity` (and other style props) precedence over the computed series fade opacity. Regression introduced by per-segment styling refactor where the explicit `opacity` was spread after `series.props`, clobbering per-series opacity values (e.g. `series={[{ props: { opacity: 0.1 } }, ...]}`). ([#449](https://github.com/techniq/layerchart/pull/449))

-   fix(ChartState): Don't filter explicit `x1Domain`/`y1Domain` by visible series when no series are configured. Restores grouped layout for composable `<Chart>` usage (e.g. `<Bars>` with `x1`/`x1Domain`/`x1Range`) where the visible-series filter previously emptied the secondary band scale domain, collapsing all bars to a single category position. ([#449](https://github.com/techniq/layerchart/pull/449))
