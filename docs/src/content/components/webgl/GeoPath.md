---
description: 'Geographic component which renders shapes such as countries, states, or regions by drawing their boundaries based on coordinate data. In a WebGL layer, features rise by their z, or follow a globe.'
category: WebGL maps
related: [GeoPath, guides/webgl, guides/geo]
components:
  - { name: webgl/GeoPath, label: GeoPath }
---

::tip
Part of [`@layerchart/webgl`](/docs/guides/webgl), drawn in a `WebGL` layer. See the [WebGL guide](/docs/guides/webgl) to get started.
::

## Usage

Features on the floor through the chart's projection, extruded `z` tall (a property key or function of the feature, through the chart's `z` scale, or pixels). Lines, and outlines with `stroke`, draw on top. A collection draws as one mark, so thousands of features stay quick. `motion` eases each feature's height and fill to new values.

```svelte
<Chart geo={{ projection: geoAlbersUsa, fitGeojson: states }} view={perspective}>
	<WebGL>
		<GeoPath geojson={states} z={(d) => d.properties.population} fill="var(--color-primary)" />
	</WebGL>
</Chart>
```

:example{ name="election" }

## Buildings, with shadows

d3-geo reads a polygon's outside ring clockwise, and the other way round as the rest of the world, so rewind rings from other sources (ex. OpenStreetMap) before drawing them.

:example{ component="webgl/Light" name="buildings" }

## On a globe

With the `globe` projection, features' lines draw over the sphere, and `{ type: 'Sphere' }` fills the globe itself (ex. beneath an image still loading).

:example{ component="webgl/GeoRaster" name="globe-tiles" }
