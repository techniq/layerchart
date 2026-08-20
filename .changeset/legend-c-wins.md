---
'layerchart': patch
---

fix(Legend): List the `c` categories rather than series inferred from marks, so a chart coloured by `c` isn't relabelled by whatever a mark's accessor happens to be called. Adds `context.cNamesGroups`.
