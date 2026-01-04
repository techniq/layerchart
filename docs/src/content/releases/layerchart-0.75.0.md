---
title: "layerchart@0.75.0"
tag: "layerchart@0.75.0"
date: "2025-01-24T12:36:54Z"
url: "https://github.com/techniq/layerchart/releases/tag/layerchart%400.75.0"
draft: false
prerelease: false
author: "github-actions[bot]"
---
### Minor Changes

-   feat(AreaChart|BarChart|LineChart|PieChart|ScatterChart): Add Legend integration (highlight & filter) ([#329](https://github.com/techniq/layerchart/pull/329))

-   feat(AreaChart|LineChart): Highlight series (desaturating other series) while hovering over point on series ([#329](https://github.com/techniq/layerchart/pull/329))

-   feat(Highlight): Add `onPointEnter` and `onPointLeave` event callbacks ([#329](https://github.com/techniq/layerchart/pull/329))

-   feat(Legend): Add `onPointerEnter` and `onPointerLeave` event callbacks ([#329](https://github.com/techniq/layerchart/pull/329))

-   feat(Legend): Support `classes.item(item)` ([#329](https://github.com/techniq/layerchart/pull/329))

-   feat: Add `profile` prop to all simplified charts to log initial render performance using `console.time` ([#330](https://github.com/techniq/layerchart/pull/330))

### Patch Changes

-   docs: Add performance examples for different data structures (for further investigation) ([#330](https://github.com/techniq/layerchart/pull/330))

-   fix(Area|Spline): Reactively recreate internally x/y accessors when props/context change. Fixes AreaChart legend filter support ([#329](https://github.com/techniq/layerchart/pull/329))

-   fix(Legend): Add `z-index: 1` to stack above tooltip contexts (band rects, voronoi) to allow pointer events (click/hover) ([#329](https://github.com/techniq/layerchart/pull/329))
