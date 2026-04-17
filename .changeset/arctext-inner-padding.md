---
'layerchart': minor
---

feat(Arc): Add `innerPadding` option to `getArcTextProps` / `getTrackTextProps`

`ArcTextOptions` now supports an `innerPadding` option, symmetric to the existing `outerPadding`. Positive values shrink the inner radius used to build the `inner`/`middle` arc text paths, moving text inward (toward the chart center). Previously, offsetting an `inner`-placed arc label away from the arc edge required overriding the path manually; now it works the same as `outerPadding` does for `outer` text.
