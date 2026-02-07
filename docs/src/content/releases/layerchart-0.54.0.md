---
title: 'layerchart@0.54.0'
tag: 'layerchart@0.54.0'
date: '2024-10-16T04:17:41Z'
url: 'https://github.com/techniq/layerchart/releases/tag/layerchart%400.54.0'
draft: false
prerelease: false
author: 'github-actions[bot]'
---

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

- fix(Chart): Fix types when passing readonly string\[] color ranges (i.e. d3-scale-chromatic schemes) ([#252](https://github.com/techniq/layerchart/pull/252))

- fix(Axis): Middle align 12 o'clock (0/360deg) tick label ([#252](https://github.com/techniq/layerchart/pull/252))

- fix(Axis): Respect `tickLength` when positioning tick label/text ([#252](https://github.com/techniq/layerchart/pull/252))

- fix(Simplified charts): Use color scale for Legend when using single (default) series ([#252](https://github.com/techniq/layerchart/pull/252))

- fix(TransformContext): Only disable touchmove default (i.e. scrolling) when enabled (canvas/manual) and pointer events are not disabled ([#252](https://github.com/techniq/layerchart/pull/252))

- docs: Copy `Date` data as `new Date(...)` to clipboard ([#253](https://github.com/techniq/layerchart/pull/253))

- docs: Stringify example data to clipboard on demand ([#253](https://github.com/techniq/layerchart/pull/253))

- docs(PieChart): Add examples for using d3-scale-chromatic schemes and interpolators ([#252](https://github.com/techniq/layerchart/pull/252))
