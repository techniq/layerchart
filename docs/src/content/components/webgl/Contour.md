---
description: 'Mark tracing contour lines through a grid of values in a WebGL chart, flat or raised to their heights.'
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
