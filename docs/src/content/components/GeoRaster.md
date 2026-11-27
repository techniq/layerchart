---
description: Geographic component which reprojects a raster image (such as NASA Blue Marble) onto any d3-geo projection using per-pixel inverse sampling.
category: geo
layers: [canvas]
related: []
components:
  - { name: GeoRaster }
  - { name: webgl/GeoRaster, label: GeoRaster (WebGL) }
---

:::tip
See the [Geo guide](/docs/guides/geo) for a full walkthrough of projections, fitting, rendering components, tooltips, and pan/zoom on maps.
:::

`GeoRaster` reprojects a source image onto the current chart's projection by inverse-sampling each destination pixel. It is intended for full-globe imagery distributed in the equirectangular (plate carrée) layout — such as [NASA Blue Marble](https://visibleearth.nasa.gov/collection/1484/blue-marble) or [Black Marble](https://blackmarble.gsfc.nasa.gov/) — but supports arbitrary source projections via the `sourceProjection` prop.

Rendering is pure Canvas 2D (no WebGL). The image must be CORS-readable so its pixels can be sampled via `getImageData`.

## Usage

:example{ name="globe" showCode }

## WebGL

In a [`WebGL`](/docs/components/WebGL) layer, from [`@layerchart/webgl`](/docs/guides/webgl), the image can rise into terrain or wrap a globe. See the [WebGL guide](/docs/guides/webgl) to get started.

An image (`image`: a URL, or an image, canvas, or bitmap) laid over the map through the chart's projection, as the core [GeoRaster](/docs/components/GeoRaster) reprojects one, and with the same props: it's equirectangular unless `sourceProjection` gives the projection it was drawn in, and `interpolate` / `pixelated` choose blended or crisp pixels. Unlike core's, it blends (`'bilinear'`) by default, which costs the GPU nothing. `elevation` (a function of longitude and latitude) raises it into terrain, and `tooltip` shows the longitude and latitude under the pointer.

:example{ name="projections-3d" }

### Terrain

Map tiles stitched into one image (`sourceProjection` maps longitude and latitude onto its Web Mercator pixels) and draped over `elevation`, lit by a `Light`: satellite imagery over a mountain, at true scale times the exaggeration. The tiles load once for the area, so they don't sharpen as you zoom in.

:example{ name="terrain" }

### Globe

The `globe` projection lays the map on a real sphere you can orbit. Fit it as an orthographic map (the sphere is the size and place the disk would be, standing on the floor) and the same marks draw on it: `GeoRaster` wraps it in an image, `GeoPath` follows its curve, `Points` and `Bars` stand out from it, `Spline` runs along great circles, and `Surface` / `Raster` cover it.

```svelte
<script>
	import { Chart, GeoPath, GeoRaster, WebGL, globe, perspective } from '@layerchart/webgl';
</script>

<Chart geo={{ projection: globe, fitGeojson: { type: 'Sphere' } }} view={perspective}>
	<WebGL>
		<GeoRaster image="/images/blue-marble.jpg" tooltip />
		<GeoPath geojson={countries} stroke="white" />
	</WebGL>
</Chart>
```

:example{ name="globe-3d" }

:example{ name="planets-3d" }

:example{ name="globe-textures" }

:example{ name="globe-tiles" }
