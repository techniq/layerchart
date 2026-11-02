---
description: 'Mark coloring a grid of values on the floor of a WebGL chart, as an image.'
category: WebGL surfaces
related: [Raster, guides/webgl]
components:
  - { name: webgl/Raster, label: Raster }
---

::tip
Part of [`@layerchart/webgl`](/docs/guides/webgl), drawn in a `WebGL` layer. See the [WebGL guide](/docs/guides/webgl) to get started.
::

## Usage

The values as an image on the floor (or `z` pixels above it), sampled as finely as the image allows rather than at a surface's vertices. It takes values the same ways as [Surface](/docs/components/webgl/Surface), and `imageRendering="pixelated"` shows each cell with hard edges.

:example{ name="basic" }
