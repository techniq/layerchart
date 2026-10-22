---
description: Composite mark grouping two-dimensional points into a grid of hexagons, squares, or triangles, to count or summarize what falls in each cell.
category: marks
layers: [svg, canvas]
related: [GeoBin, Density, Contour, Cell, Points]
---

::tip
For a smooth estimate of where points concentrate, see the [Density](/docs/components/Density) mark.
::

The **bin** mark tiles the plot with cells of one `shape` — hexagons, squares, or triangles — and groups points into the cell they fall in. Binning addresses overplotting in dense scatter plots, and summarizes point data on maps.

Points are binned in pixels, after the chart's scales or geo projection place them, so the cells keep their shape however the data is scaled. The first cell is centered on the plot's top-left corner, and only cells with points are drawn.

Each cell is passed to `fill`, `stroke`, `r`, and `z` as `{ x, y, data, count, polygon, area }` — so `fill="count"` names its count, and a function can summarize its rows any other way, ex. `fill={(cell) => mean(cell.data, (d) => d.price)}`. With a `weight`, `count` is the rows' summed weight rather than how many there are.

## Usage

With no `fill`, each cell is colored by its count. Numbers are colored by the chart's `cScale` when it is continuous, re-domained to the cells' values unless `cDomain` is given, otherwise a `YlGnBu` ramp.

:example{ name="basic" showCode }

## Shape and size

`size` is the width of a cell in pixels — the distance between neighboring hexagon centers, a square's side, or a triangle's base. The default is 20.

`grid` outlines every cell of the plot beneath the bins, clipped to the plot. Pass props such as `class` to style it, ex. `grid={{ class: 'stroke-primary/20' }}`.

:example{ name="shapes" }

## Size by count

`r` sizes each cell by a value instead of filling the grid, with area proportional to it and the largest filling its cell.

:example{ name="size-by-count" }

## Categorical

A `fill` returning a category resolves through the chart's `cScale`, here the most common sex in each cell.

:example{ name="categorical" }

## Labels

A `children` snippet receives the cells to draw them yourself, such as with `Text` labels or `Circle`s.

:example{ name="labels" }

## Images

Draw each cell as an image, such as a game's terrain tiles. Here, Maunga Whau's elevation picks a tile from [Kenney's Hexagon Pack](https://kenney.nl/assets/hexagon-pack) for each hexagon.

:example{ name="images" }

On an `isometric` chart, draw each cell yourself as a raised `Path` with its tile on top, back to front.

:example{ name="images-isometric" }

## Isometric

On an `isometric` chart, `z` raises each cell into a prism, measured by `zScale` from zero to the largest cell unless the chart has a `zDomain`. `size` is measured against the floor laid flat, so each cell keeps the same rows as the view turns.

:example{ name="isometric" }

Maps too: here, Walmart stores on an Albers projection, which keeps areas equal so every cell covers the same ground.

:example{ name="walmart-isometric" }

## Geographic

On a geo chart, `x` and `y` are longitude and latitude, binned where the projection places them. Use an equal-area projection so cells cover the same area of ground.

::tip
To bin on the sphere instead — for a globe, or gridded data such as population — see [GeoBin](/docs/components/GeoBin).
::

:example{ name="walmart" }

## Tooltip

Pointer events receive the cell under the pointer.

:example{ name="tooltip" }
