---
description: Annotation component marking a specific data value or coordinate on a chart to highlight key events or notable points.
category: annotations
layers: [svg, canvas, html]
related: [AnnotationLine, AnnotationRange, Link, Circle, Text]
---

## Usage

:example{ name="line-to-point" showCode }

## Callouts

Pass `link` (or `link={{ type: 'swoop', ... }}` etc.) to draw a `<Link>` from
the ring edge to the label.
:example{ name="link-callouts" showCode }

## Playground

:example{ name="playground" }
