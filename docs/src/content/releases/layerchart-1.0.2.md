---
title: "layerchart@1.0.2"
tag: "layerchart@1.0.2"
date: "2025-02-28T16:56:51Z"
url: "https://github.com/techniq/layerchart/releases/tag/layerchart%401.0.2"
draft: false
prerelease: false
author: "github-actions[bot]"
---
### Patch Changes

-   feat: Let users pass configurations for svg and canvas (like cursor-crosshair) ([#419](https://github.com/techniq/layerchart/pull/419))

-   fix: Reactively rebuild `get_Props()` functions when `highlightSeriesKey` is updated. Fixes Svelte 3/4 reactivity issues when hovering legend, points, etc ([#425](https://github.com/techniq/layerchart/pull/425))

-   fix(TooltipContext): Support explicit `tooltip.show(...)` when using non-manual mode (ex. support manual annotations with `mode="bisect-x"`) ([#423](https://github.com/techniq/layerchart/pull/423))
