---
title: "layerchart@2.0.0-next.3"
tag: "layerchart@2.0.0-next.3"
date: "2025-05-09T17:38:00Z"
url: "https://github.com/techniq/layerchart/releases/tag/layerchart%402.0.0-next.3"
draft: false
prerelease: true
author: "github-actions[bot]"
---
### Patch Changes

-   breaking(AnnotationLine|AnnotationPoint): Change `labelOffset` into explicit `labelXOffset` and `labelYOffset` for greater control (aligns with AnnotationRange) ([#492](https://github.com/techniq/layerchart/pull/492))

-   fix(HighlightKey): Define `set()` with arrow function to solve `current` access when passed directly ([#449](https://github.com/techniq/layerchart/pull/449))

-   fix: Improve memory leak caused by detached DOM increase when using Canvas rendering due to sometimes still rendering Svg components (ex. `<g>` vs `<Group>`) (#490) ([#490](https://github.com/techniq/layerchart/pull/490))

-   breaking(Bar): Rename `bar` prop to `data` to better represent usage ([#449](https://github.com/techniq/layerchart/pull/449))
