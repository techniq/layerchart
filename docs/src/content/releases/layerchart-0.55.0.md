---
title: "layerchart@0.55.0"
tag: "layerchart@0.55.0"
date: "2024-10-29T12:10:47Z"
url: "https://github.com/techniq/layerchart/releases/tag/layerchart%400.55.0"
draft: false
prerelease: false
author: "github-actions[bot]"
---
### Minor Changes

-   feat: Add Marker support for Spline, Line, and Link (and components which use these) ([#267](https://github.com/techniq/layerchart/pull/267))

-   feat: Add Marker component for drawing arrowheads or polymarkers on Line, Spline, etc ([#267](https://github.com/techniq/layerchart/pull/267))

-   feat(Brush): Add `labels` prop and slot to enable showing values beside each handle ([#265](https://github.com/techniq/layerchart/pull/265))

-   breaking: Use camelCase (`aboveMarks`, etc) instead of kebob case (`above-marks`) slot names to fix Svelte 5 `{#snippet}` compatibility ([#269](https://github.com/techniq/layerchart/pull/269))

### Patch Changes

-   fix: Render axis slot after/above marks (Bars, Lines, etc) which has no visible difference with current examples, but enables placing axis labels on top of marks ([`c10452e`](https://github.com/techniq/layerchart/commit/c10452e51f3bfb649606ea112c50d7b9fa343db1))

-   fix(Brush): Do not convert `Date` domain instances to `number` when performing arithmetic ([#265](https://github.com/techniq/layerchart/pull/265))
