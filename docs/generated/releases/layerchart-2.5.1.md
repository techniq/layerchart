---
title: "layerchart@2.5.1"
tag: "layerchart@2.5.1"
date: "2026-10-01T18:55:17Z"
url: "https://github.com/techniq/layerchart/releases/tag/layerchart%402.5.1"
draft: false
prerelease: false
author: "github-actions[bot]"
---
### Patch Changes

- fix(Tooltip): Keep a flipped tooltip inside the container (or window) when flipping overflows the other edge (ex. a start-aligned tooltip wider than half a narrow chart opened past its left edge) ([#924](https://github.com/techniq/layerchart/pull/924))

- fix(TooltipContext): Keep a tooltip locked from `onclick` on touch (a tap's `pointerleave` precedes `click`, and its pending hide cleared the data under the lock), and hide it once unlocked if the pointer left while locked ([#924](https://github.com/techniq/layerchart/pull/924))