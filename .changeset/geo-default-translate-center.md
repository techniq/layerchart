---
'layerchart': patch
---

fix: Default geo projection `translate` to container center when `translate` and `fitGeojson` are not specified, instead of using d3-geo's fixed default (`[480, 250]`)
