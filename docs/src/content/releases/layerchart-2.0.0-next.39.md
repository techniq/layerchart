---
title: 'layerchart@2.0.0-next.39'
tag: 'layerchart@2.0.0-next.39'
date: '2025-09-25T11:16:58Z'
url: 'https://github.com/techniq/layerchart/releases/tag/layerchart%402.0.0-next.39'
draft: false
prerelease: true
author: 'github-actions[bot]'
---

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

- refactor: Remove use of `layerClass` and apply `lc-{name}` class directly to allow easy component `<style>` targetting within LayerChart ([#557](https://github.com/techniq/layerchart/pull/557))
