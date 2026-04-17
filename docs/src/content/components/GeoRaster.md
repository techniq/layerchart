---
description: Geographic component which reprojects a raster image (such as NASA Blue Marble) onto any d3-geo projection using per-pixel inverse sampling.
category: geo
layers: [canvas]
related: []
---

:::tip
See the [Geo guide](/docs/guides/geo) for a full walkthrough of projections, fitting, rendering components, tooltips, and pan/zoom on maps.
:::

`GeoRaster` reprojects a source image onto the current chart's projection by inverse-sampling each destination pixel. It is intended for full-globe imagery distributed in the equirectangular (plate carrée) layout — such as [NASA Blue Marble](https://visibleearth.nasa.gov/collection/1484/blue-marble) or [Black Marble](https://blackmarble.gsfc.nasa.gov/) — but supports arbitrary source projections via the `sourceProjection` prop.

Rendering is pure Canvas 2D (no WebGL). The image must be CORS-readable so its pixels can be sampled via `getImageData`.

## Usage

:example{ name="globe" showCode }
