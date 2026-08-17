---
title: "layerchart@2.1.1"
tag: "layerchart@2.1.1"
date: "2026-08-11T03:50:14Z"
url: "https://github.com/techniq/layerchart/releases/tag/layerchart%402.1.1"
draft: false
prerelease: false
author: "github-actions[bot]"
---
### Patch Changes

- fix(Spline): Only tween path data when `motion` is set (~20x less memory growth while streaming, issue #585) ([#896](https://github.com/techniq/layerchart/pull/896))

- perf(Chart): Remove quadratic domain recalculation on mount for series-based charts ([#896](https://github.com/techniq/layerchart/pull/896))

- perf: Memoize props in component state classes (~3x faster `<Rect>` mount in benchmarks) ([#896](https://github.com/techniq/layerchart/pull/896))

- perf(Chart): Resolve stacked value domain in a single pass ([#896](https://github.com/techniq/layerchart/pull/896))