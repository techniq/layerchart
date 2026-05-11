---
title: "layerchart@2.0.0-next.63"
tag: "layerchart@2.0.0-next.63"
date: "2026-05-09T15:37:42Z"
url: "https://github.com/techniq/layerchart/releases/tag/layerchart%402.0.0-next.63"
draft: false
prerelease: true
author: "github-actions[bot]"
---
### Minor Changes

-   feat(Dodge): Add Dodge component for deterministic non-overlapping layout ([#862](https://github.com/techniq/layerchart/pull/862))

-   feat(Waffle): Add Waffle component for countable-cell visualizations ([#864](https://github.com/techniq/layerchart/pull/864))

-   feat(Pattern): Add `rects` shape definition for tile patterns for rendering one or more rectangles per pattern tile ([#864](https://github.com/techniq/layerchart/pull/864))

-   feat(Text): Add `fontSize` prop with auto-derived `capHeight` ([#862](https://github.com/techniq/layerchart/pull/862))

### Patch Changes

-   fix(Chart): Don't compute `[undefined, undefined]` domain when `series` is metadata-only ([#449](https://github.com/techniq/layerchart/pull/449))

-   fix(canvas): Resolve `currentColor` for `fill`/`stroke` (and other style props) ([#449](https://github.com/techniq/layerchart/pull/449))

-   fix(Pattern): fix alignment and sharply render on high-DPI displays when using Canvas layers ([#864](https://github.com/techniq/layerchart/pull/864))

-   fix(downloadImage / getChartImageBlob): Fix image download (container sizing and text clipping) ([#449](https://github.com/techniq/layerchart/pull/449))

-   fix(Spline): Allow CSS class `opacity` to fade lines on the Canvas layer. `Spline` was always passing `opacity={1}` to the underlying `Path` when no series fade was active, which became `constantStyles.opacity = 1` in the canvas renderer and shadowed the value resolved from a user's `class` (e.g. `class="opacity-20"`). Now skip passing `opacity` when the computed series fade is the no-fade default, so the class can take effect — matching SVG behavior where CSS class rules override the presentation attribute. ([#449](https://github.com/techniq/layerchart/pull/449))

-   fix(Image): Stop disabling pointer events by default ([#862](https://github.com/techniq/layerchart/pull/862))

-   fix(Circle, Text): Inherit chart accessors by default in data mode ([#862](https://github.com/techniq/layerchart/pull/862))

-   fix(Rect): Support non-uniform `corners` in data/edge mode ([#449](https://github.com/techniq/layerchart/pull/449))
