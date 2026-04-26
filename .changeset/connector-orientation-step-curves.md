---
'layerchart': patch
---

fix(Connector, Link): Orient d3 step curves by `orientation`

- Added `orientation?: 'horizontal' | 'vertical'` prop to `Connector` (defaults to `'horizontal'`). `Link` forwards its own orientation so step curves step along the natural flow direction.
- `curveStep`, `curveStepBefore`, and `curveStepAfter` now step along `y` in vertical orientation instead of always stepping along `x`.
