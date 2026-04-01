---
'layerchart': patch
---

fix(LinearGradient, RadialGradient): Register as `group` instead of `mark` in canvas component tree so wrapped children (e.g. Arc, Path) are rendered
