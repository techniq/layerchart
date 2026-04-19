---
title: 'layerchart@0.90.0'
tag: 'layerchart@0.90.0'
date: '2025-01-30T20:47:05Z'
url: 'https://github.com/techniq/layerchart/releases/tag/layerchart%400.90.0'
draft: false
prerelease: false
author: 'github-actions[bot]'
---

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

- fix(AreaChart|LineChart|Highlight): Support canvas pointer events, enabling series highlighting and click events when using \`renderContext="canvas" ([#354](https://github.com/techniq/layerchart/pull/354))

- fix(Canvas): Improve animation performance by only rendering hit canvas when `<canvas>` has active pointer over element ([#354](https://github.com/techniq/layerchart/pull/354))
