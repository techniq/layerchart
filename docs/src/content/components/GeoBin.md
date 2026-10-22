---
description: Geographic composite mark grouping points into hexagon, square, or triangle cells that tile the sphere, so they curve with a globe and stay put as it turns.
category: geo
layers: [svg, canvas]
related: [Bin, GeoPath, Graticule]
---

::tip
To bin where points land on the screen, as a hexbin does on a scatter plot, see [Bin](/docs/components/Bin).
::

The **geo bin** mark is [Bin](/docs/components/Bin) on the sphere: its cells tile the globe rather than the screen, about `size` pixels across at the projection's center. They're drawn through the projection, so they curve with a globe, clip at its horizon, and stay put as it turns — points are only binned again when the data changes, or a zoom calls for a finer grid.

It takes the same props as `Bin` — `fill`, `r`, `z`, `grid`, a `children` snippet, and pointer events all work alike — with `x` and `y` as longitude and latitude.

## Usage

Airports binned on a globe, with the grid outlined. Drag to rotate.

:example{ name="world-airports" showCode }

## Shape

Each `shape` tiles the sphere:

- `hexagon`: an icosahedron with its faces subdivided, evened out by [Gray's equal-area transformation](https://observablehq.com/@fil/gray-fuller-grid) — hexagons, and 12 pentagons where the icosahedron's corners fall, turned to lie in the ocean
- `square`: the cells between a graticule's meridians and parallels, at the step that divides 180° nearest `size` (1°, 2°, 3°, 5°, 10°…), so they line up with a [Graticule](/docs/components/Graticule) drawn at it. Unlike the others they aren't equal in area, narrowing toward the poles, so counts there read low
- `triangle`: the triangles joining the hexagons' centers

Here, points spread evenly over the land fill every cell with land in it.

:example{ name="land" }

## Gridded data

Gridded data — values already summed into regular cells, such as population — bins with a `weight`, so each cell's `count` is the sum of its rows' values rather than how many there are. Its `square` cells are the graticule's, so set `step` in degrees to match the data's own grid: each square is then one of its cells, bent by the projection as the map is. Here, 2020's population of each 15′ cell of the contiguous US.

:example{ name="us-population" }

A cell's `area` is in steradians, so `count / (area × 6371²)` is people per km², a density that holds at any size or shape. Here, 2020's population of each 1° cell of the world.

:example{ name="world-population" }

## Dot globe

A `children` snippet receives the cells facing the viewer, each with its `center` as `[longitude, latitude]` — here, a dot at each cell with land in it. One `Circle` in data mode draws them all on a canvas, rather than a mark per dot, so it turns smoothly with thousands of them. Closer spacing makes for more, smaller cells.

:example{ name="dot-globe" }

## Columns

On a globe, `z` stands each cell up as a column off the sphere, measured by `zScale` from zero to the largest cell, unless the chart has a `zDomain`. Columns are drawn back to front with their sides shaded like an `isometric` chart's, so they keep their shape as the globe turns. Drag to rotate.

:example{ name="columns" }

::tip
For a flat map raised on an `isometric` chart, use [Bin](/docs/components/Bin) with an equal-area projection — see its isometric map example.
::
