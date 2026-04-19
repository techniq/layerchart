---
title: "layerchart@2.0.0-next.45"
tag: "layerchart@2.0.0-next.45"
date: "2026-02-18T15:50:33Z"
url: "https://github.com/techniq/layerchart/releases/tag/layerchart%402.0.0-next.45"
draft: false
prerelease: true
author: "github-actions[bot]"
---
### Major Changes

-   feat: New docs site ([#449](https://github.com/techniq/layerchart/pull/449))

### Minor Changes

-   breaking: Extract `Path` primitive component from `Spline` for better separation of concerns ([#659](https://github.com/techniq/layerchart/pull/659))

-   breaking: Rename simplified charts `renderContext` prop to `layer` ([#659](https://github.com/techniq/layerchart/pull/659))

-   breaking: Change `defaultChartPadding(axis, legend)` to `defaultChartPadding({ axis, legend })` and support overrides (ex. `defaultChartPadding({ left: 50 })`) ([#659](https://github.com/techniq/layerchart/pull/659))

### Patch Changes

-   feat(Chart): Support passing explicit `width` and `height` instead of requiring parent dimensions ([#659](https://github.com/techniq/layerchart/pull/659))

-   feat: Support global settings (layer type, debug, etc) ([#659](https://github.com/techniq/layerchart/pull/659))

-   feat(Layer): Allow `type` to be optional, fallbacking back to `settings.layer` type ([#659](https://github.com/techniq/layerchart/pull/659))

-   feat(Chart|Svg|Html): Support passing `clip` prop to hide overflown content ([#659](https://github.com/techniq/layerchart/pull/659))

-   feat(Circle|Rect): Support passing children snippet for Html layers ([#659](https://github.com/techniq/layerchart/pull/659))

-   feat(Layer): Support showing chart and full frame boundaries with `settings.debug` ([#659](https://github.com/techniq/layerchart/pull/659))

-   fix(Threshold): Properly clip `above` snippet (resolving 1/2 width clipping issues when using Spline) ([#659](https://github.com/techniq/layerchart/pull/659))

-   fix(AnnotationRange|TooltipContext|Highlight): Fix using interval scales with reversed data (ex. xReverse) ([#659](https://github.com/techniq/layerchart/pull/659))

-   fix(Canavs): Support `style` attribute ([#659](https://github.com/techniq/layerchart/pull/659))

-   fix(Canavs): Suppport dashed stroke (fix: #652) ([#659](https://github.com/techniq/layerchart/pull/659))

-   fix(Rect): Support rounded (rx/ry) in Canvas layers (fixes [#481](https://github.com/techniq/layerchart/issues/481)) ([#659](https://github.com/techniq/layerchart/pull/659))

-   fix(Bar): Fix browser lockup when switching between group and stack layouts ([#659](https://github.com/techniq/layerchart/pull/659))

-   fix(Bar): Fix bar rounding direction when using xReverse/yReverse with interval scales ([#659](https://github.com/techniq/layerchart/pull/659))

-   fix(Text): Support explicit "\\n" and set line-height (to match svg/canvas) for html layers ([#659](https://github.com/techniq/layerchart/pull/659))

-   feat(Chart): Support `class` prop ([#659](https://github.com/techniq/layerchart/pull/659))

-   refactor: Move contexts to separate `$lib/contexts` module ([#659](https://github.com/techniq/layerchart/pull/659))

-   refactor: Removed lodash-es dependency ([#659](https://github.com/techniq/layerchart/pull/659))
