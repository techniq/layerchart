---
title: "layerchart@2.0.0-next.54"
tag: "layerchart@2.0.0-next.54"
date: "2026-04-13T14:42:17Z"
url: "https://github.com/techniq/layerchart/releases/tag/layerchart%402.0.0-next.54"
draft: false
prerelease: true
author: "github-actions[bot]"
---
### Minor Changes

-   feat: New `GeoClipPath` component for clipping content to GeoJSON boundaries in both SVG and Canvas modes ([#449](https://github.com/techniq/layerchart/pull/449))

-   feat(Text): Add `segments` prop for inline mixed-style text ([#449](https://github.com/techniq/layerchart/pull/449))

    New `segments` prop accepts an array of `{ value, class }` objects to render text with different styles (font size, weight, color) inline. Works across SVG (via tspans), Canvas (via sequential measureText/fillText), and HTML layers. Useful for labels that combine a bold name with a lighter value, such as treemap headers.

-   feat(Hull): Add CommonStyleProps (fill, fillOpacity, stroke, strokeOpacity, strokeWidth, opacity) for Canvas layer compatibility ([#449](https://github.com/techniq/layerchart/pull/449))

-   feat(Tooltip): Add `fadeDuration` prop to control fade in/out transition ([#828](https://github.com/techniq/layerchart/pull/828))

    The fade transition on `Tooltip.Root` is now configurable via the `fadeDuration` prop (default: `100`ms). Set to `0` to disable the fade transition entirely.

-   feat(Tooltip): Portal tooltip to body by default to fix overflow clipping. Resolves #446 ([#828](https://github.com/techniq/layerchart/pull/828))

    Tooltip.Root now portals to `document.body` (or `.PortalTarget`) by default using the `portal` action from `@layerstack/svelte-actions`. This prevents tooltips from being clipped by ancestor elements with `overflow: hidden`. The tooltip uses `position: fixed` with viewport-relative coordinates when portaled. Set `portal={false}` to restore the previous inline behavior. Both `contained="container"` and `contained="window"` modes continue to work correctly with portaling.

### Patch Changes

-   fix(ArcLabel): Support rotation in Canvas mode ([#449](https://github.com/techniq/layerchart/pull/449))

    Changed `centroid-rotated` and `centroid-radial` placements to pass `rotate` prop instead of SVG `transform` string to `Text`, enabling rotation in Canvas rendering.

-   fix: Pie and Arc components now correctly use Chart's `xRange` prop for angle degrees instead of the computed viewport pixel range, and compute radius from chart dimensions instead of scale range ([#449](https://github.com/techniq/layerchart/pull/449))
