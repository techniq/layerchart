---
title: 'layerchart@0.37.0'
tag: 'layerchart@0.37.0'
date: '2024-05-28T11:58:47Z'
url: 'https://github.com/techniq/layerchart/releases/tag/layerchart%400.37.0'
draft: false
prerelease: false
author: 'github-actions[bot]'
---

### Minor Changes

- Integrate `Transform` into `Chart` (`<Chart transform={...} let:transform>`) and expose as `transformContext()`. Renamed to `TransformContext` and removed direct SVG control (now handled by `Svg` and `Canvas` components) ([#166](https://github.com/techniq/layerchart/pull/166))

- Add HitCanvas component to enable shape-based tooltips (ex. GeoPath) using hidden color-coded canvas ([#163](https://github.com/techniq/layerchart/pull/163))

- Support transform with Canvas layers (ex. geo, etc) ([#166](https://github.com/techniq/layerchart/pull/166))

- [Axis] Rename `labelProps` to `tickLabelProps` and `label` slot to `tickLabel` ([#165](https://github.com/techniq/layerchart/pull/165))

- Replace mouse/touch with pointer events handlers ([`158a7641232b209a836f36e0f25ae4dcb5a876bc`](https://github.com/techniq/layerchart/commit/158a7641232b209a836f36e0f25ae4dcb5a876bc))

- Add new Canvas component (derived from LayerCake) which handles `scaleCanvas()` globally and supports scale/translate transforms ([#166](https://github.com/techniq/layerchart/pull/166))

### Patch Changes

- [Axis] Add label support ([#165](https://github.com/techniq/layerchart/pull/165))

- [TransformControls] Use transformContext instead of `transform` prop ([#166](https://github.com/techniq/layerchart/pull/166))

- [GeoPath] Handle `stroke-none` class when used within Canvas context ([#163](https://github.com/techniq/layerchart/pull/163))

- [GeoContext] Integrate with new TransformContext ([#166](https://github.com/techniq/layerchart/pull/166))

- [GeoPath] Respect `strokeWidth` prop within Svg context (not just `stroke-width` attribute) to align with Canvas context usage ([#166](https://github.com/techniq/layerchart/pull/166))
