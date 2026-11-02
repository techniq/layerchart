---
description: 'Geographic mark laying an equirectangular image over a WebGL map through its projection, or wrapping a globe in it.'
category: WebGL maps
related: [GeoRaster, guides/webgl, guides/geo]
components:
  - { name: webgl/GeoRaster, label: GeoRaster }
---

::tip
Part of [`@layerchart/webgl`](/docs/guides/webgl), drawn in a `WebGL` layer. See the [WebGL guide](/docs/guides/webgl) to get started.
::

## Usage

An equirectangular image (`src`: a URL, or an image or canvas) laid over the map through the chart's projection, as LayerChart's [GeoRaster](/docs/components/GeoRaster) reprojects one. `elevation` (a function of longitude and latitude) raises it into terrain, and `tooltip` shows the longitude and latitude under the pointer.

:example{ name="projections" }

## Globe

The `globe` projection lays the map on a real sphere you can orbit. Fit it as an orthographic map (the sphere is the size and place the disk would be, standing on the floor) and the same marks draw on it: `GeoRaster` wraps it in an image, `GeoPath` follows its curve, `Points` and `Bars` stand out from it, `Spline` runs along great circles, and `Surface` / `Raster` cover it.

```svelte
<script>
	import { Chart, GeoPath, GeoRaster, WebGL, globe, perspective } from '@layerchart/webgl';
</script>

<Chart geo={{ projection: globe, fitGeojson: { type: 'Sphere' } }} view={perspective}>
	<WebGL>
		<GeoRaster src="/images/blue-marble.jpg" tooltip />
		<GeoPath geojson={countries} stroke="white" />
	</WebGL>
</Chart>
```

:example{ name="globe" }

:example{ name="planets" }

:example{ name="globe-textures" }

:example{ name="globe-tiles" }
