---
'layerchart': minor
---

feat(Axis): Add `tickOcclusion` to drop ticks whose labels would overlap, measuring each label at its rendered size (including rotation). `tickSpacing` only picks a tick count, so a long format still collides at any count that fits the axis. Set `priority` to `'end'` (default), `'start'`, or `'start-end'` to choose which ticks survive
