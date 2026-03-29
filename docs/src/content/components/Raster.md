---
description: Composite mark rendering a pixel-based heatmap where each pixel is colored by a scalar value. Supports grid data, scattered data with spatial interpolation, and continuous functions.
category: marks
layers: [svg]
related: [Contour, Density]
---

::tip
To produce contours instead of a heatmap, see the [Contour](/docs/components/Contour) mark.
::

The **raster** mark renders a raster image -- an image formed by discrete pixels in a grid, not a vector graphic like other marks. The raster mark _creates_ an image from abstract data, either from a flat array of grid values, by interpolating spatial samples, or by sampling a continuous function _f_(_x_,_y_).

## Volcano elevation

A raster image of [Maungawhau (Mt. Eden)](https://en.wikipedia.org/wiki/Maungawhau_/_Mount_Eden) in Auckland, NZ, rendered from an 87×61 dense elevation grid.

:example{ name="volcano" showCode }

## With contour overlay

Layer [Contour](/docs/components/Contour) stroke lines over a Raster for the best of both worlds -- continuous color and discrete isolines.

:example{ name="with-contour-overlay" showCode }

## Sampled function

When no data is provided, the raster mark evaluates a continuous function _f_(_x_,_y_) at each pixel. Here, `sin(x) * cos(y)` is colored with a diverging scale.

:example{ name="sampled" showCode }

## Mandelbrot set

The classic fractal rendered pixel-by-pixel via a `value` function. Uses `pixelSize={2}` for faster rendering at the cost of resolution.

:example{ name="mandelbrot" showCode }

## Math functions

Explore various mathematical functions mapped to color scales, demonstrating how different equations produce distinct visual patterns.

:example{ name="math-functions" showCode }
