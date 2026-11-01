---
title: 3D Maps & Globes
category: state
---

Maps in [3D](/docs/guides/3d). Set a projection on the chart as for a flat map (see the [Geo guide](/docs/guides/geo)), and marks lay out through it: `Points`, `Bars`, `Spline`, and `Area` place rows at their longitude (`x`) and latitude (`y`).

## GeoPath

Features on the floor, extruded `z` tall (a property key or function of the feature, through the chart's `z` scale, or pixels). Lines, and outlines with `stroke`, draw on top. A collection draws as one mark, so thousands of features stay quick, and with `tooltip` the tooltip shows the feature under the pointer. `motion` eases each feature's height and fill to new values.

```svelte
<Chart geo={{ projection: geoAlbersUsa, fitGeojson: states }}>
	<Scene>
		<GeoPath geojson={states} z={(d) => d.properties.population} fill="var(--color-primary)" />
	</Scene>
</Chart>
```

:example{ component="Scene" name="election" }

:example{ component="Scene" name="pin-map" }

:example{ component="Scene" name="walmart-hexbin" }

:example{ component="Scene" name="buildings" }

d3-geo reads a polygon's outside ring clockwise, and the other way round as the rest of the world, so rewind rings from other sources (ex. OpenStreetMap) before drawing them.

## Elevation

A `Surface` sampling a function of longitude and latitude is terrain. These load elevation from the open terrain tiles AWS hosts (see the examples' `loadElevation`), and light it with a sun you can move.

:example{ component="Scene" name="us-elevation" }

:example{ component="Scene" name="terrain" }

:example{ component="Scene" name="world-elevation" }

## Globe

The `globe` projection lays the map on a real sphere you can orbit, rather than a disk on the floor. Fit it as an orthographic map (the sphere is the size and place the disk would be, standing on the floor) and the same marks draw on it: `GeoRaster` wraps it in an image, `GeoPath` follows its curve (and fills the globe itself for `{ type: 'Sphere' }`), `Points` and `Bars` stand out from it, `Spline` runs along great circles, and `Surface` / `Raster` cover it. The camera fits the globe rather than the plot, and the projection's `rotate` turns it.

```svelte
<script>
	import { Chart, GeoPath, GeoRaster, Scene, globe } from '@layerchart/3d';
</script>

<Chart geo={{ projection: globe, fitGeojson: { type: 'Sphere' } }}>
	<Scene>
		<GeoRaster src="/images/blue-marble.jpg" tooltip />
		<GeoPath geojson={countries} stroke="white" />
	</Scene>
</Chart>
```

:example{ component="Scene" name="globe" }

:example{ component="Scene" name="planets" }

:example{ component="Scene" name="globe-textures" }

:example{ component="Scene" name="globe-tiles" }

## GeoRaster

An equirectangular image laid over the map through the chart's projection, as LayerChart's [GeoRaster](/docs/components/GeoRaster) reprojects one. Give it `elevation` (a function of longitude and latitude) to raise it into terrain, and `tooltip` to show the longitude and latitude under the pointer.

:example{ component="Scene" name="projections" }
