---
description: Mark component which draws rectangles or circles positioned in two ordinal dimensions, ideal for heatmaps, grids, and punchcards.
category: marks
layers: [svg, canvas, html]
related: [Rect, Circle, Bar]
---

## Usage

### Basic

Use `Cell` with two `scaleBand` dimensions to draw a grid of cells. Each cell is automatically sized to the band width and height.

:example{ name="basic" showCode }

### Color scale

Map cell colors to data values using `c`, `cScale`, `cDomain`, and `cRange` on Chart with `fill` on Cell.

:example{ name="color-scale" showCode }

### Rounded with insets

Use `insets` to add spacing between cells and `rx` for rounded corners.

:example{ name="rounded-insets" showCode }

### Circle

Set `shape="circle"` to render circles centered within each cell.

:example{ name="circle" showCode }

### Punchcard

Combine `shape="circle"` with the `r` scale to size circles by a data value, creating a punchcard chart.

:example{ name="punchcard" showCode }
