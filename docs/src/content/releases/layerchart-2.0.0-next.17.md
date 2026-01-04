---
title: "layerchart@2.0.0-next.17"
tag: "layerchart@2.0.0-next.17"
date: "2025-06-08T13:35:22Z"
url: "https://github.com/techniq/layerchart/releases/tag/layerchart%402.0.0-next.17"
draft: false
prerelease: true
author: "github-actions[bot]"
---
### Patch Changes

-   feat: Add Polygon primitive ([#533](https://github.com/techniq/layerchart/pull/533))

-   feat: Add Ellipse primitive ([#533](https://github.com/techniq/layerchart/pull/533))

-   feat(Spline): Add `value` to `startContent` and `endContent` snippets to easily access the `x` and `y` data values ([#537](https://github.com/techniq/layerchart/pull/537))

-   breaking(Spline): Rename `splineRef` to `pathRef` ([#549](https://github.com/techniq/layerchart/pull/549))

-   fix(GeoPath): Do not register with hit canavs unless pointer events (onclick, onpointermove, etc) or tooltipContext are defined ([#549](https://github.com/techniq/layerchart/pull/549))

-   fix(Treemap): Fix reactivity of props (tile, padding, etc) ([#516](https://github.com/techniq/layerchart/pull/516))

-   breaking(Treemap): Remove `selected` prop ([#516](https://github.com/techniq/layerchart/pull/516))

-   fix(Treemap): Add `maintainAspectRatio` (default: false) to opt into tiling function adjustment (primarily for zoom) ([#516](https://github.com/techniq/layerchart/pull/516))

-   fix(Treemap): Fix `padding*` prop types to support function or number constant ([#516](https://github.com/techniq/layerchart/pull/516))

-   feat(ForceSimulation): Refined `onstart`/`ontick`/`onend` events of `ForceSimulation` ([#547](https://github.com/techniq/layerchart/pull/547))

-   fix(ForceSimulation): Fixed a bug that would sometimes keep a simulation running, when its inputs change, even if `alpha < alphaMin` ([#546](https://github.com/techniq/layerchart/pull/546))

-   fix(TooltipList): Align label to top (start) instead of center by default ([#449](https://github.com/techniq/layerchart/pull/449))

-   breaking(Blur): Remove children snippet props (not needed and easier to support canvas in the future) ([#549](https://github.com/techniq/layerchart/pull/549))

-   fix(Calendar|MonthPath): Support canvas by using `Spline` instead of `path` ([#549](https://github.com/techniq/layerchart/pull/549))

-   docs: Document each component's context support (svg, canvas, html) with interactive toggle ([#549](https://github.com/techniq/layerchart/pull/549))
