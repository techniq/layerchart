---
description: Composite mark showing the estimated density of two-dimensional point clouds using kernel density estimation, rendered as contour bands.
category: marks
layers: [svg]
related: [Contour, Raster, Points]
---

::tip
For contours of spatially-distributed quantitative values, see the [Contour](/docs/components/Contour) mark.
::

The **density** mark shows the estimated density of two-dimensional point clouds. Contours guide the eye towards areas of local concentration, similar to how topographic maps show elevation. This is particularly useful when addressing overplotting in dense datasets.

It uses a Gaussian kernel with a specified **bandwidth** (radius of influence per point), summed across a discrete grid, with contours extracted using the [marching squares](https://en.wikipedia.org/wiki/Marching_squares) algorithm. Uses d3-contour's `contourDensity()` internally.

## Usage

The [Old Faithful](https://en.wikipedia.org/wiki/Old_Faithful) geyser dataset shows two distinct clusters of eruption duration vs. waiting time, revealed by density contours overlaid with individual data points.

:example{ name="basic" showCode }

## Bandwidth

Control the smoothness of the density estimate. Lower bandwidth shows more local detail; higher bandwidth produces smoother contours. The default is 20.

:example{ name="bandwidth" showCode }

## Thresholds

Control the number of contour levels. With _n_ thresholds and a maximum density of _d_, contour lines are drawn at _d_/_n_, 2_d_/_n_, etc.

:example{ name="thresholds" showCode }

## Stroke-only contours

Set `fill="none"` and `stroke` to render as isolines instead of filled bands.

:example{ name="stroke-only" showCode }

## Geographic density

Density of Walmart store locations across the US, overlaid with state boundaries and individual store points. Use an equal-area projection with the density mark.

:example{ name="walmart" showCode }
