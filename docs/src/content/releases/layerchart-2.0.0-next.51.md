---
title: "layerchart@2.0.0-next.51"
tag: "layerchart@2.0.0-next.51"
date: "2026-04-07T16:46:58Z"
url: "https://github.com/techniq/layerchart/releases/tag/layerchart%402.0.0-next.51"
draft: false
prerelease: true
author: "github-actions[bot]"
---
### Minor Changes

-   feat: New `GeoRaster` component for reprojecting raster imagery (e.g. NASA Blue Marble) onto any d3-geo projection via per-pixel inverse sampling on Canvas ([#815](https://github.com/techniq/layerchart/pull/815))

-   feat: Add `renderChart()` to `layerchart/server` for server-side chart-to-image rendering (PNG/JPEG) ([#813](https://github.com/techniq/layerchart/pull/813))

### Patch Changes

-   feat: Add `stroke` and `fill` props to `Axis` and `Grid` for explicit color control (useful for SSR where CSS variables are unavailable) ([#813](https://github.com/techniq/layerchart/pull/813))

-   fix: Skip mark x/y/data from domain/series calculation when geo projection is active ([#449](https://github.com/techniq/layerchart/pull/449))

-   fix: Default geo projection `translate` to container center when `translate` and `fitGeojson` are not specified, instead of using d3-geo's fixed default (`[480, 250]`) ([#815](https://github.com/techniq/layerchart/pull/815))

-   fix: improve compatibility with UnoCSS Svelte scoped preprocessing ([#813](https://github.com/techniq/layerchart/pull/813))
    -   Remove TypeScript-only `as` assertions from exported Svelte markup in core mark components so preprocessors that parse markup expressions as plain JavaScript can consume packaged components without failing
