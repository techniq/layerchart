---
description: 'Composite mark drawing isolines to delineate regions above and below a particular continuous value. Supports grid data, scattered data with spatial interpolation, and continuous functions. In a WebGL layer, its lines lie flat or rise to their heights.'
category: WebGL surfaces
related: [Contour, guides/webgl]
components:
  - { name: webgl/Contour, label: Contour }
---

::tip
Part of [`@layerchart/webgl`](/docs/guides/webgl), drawn in a `WebGL` layer. See the [WebGL guide](/docs/guides/webgl) to get started.
::

## Usage

Contour lines on their own: flat at `z` pixels (ex. over a `Raster`), or each raised to its threshold's height with `z="value"`. It takes values the same ways as [Surface](/docs/components/webgl/Surface).

:example{ name="basic" }
