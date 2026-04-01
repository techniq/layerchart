---
'layerchart': patch
---

fix(ChartState): Don't create spurious implicit series when mark accessor matches chart's own axis accessor, fixing domain corruption for heatmap/Cell charts
