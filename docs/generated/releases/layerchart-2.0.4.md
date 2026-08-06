---
title: 'layerchart@2.0.4'
tag: 'layerchart@2.0.4'
date: '2026-07-31T00:27:33Z'
url: 'https://github.com/techniq/layerchart/releases/tag/layerchart%402.0.4'
draft: false
prerelease: false
author: 'github-actions[bot]'
---

### Patch Changes

- feat: Support Skeleton 5 (`skeleton-5.css`) ([#890](https://github.com/techniq/layerchart/pull/890))

- feat(skeleton): Resolve surface colors via `light-dark()` so the Skeleton presets follow `color-scheme` (`html.dark` toggle, or `prefers-color-scheme` when unpinned), and fix the surface scale collapsing to a single shade — surfaces now graduate from 100 (lightest) to 300 (darkest) in both light and dark ([#890](https://github.com/techniq/layerchart/pull/890))

- fix(Tooltip): Theme portaled tooltips in the style presets so surface colors resolve correctly (e.g. fixes a light tooltip in dark mode with Skeleton) ([#890](https://github.com/techniq/layerchart/pull/890))
