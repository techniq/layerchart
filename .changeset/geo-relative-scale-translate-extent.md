---
'layerchart': minor
---

feat(Chart): In projection mode, `scaleExtent` and `translateExtent` are now interpreted as relative values (like d3-zoom). `scaleExtent: [0.5, 8]` means 0.5x to 8x of the fitted projection scale. `translateExtent` is offset from the initial fitted position in pixels.
