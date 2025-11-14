---
'layerchart': patch
---

fix(TooltipContext): Revert back to pointer events (instead of mouse/touch) but with `touch-action: pan-y`. Provides simplified events while allowing horizontal scrubbing with vertical scrolling.
