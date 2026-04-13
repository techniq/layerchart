---
description: Composite mark drawing isolines to delineate regions above and below a particular continuous value. Supports grid data, scattered data with spatial interpolation, and continuous functions.
category: marks
layers: [svg]
related: [Density, Hull, Raster, GeoPath]
---

::tip
To produce a heatmap instead of contours, see the [Raster](/docs/components/Raster) mark. For contours of estimated point density, see the [Density](/docs/components/Density) mark.
::

The **contour** mark draws isolines computed by applying the [marching squares](https://en.wikipedia.org/wiki/Marching_squares) algorithm to a discrete grid. The grid can be constructed from a flat array of values, by interpolating spatial samples, or by sampling a continuous function _f_(_x_,_y_).

## Contour lines

Contour lines of [Maungawhau (Mt. Eden)](https://en.wikipedia.org/wiki/Maungawhau_/_Mount_Eden) in Auckland, NZ, derived from an 87×61 dense elevation grid.

:example{ name="volcano-lines" showCode }

## Filled contours

Filled contour bands of the same Maungawhau elevation data, colored by threshold level using a sequential color scale.

:example{ name="volcano-filled" showCode }

## Interactive controls

Adjust the number of **thresholds** and **blur** radius interactively.

:example{ name="volcano-filled-interactive" showCode }

## Sampled function

When no data is provided, the contour mark evaluates a continuous function _f_(_x_,_y_) at each pixel in the grid. Here, `sin(x) * cos(y)` is colored with a diverging scale.

:example{ name="sampled" showCode }

## Interactive sampled

Adjust thresholds and blur on a sampled function.

:example{ name="sampled-interactive" showCode }
