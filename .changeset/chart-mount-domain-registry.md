---
'layerchart': patch
---

perf(Chart): Keep the value domain off the mark registry, so mounting a chart no longer rebuilds its scales — and every path drawn from them — once per mark registered
