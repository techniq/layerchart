---
title: 'layerchart@2.0.0-next.25'
tag: 'layerchart@2.0.0-next.25'
date: '2025-06-23T14:29:41Z'
url: 'https://github.com/techniq/layerchart/releases/tag/layerchart%402.0.0-next.25'
draft: false
prerelease: true
author: 'github-actions[bot]'
---

### Patch Changes

- feat(TooltipContext): Support `quadtree-x` and `quadtree-y` modes. Resolves #525 ([#578](https://github.com/techniq/layerchart/pull/578))

- fix(AreaChart): Change default tooltip mode from `bisect-x` to `quadtree-x` (works with catagorical data and does not require data to be sorted) ([#578](https://github.com/techniq/layerchart/pull/578))

- fix(LineChart): Change default tooltip mode from `bisect-x` to `quadtree-x` (works with catagorical data and does not require data to be sorted) ([#578](https://github.com/techniq/layerchart/pull/578))

- fix(ScatterChart): Change default tooltip mode from `voronoi` to `quadtree` ([#578](https://github.com/techniq/layerchart/pull/578))

- fix: Support passing `<*Chart tooltip={...}>` to underlying TooltipContext (as types already indicate) ([#576](https://github.com/techniq/layerchart/pull/576))
