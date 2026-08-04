---
description: Interaction component which creates Voronoi diagrams to divide a plane according to the nearest points, aiding spatial analysis and visualization.
category: interactions
layers: [svg, canvas]
related: [TooltipContext, AnnotationPoint]
---

## Usage

:example{ name="radius" showCode }

## Labels

Use the `children` snippet to render custom content from the computed cell
geometry. Each cell provides its `data`, `point`, `polygon`, `centroid`, and
`area`, which can be used to place non-overlapping labels — orienting each label
towards the open space of its cell (the centroid) and hiding labels for crowded
cells.

:example{ name="labels" showCode }

### Geographic

Within a geo `<Chart>`, the same cell geometry is available (projected to pixel
space), which can place map labels away from their point and towards the open
space of each cell.

:example{ name="geo-labels" showCode }
