---
description: 'Geographic component which reprojects a raster image (such as NASA Blue Marble) onto any d3-geo projection. In a WebGL layer, the image can rise into terrain or wrap a globe.'
category: WebGL geo
related: [GeoRaster, guides/webgl, guides/geo]
components:
  - { name: webgl/GeoRaster, label: GeoRaster }
---

::tip
Part of [`@layerchart/webgl`](/docs/guides/webgl), drawn in a `WebGL` layer. See the [WebGL guide](/docs/guides/webgl) to get started.
::

## Usage

An image (`image`: a URL, or an image, canvas, or bitmap) laid over the map through the chart's projection, as LayerChart's [GeoRaster](/docs/components/GeoRaster) reprojects one, and with the same props: it's equirectangular unless `sourceProjection` gives the projection it was drawn in, and `interpolate` / `pixelated` choose blended or crisp pixels. Unlike LayerChart's, it blends (`'bilinear'`) by default, which costs the GPU nothing. `elevation` (a function of longitude and latitude) raises it into terrain, and `tooltip` shows the longitude and latitude under the pointer.

:example{ name="projections" }

## Terrain

Map tiles stitched into one image (`sourceProjection` maps longitude and latitude onto its Web Mercator pixels) and draped over `elevation`, lit by a `Light`: satellite imagery over a mountain, at true scale times the exaggeration. The tiles load once for the area, so they don't sharpen as you zoom in.

:example{ name="terrain" }

## Globe

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

:example{ name="globe" }

:example{ name="planets" }

:example{ name="globe-textures" }

:example{ name="globe-tiles" }
