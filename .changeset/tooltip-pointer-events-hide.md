---
'layerchart': patch
---

fix(Tooltip): Hide after the pointer leaves the tooltip when `pointerEvents` is enabled (hovering it suppressed the pending hide, and leaving never re-armed it)
