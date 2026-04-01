---
title: 'layerchart@0.93.4'
tag: 'layerchart@0.93.4'
date: '2025-02-04T17:08:41Z'
url: 'https://github.com/techniq/layerchart/releases/tag/layerchart%400.93.4'
draft: false
prerelease: false
author: 'github-actions[bot]'
---

### Patch Changes

- fix(AreaChart|LineChart|ScatterChart): Clip `belowMarks`, `aboveMarks`, `highlight`, `labels`, and `points` slots when brushed/zoomed ([`883d1d3`](https://github.com/techniq/layerchart/commit/883d1d374e057cfd270da7a59ba5d4115c4719e4))

- feat: Add `renderCircle` to simplify rendering circles to canvas (instead of using `renderPath`) ([`c728af0`](https://github.com/techniq/layerchart/commit/c728af0ef1cb96717b570391af961797646400c2))

- feat(Canvas): Add Logger integration ([`d88ee43`](https://github.com/techniq/layerchart/commit/d88ee43b8e36042d5f4a00c5b858388a1139a58e))

- fix: Update `rgbColorGenerator` and `getColorStr` to support alpha channel (rgba) ([`796f029`](https://github.com/techniq/layerchart/commit/796f0294dfea40da25029a670ecef0d288036936))

- fix(canvas render): Always paint fill when explicitly defined (`rgb(0,0,0)` would match the default computedStyles color and be ignored) ([`9d3ba48`](https://github.com/techniq/layerchart/commit/9d3ba48eea4eda6e83888050323dcc4b87a34a7b))
