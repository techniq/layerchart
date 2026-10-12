---
description: Annotation component highlighting a continuous span or interval on a chart to emphasize specific data ranges or thresholds.
category: annotations
layers: [svg, canvas, html]
related: [AnnotationLine, AnnotationPoint]
---

## Usage

:example{ name="vertical-with-pattern-range" showCode }

## Customization

### Custom label

Pass a `label` snippet to render your own markup (and a `rect` snippet to draw the range yourself). Each receives the resolved `props` to position it with.

:example{ name="custom-label" showCode }
