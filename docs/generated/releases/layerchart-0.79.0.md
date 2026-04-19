---
title: 'layerchart@0.79.0'
tag: 'layerchart@0.79.0'
date: '2025-01-25T17:39:30Z'
url: 'https://github.com/techniq/layerchart/releases/tag/layerchart%400.79.0'
draft: false
prerelease: false
author: 'github-actions[bot]'
---

### Minor Changes

- fix: Improve canvas reactivity for all primatives (Arc, Area, Circle, Spline, etc) ([#339](https://github.com/techniq/layerchart/pull/339))

### Patch Changes

- fix(getComputedStyles): Ignore transition classes to allow immediate reading of css values (ex. `transition-opacity` affecting `opacity-10`) ([#339](https://github.com/techniq/layerchart/pull/339))

- fix(render): Multiply `fillOpacity` by overall `opacity` for fill to support opacity classes (ex. `opacity-10`) ([#339](https://github.com/techniq/layerchart/pull/339))

- fix: Memoize creating canvas gradients to improve reactivity detection ([#339](https://github.com/techniq/layerchart/pull/339))
