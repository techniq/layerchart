---
description: Geographic component which renders shapes such as countries, states, or regions by drawing their boundaries based on coordinate data.
category: geo
layers: [svg, canvas]
related: [Graticule]
---

:::tip
See the [Geo guide](/docs/guides/geo) for a full walkthrough of projections, fitting, rendering components, tooltips, and pan/zoom on maps.
:::

## Usage

:example{ name="tooltip" showCode }

## Isometric

On an [isometric](/docs/guides/isometric) chart, `z` stands each shape up off the floor. Here each state stands at its share of the 2020 presidential vote. Drag to turn it.

:example{ name="election-isometric" }

## Drill down

Click a continent (or World Bank region) to zoom to its countries, a country for its states or provinces, then a region or US state for its provinces or counties. Clicking where there is nothing further in zooms back out a level. Each country's shapes load when it is clicked, from Natural Earth's [admin-1 states and provinces](https://www.naturalearthdata.com/downloads/10m-cultural-vectors/10m-admin-1-states-provinces/), with [US Atlas](https://github.com/topojson/us-atlas) for US counties.

:example{ name="drill-down" }
