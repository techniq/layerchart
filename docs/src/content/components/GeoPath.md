---
description: Geographic component which renders shapes such as countries, states, or regions by drawing their boundaries based on coordinate data.
category: geo
layers: [svg, canvas]
related: [Graticule]
components:
  - { name: GeoPath }
  - { name: webgl/GeoPath, label: GeoPath (WebGL) }
---

:::tip
See the [Geo guide](/docs/guides/geo) for a full walkthrough of projections, fitting, rendering components, tooltips, and pan/zoom on maps.
:::

## Usage

:example{ name="tooltip" showCode }

## Isometric

On an [isometric](/docs/guides/isometric) chart, `z` stands each shape up off the floor. Here each state stands at its share of the 2020 presidential vote. Drag to turn it.

:example{ name="election-isometric" }

## GeoJSON drilldown

Click a continent (or World Bank region) to zoom to its countries, a country for its states or provinces, then a region or US state for its provinces or counties. Clicking where there is nothing further in zooms back out a level. Each country's shapes load when it is clicked, from Natural Earth's [admin-1 states and provinces](https://www.naturalearthdata.com/downloads/10m-cultural-vectors/10m-admin-1-states-provinces/), with [US Atlas](https://github.com/topojson/us-atlas) for US counties.

:example{ name="geojson-drilldown" }

## WebGL

In a [`WebGL`](/docs/components/WebGL) layer, from [`@layerchart/webgl`](/docs/guides/webgl), features rise by their z, or follow a globe. See the [WebGL guide](/docs/guides/webgl) to get started.

Features on the floor through the chart's projection, extruded `z` tall (a property key or function of the feature, through the chart's `z` scale, or pixels). Lines, and outlines with `stroke`, draw on top. A collection draws as one mark, so thousands of features stay quick. `motion` eases each feature's height and fill to new values.

```svelte
<Chart geo={{ projection: geoAlbersUsa, fitGeojson: states }} view={perspective}>
	<WebGL>
		<GeoPath geojson={states} z={(d) => d.properties.population} fill="var(--color-primary)" />
	</WebGL>
</Chart>
```

:example{ name="election" }

### Buildings, with shadows

d3-geo reads a polygon's outside ring clockwise, and the other way round as the rest of the world, so rewind rings from other sources (ex. OpenStreetMap) before drawing them.

:example{ component="Light" name="buildings" }

### On a globe

With the `globe` projection, features' lines draw over the sphere, and `{ type: 'Sphere' }` fills the globe itself (ex. beneath an image still loading).

:example{ component="GeoRaster" name="globe-tiles" }
