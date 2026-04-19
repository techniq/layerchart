---
'layerchart': major
---

breaking: Merge `Connector` into `Link`, remove `Connector` component

`Link` now supports both **pixel mode** (`x1`/`y1`/`x2`/`y2` props) and **data mode** (`data` + `source`/`target`/`x`/`y` accessors), mirroring the pattern used by primitives like `Circle`, `Text`, and `Rect`.

**Migration:**

- `<Connector source={{...}} target={{...}} ... />` → `<Link x1={...} y1={...} x2={...} y2={...} ... />`
- `<Link explicitCoords={{ x1, y1, x2, y2 }} />` → `<Link {x1} {y1} {x2} {y2} />` (or `<Link {...linkPositions[i]} />`)

All Connector props (`type`, `curve`, `sweep`, `radius`, `bend`, `orientation`, `radial`, markers, motion) are available directly on `Link`. The `explicitCoords` prop and `Connector` export are removed.
