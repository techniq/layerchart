---
'layerchart': minor
---

feat(Chart): Default `seriesLayout` to `'auto'`, so a composable chart stacks when something names layers to stack and overlaps otherwise. A mark handed its own rows, a value that resolves to an interval, and lines are all left alone; pass `seriesLayout="overlap"` where the default reads it wrong.
