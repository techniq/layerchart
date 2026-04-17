---
'layerchart': patch
---

fix(ChartState): Don't filter explicit `x1Domain`/`y1Domain` by visible series when no series are configured. Restores grouped layout for composable `<Chart>` usage (e.g. `<Bars>` with `x1`/`x1Domain`/`x1Range`) where the visible-series filter previously emptied the secondary band scale domain, collapsing all bars to a single category position.
