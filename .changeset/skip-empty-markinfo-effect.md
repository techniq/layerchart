---
'layerchart': patch
---

perf: Skip mark-info `$effect` for pixel-mode primitives

`registerComponent` now probes `markInfo()` once at construction; if the result is initially empty (pixel-mode primitives where `cx`/`cy`/`r`/etc. are numbers rather than string/function accessors), it skips creating the tracking `$effect` entirely. Saves one effect frame per primitive — adds up in mark-heavy scenes (force simulations, scatter plots with hundreds of nodes).

Trade-off: a primitive that starts in pixel mode and later flips to data mode at runtime (e.g. `cx` mutates from a number to a string) will not register a mark. Mark mode is typically static; if a chart needs runtime data-mode marks, define an explicit `series` on the chart instead.
