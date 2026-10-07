---
description: Marking component which represents data as proportional slices of a circle, showing the relative contribution of each category to the whole.
category: marks
layers: [svg, canvas]
related: [Arc, PieChart]
---

::tip
See also: [PieChart](/docs/components/PieChart) for simplified examples
::

## Usage

:example{ name="basic" showCode }

## Isometric

On an [isometric](/docs/guides/isometric) chart, `z` stands every slice up, drawn back to front — a 3D pie, or with an `innerRadius` a donut. `ArcLabel` callouts given the same `z` keep clear of the sides. Drag to turn it.

:example{ name="isometric" }
