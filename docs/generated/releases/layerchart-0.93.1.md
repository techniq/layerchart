---
title: 'layerchart@0.93.1'
tag: 'layerchart@0.93.1'
date: '2025-02-03T03:18:08Z'
url: 'https://github.com/techniq/layerchart/releases/tag/layerchart%400.93.1'
draft: false
prerelease: false
author: 'github-actions[bot]'
---

### Patch Changes

- fix(AreaChart|LineChart): Only define `onpointerclick` on Highlight if provided to chart (coordinate with recent Highlight change) ([`81ddcbe`](https://github.com/techniq/layerchart/commit/81ddcbec9b2a298b4b8155ba3030c031f7deaa4f))

- fix: Add `BrushContext` to top-level exports (useful for types) ([`5005c18`](https://github.com/techniq/layerchart/commit/5005c189bcdd4108029e73b13b160819609bf003))

- fix(Highlight): Do not propagate `pointerdown` event to `BrushContext` if `onclick` is provided ([`0c35ba9`](https://github.com/techniq/layerchart/commit/0c35ba925aabff89b6c9ee4125f1bca56e94ca8e))

- feat(Circle): Add `onpointerevent` event callback ([`0ecb9e3`](https://github.com/techniq/layerchart/commit/0ecb9e3c700cdba8e4ccf653fcf9406c215eef8a))
