---
'layerchart': patch
---

fix(styles): Declare CSS cascade layer order so `components` reliably wins over `base` in production builds. Non-Tailwind consumers can `@import 'layerchart/core.css'` (included by framework presets).
