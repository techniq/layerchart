---
description: 'Geographic component which renders map tiles in a grid supporting efficient zooming and panning for larger scale maps. In a WebGL layer, tiles can rise into terrain from elevation tiles.'
category: WebGL geo
related: [GeoTile, GeoRaster, guides/webgl, guides/geo]
components:
  - { name: webgl/GeoTile, label: GeoTile }
---

::tip
Part of [`@layerchart/webgl`](/docs/guides/webgl), drawn in a `WebGL` layer. See the [WebGL guide](/docs/guides/webgl) to get started.
::

## Usage

Map tiles from an XYZ tile service, with LayerChart's [GeoTile](/docs/components/GeoTile) props (`url`, `zoomDelta`, `tileSize`, `disableCache`, `debug`), picked for the chart's Web Mercator projection as it picks them. A `projection` transform zooms the map, and sharper tiles load as it does.

:example{ name="zoomable" }

## Terrain

`elevation` raises the tiles from elevation tiles (ex. AWS's open terrain tiles, or Mapterhorn, in `'terrarium'` encoding; Terrain-RGB as `'mapbox'`), their meters through the chart's `z` scale. `maxZoom` and `elevationMaxZoom` say how deep each service goes: deeper tiles show part of their ancestor, enlarged.

```svelte
<GeoTile
	url={(x, y, z) => `https://tiles.versatiles.org/tiles/satellite-raster/${z}/${x}/${y}`}
	maxZoom={12}
	elevation={(x, y, z) =>
		`https://s3.amazonaws.com/elevation-tiles-prod/terrarium/${z}/${x}/${y}.png`}
	elevationMaxZoom={15}
/>
```

:example{ name="terrain" }

## Detail that follows the camera

In a 3D view, tiles are picked from the camera rather than the projection: each tile is as deep as it needs to be to look about `tileSize` pixels across on screen, so tiles are sharp up close and coarse in the distance, and sharpen as the camera moves in. A new tile draws at once from an ancestor already loaded (blurrier, as the tile it's zoomed in from), then fades to its own as it arrives; tiles leaving the view stay until those taking their place are drawn. So moving never opens a hole, as LayerChart's seamless layering of `GeoTile`s does, with one `GeoTile`. The same works on the `globe`, where tiles on its far side are left out.

:example{ name="globe" }
