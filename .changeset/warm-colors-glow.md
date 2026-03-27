---
'layerchart': minor
---

feat: Support continuous color scales via `cScale` prop without requiring `cRange`

- Allow `cScale` (e.g. `scaleSequential(interpolateTurbo)`) to activate without `cRange`, enabling pre-configured sequential/diverging color scales
- Guard `createScale` against undefined `range` to avoid breaking interpolator-based scales
- Auto-detect numeric `cDomain` values and use `extent` instead of `unique`, producing correct `[min, max]` domains for continuous scales
- Prefer `cScale` color over default series color in tooltip/highlight when a color scale is configured
