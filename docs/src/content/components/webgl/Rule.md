---
description: 'Marking component drawing reference lines in a WebGL chart: across the plot at a value or its edges, or a line per row.'
category: WebGL marks
related: [Rule, guides/webgl]
components:
  - { name: webgl/Rule, label: Rule }
---

::tip
Part of [`@layerchart/webgl`](/docs/guides/webgl), drawn in a `WebGL` layer. See the [WebGL guide](/docs/guides/webgl) to get started.
::

## Usage

Reference lines with LayerChart's [Rule](/docs/components/Rule) props, on the floor (or `z` pixels above it): `x` / `y` at a value, at the plot's edges (`true`, `'$left'`, `'$top'`, ...), or as an accessor for a line per row, from zero (or the band) to its value. `class` styles them as on any LayerChart mark.

:example{ name="lollipop" }
