---
title: "layerchart@0.76.0"
tag: "layerchart@0.76.0"
date: "2025-01-24T17:43:15Z"
url: "https://github.com/techniq/layerchart/releases/tag/layerchart%400.76.0"
draft: false
prerelease: false
author: "github-actions[bot]"
---
### Minor Changes

-   feat(TooltipContext): Support lockable tooltips, useful for interactive elements / dense data. Control using `<Chart tooltip={{ locked }}>` ([#333](https://github.com/techniq/layerchart/pull/333))

-   feat(Tooltip): Support passing `pointerEvents` to enable clickable tooltip content. Useful with locked tooltips ([#333](https://github.com/techniq/layerchart/pull/333))

-   feat(TooltipHeader): Support passing `value` and `format` (similar to TooltipItem) to simplify overrides from simplified charts ([#335](https://github.com/techniq/layerchart/pull/335))

-   feat(AreaChart|BarChart|LineChart|ScatterChart): Enabling passing `props={{ tooltip: { header: { format: ... } } }}` ([#335](https://github.com/techniq/layerchart/pull/335))

-   feat(BarChart): Add `<BarChart props={{ tooltip: { hideTotal: true } }}>` to hide total (useful for some group series use cases) ([#335](https://github.com/techniq/layerchart/pull/335))

### Patch Changes

-   fix: Retain default tooltip context props (ex. `mode`, `onClick`) when passing additional props to simplified charts (ex. `<AreaChart tooltip={{ locked }}>`) ([#333](https://github.com/techniq/layerchart/pull/333))
