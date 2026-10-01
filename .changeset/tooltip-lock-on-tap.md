---
'layerchart': patch
---

fix(TooltipContext): Keep a tooltip locked from `onclick` on touch (a tap's `pointerleave` precedes `click`, and its pending hide cleared the data under the lock), and hide it once unlocked if the pointer left while locked
