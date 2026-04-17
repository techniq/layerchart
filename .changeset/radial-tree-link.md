---
'layerchart': minor
---

feat(Tree, Link, Connector): Add radial support

`Tree` now detects `<Chart radial>` and lays out with `d3.tree().size([2π, min(width, height)/2])` plus radial separation. Nodes emit polar coords (`x` = angle, `y` = radius).

`Connector` gains a `radial` prop (defaults to `ctx.radial`) that interprets `source`/`target` as polar and dispatches to new `getConnectorRadialPresetPath` / `getConnectorRadialD3Path` helpers. Radial behavior per connector `type`:

- `straight` — straight cartesian line
- `square` — radial → arc at midR → radial
- `beveled` — chord at source radius with chamfered corner (controlled by `radius`)
- `rounded` — visx LinkRadialCurve Bezier
- `d3` — `d3.linkRadial` by default; with a `curve` prop, `curveStep` / `curveStepBefore` / `curveStepAfter` map to polar arcs/radials, other curves go through `d3.lineRadial`

`Link` forwards `radial` to `Connector` automatically when inside a radial `<Chart>`.
