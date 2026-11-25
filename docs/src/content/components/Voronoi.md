---
description: Interaction component which creates Voronoi diagrams to divide a plane according to the nearest points, aiding spatial analysis and visualization.
category: interactions
layers: [svg, canvas]
related: [TooltipContext, Labels]
---

## Usage

:example{ name="radius" showCode }

## Clipping to a shape

Use `clip` to cut every cell to a shape: a GeoJSON feature in a geo chart, or a polygon of pixels.
Cells are then measured on screen, so even one or two points divide the shape, and points sharing a
location share their cell. The `children` snippet's `cells` give each cell's `path` (ex. for a
`<ClipPath>`) and its `polygons`, for `shapeLabel()` to find where it has the most room for content.

Here, each state is divided between the teams in it, with a team's logo filling its territory.

:example{ component="Image" name="sports-territories" showCode }
