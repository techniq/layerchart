---
description: Geographic component which renders map tiles in a grid supporting efficient zooming and panning for larger scale maps.
category: geo
layers: [svg, canvas]
related: []
components:
  - { name: GeoTile }
  - { name: webgl/GeoTile, label: GeoTile (WebGL) }
---

:::tip
See the [Geo guide](/docs/guides/geo) for a full walkthrough of projections, fitting, rendering components, tooltips, and pan/zoom on maps.
:::

## Usage

:example{ name="basic" }

## WebGL

In a [`WebGL`](/docs/components/WebGL) layer, from [`@layerchart/webgl`](/docs/guides/webgl), tiles can rise into terrain from elevation tiles. See the [WebGL guide](/docs/guides/webgl) to get started.

Map tiles from an XYZ tile service, with the core [GeoTile](/docs/components/GeoTile) props (`url`, `zoomDelta`, `tileSize`, `disableCache`, `debug`), picked for the chart's Web Mercator projection as it picks them. A `projection` transform zooms the map, and sharper tiles load as it does.

:example{ name="zoomable-webgl" }

### Terrain

`elevation` raises the tiles from a second tile service of elevation tiles (ex. AWS's open terrain tiles, or Mapterhorn): their `url`, `encoding` (`'terrarium'`, or Terrain-RGB as `'mapbox'`), and `maxZoom`, their meters through the chart's `z` scale. `maxZoom` and the elevation's `maxZoom` say how deep each service goes: deeper tiles show part of their ancestor, enlarged.

```svelte
<GeoTile
	url={(x, y, z) => `https://tiles.versatiles.org/tiles/satellite-raster/${z}/${x}/${y}`}
	maxZoom={12}
	elevation={{
		url: (x, y, z) => `https://s3.amazonaws.com/elevation-tiles-prod/terrarium/${z}/${x}/${y}.png`,
		maxZoom: 15
	}}
/>
```

:example{ name="terrain" }

### Detail that follows the camera

In a 3D view, tiles are picked from the camera rather than the projection: each tile is as deep as it needs to be to look about `tileSize` pixels across on screen, so tiles are sharp up close and coarse in the distance, and sharpen as the camera moves in. A new tile draws at once from an ancestor already loaded (blurrier, as the tile it's zoomed in from), then fades to its own as it arrives; tiles leaving the view stay until those taking their place are drawn, the sharpest showing wherever they overlap (so zooming out keeps what was sharp, and fills around it). Beneath them all, a few coarse tiles (the map's own, three zooms up) show through wherever a tile has yet to arrive. So moving never opens a hole, as the core seamless layering of `GeoTile`s does, with one `GeoTile`. The same works on the `globe`, where tiles on its far side are left out.

:example{ name="globe" }
