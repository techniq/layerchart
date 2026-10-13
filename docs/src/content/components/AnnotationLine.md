---
description: Annotation component drawing a straight marker across the chart to indicate a specific value, trend, or threshold.
category: annotations
layers: [svg, canvas, html]
related: [AnnotationPoint, AnnotationRange]
---

## Usage

:example{ name="horizontal" showCode }

## Customization

### Custom label

Pass a `label` snippet to render your own markup. It receives the resolved label `props` (`x`, `y`, `textAnchor`, `verticalAnchor`, …) to position it with.

:example{ name="custom-label" showCode }

### Custom line

Pass a `line` snippet to draw the line yourself. It receives the resolved `x1`/`y1`/`x2`/`y2` (and `props.line`) to spread.

:example{ name="custom-line" showCode }
