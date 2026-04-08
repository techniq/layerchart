---
'layerchart': minor
---

feat(CircleLegend): New component for visualizing radius (`rScale`) values as nested circles

`CircleLegend` displays a set of bottom-aligned nested circles representing values from a radius scale, useful alongside bubble maps and scatter charts that encode magnitude via circle area. By default it reads `rScale` from the chart context, but a `scale` prop can also be passed to render standalone.

Supports `tickValues` / `ticks` / `tickFormat` for value selection and formatting, a `title` rendered centered above the circles, and `labelPlacement="right" | "left" | "inline"` to render tick labels with a leader line on either side of the circles or centered inside each circle near the top.
