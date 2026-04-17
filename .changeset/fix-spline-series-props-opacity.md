---
'layerchart': patch
---

fix(Spline): Restore `series.props.opacity` (and other style props) precedence over the computed series fade opacity. Regression introduced by per-segment styling refactor where the explicit `opacity` was spread after `series.props`, clobbering per-series opacity values (e.g. `series={[{ props: { opacity: 0.1 } }, ...]}`).
