---
title: "layerchart@2.0.0-next.31"
tag: "layerchart@2.0.0-next.31"
date: "2025-07-20T03:09:00Z"
url: "https://github.com/techniq/layerchart/releases/tag/layerchart%402.0.0-next.31"
draft: false
prerelease: true
author: "github-actions[bot]"
---
### Minor Changes

-   feat(Chart): Add `xInterval` / `yInterval` for time scales usage with bar charts ([#562](https://github.com/techniq/layerchart/pull/562))

-   feat(BarChart): Support time scale with `xInterval` / `yInterval` props ([#562](https://github.com/techniq/layerchart/pull/562))

-   feat(TooltipContext): Support `band` mode with time scale (similar to band scale) ([#562](https://github.com/techniq/layerchart/pull/562))

-   feat(ForceSimulation): Added `onNodesChange` callback to `ForceSimulation` ([#607](https://github.com/techniq/layerchart/pull/607))

### Patch Changes

-   fix(Bar): Clamp radius to width/height to not cause artifacts with small values (including `0`) when rounding a single edge. Fixes #383 ([#610](https://github.com/techniq/layerchart/pull/610))

-   fix(Highlight): Properly handle area highlights with y-axis time scales ([#562](https://github.com/techniq/layerchart/pull/562))
