---
title: 3D Maps & Globes
category: state
---

Maps in [3D](/docs/guides/3d). Set a projection on the chart as for a flat map (see the [Geo guide](/docs/guides/geo)), and marks lay out through it: `Points`, `Bars`, `Spline`, and `Area` place rows at their longitude (`x`) and latitude (`y`).

## GeoPath

Features on the floor, extruded `z` tall (a property key or function of the feature, through the chart's `z` scale, or pixels). Lines, and outlines with `stroke`, draw on top. A collection draws as one mark, so thousands of features stay quick, and with `tooltip` the tooltip shows the feature under the pointer. `motion` eases each feature's height and fill to new values.

```svelte
<Chart geo={{ projection: geoAlbersUsa, fitGeojson: states }} view={perspective}>
	<WebGL>
		<GeoPath geojson={states} z={(d) => d.properties.population} fill="var(--color-primary)" />
	</WebGL>
</Chart>
```

:example{ component="WebGL" name="election" }

:example{ component="WebGL" name="pin-map" }

:example{ component="WebGL" name="walmart-hexbin" }

:example{ component="WebGL" name="buildings" }

## Bin

`Bin` groups rows into hexagons (or squares, or triangles) of the map as projected, and stands each up `z` tall, as LayerChart's [Bin](/docs/components/Bin) fills them. Every cell is the same shape, so thousands draw as one. Below, each hexagon's people over its ground area, binned from Kontur's population of each state, and lit by a low sun so the cities cast long shadows.

```svelte
<Chart
	{data}
	x="lon"
	y="lat"
	geo={{ projection: geoMercator, fitGeojson: state }}
	view={perspective}
>
	<WebGL>
		<Light azimuth={315} altitude={22} shadow />
		<Bin size={14} gap={1} weight="people" z="count" fill="count" />
	</WebGL>
</Chart>
```

:example{ component="WebGL" name="state-population" }

d3-geo reads a polygon's outside ring clockwise, and the other way round as the rest of the world, so rewind rings from other sources (ex. OpenStreetMap) before drawing them.

## Elevation

A `Surface` sampling a function of longitude and latitude is terrain. These load elevation from the open terrain tiles AWS hosts (see the examples' `loadElevation`), and light it with a sun you can move.

:example{ component="WebGL" name="us-elevation" }

:example{ component="WebGL" name="terrain" }

:example{ component="WebGL" name="world-elevation" }

## Globe

The `globe` projection lays the map on a real sphere you can orbit, rather than a disk on the floor. Fit it as an orthographic map (the sphere is the size and place the disk would be, standing on the floor) and the same marks draw on it: `GeoRaster` wraps it in an image, `GeoPath` follows its curve (and fills the globe itself for `{ type: 'Sphere' }`), `Points` and `Bars` stand out from it, `Spline` runs along great circles, and `Surface` / `Raster` cover it. The camera fits the globe rather than the plot, and the projection's `rotate` turns it.

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

:example{ component="WebGL" name="globe" }

:example{ component="WebGL" name="planets" }

:example{ component="WebGL" name="globe-textures" }

:example{ component="WebGL" name="globe-tiles" }

## GeoRaster

An equirectangular image laid over the map through the chart's projection, as LayerChart's [GeoRaster](/docs/components/GeoRaster) reprojects one. Give it `elevation` (a function of longitude and latitude) to raise it into terrain, and `tooltip` to show the longitude and latitude under the pointer.

:example{ component="WebGL" name="projections" }
