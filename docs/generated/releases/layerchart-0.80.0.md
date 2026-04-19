---
title: 'layerchart@0.80.0'
tag: 'layerchart@0.80.0'
date: '2025-01-27T18:53:23Z'
url: 'https://github.com/techniq/layerchart/releases/tag/layerchart%400.80.0'
draft: false
prerelease: false
author: 'github-actions[bot]'
---

### Minor Changes

- feat(AreaChart|LineChart|ScatterChart): Add Brush integration ([#348](https://github.com/techniq/layerchart/pull/348))

- feat(ChartClipPath|CircleClipPath|RectClipPath): Support passing `disabled` to underlying `ClipPath` ([#348](https://github.com/techniq/layerchart/pull/348))

- feat: Support passing `props={{ tooltip: { context: ... } }}` for all simplified charts (still support `tooltip={...}`) ([#348](https://github.com/techniq/layerchart/pull/348))

### Patch Changes

- fix: Restore ability to pass `tooltip={false}` to disable tooltip for all simplified charts ([#348](https://github.com/techniq/layerchart/pull/348))

- fix(AreaChart|LineChart): Fade other series highlight points when hovering individual point ([#348](https://github.com/techniq/layerchart/pull/348))
