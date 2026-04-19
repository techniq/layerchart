---
'layerchart': minor
---

feat(Connector): Add `'swoop'` connector type

New `'swoop'` connector type draws a circular arc between source and target, equivalent to ObservablePlot's Arrow `bend` option. Configured via a new `bend` prop (degrees, default `22.5`) — positive bends right (clockwise from source to target), negative bends left, `0` draws a straight line. Works in both cartesian and radial modes; `Link` forwards it automatically.
