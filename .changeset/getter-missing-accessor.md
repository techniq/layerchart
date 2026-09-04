---
'layerchart': patch
---

fix(Chart): Return `undefined` from `xGet`/`yGet` when that axis has no accessor, instead of throwing `accessor is not a function`
