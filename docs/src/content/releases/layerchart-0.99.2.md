---
title: 'layerchart@0.99.2'
tag: 'layerchart@0.99.2'
date: '2025-02-19T13:57:21Z'
url: 'https://github.com/techniq/layerchart/releases/tag/layerchart%400.99.2'
draft: false
prerelease: false
author: 'github-actions[bot]'
---

### Patch Changes

- fix(TooltipContext): Call `hideTooltip()` for all tooltip modes on `pointerleave` to fix `band` (BarChart) and `voronoi` (ScatterPlot) modes not always closing on chart pointerleave due to recent chart delay / tooltip hover changes ([`e9f5e8c`](https://github.com/techniq/layerchart/commit/e9f5e8c3e80f5fb4f8c4dbd8e977a840187555c9))
