---
'layerchart': patch
---

perf: Skip motion container allocation when `motion` prop is `undefined`

Primitive state classes (`Circle`, `Group`, `Path`, `Rect`, `Line`, `Ellipse`, `Image`, `Text`, `Polygon`, `Arc`, `Pie`, `Area`, `Spline`) previously allocated 1–4 `createMotion` passthrough containers per instance even when no `motion` prop was provided. Containers are now lazily allocated only when the user opts in; otherwise the `motion*` getters read directly from props. Saves per-instance allocations and one layer of getter indirection on every render — most visible in mark-heavy scenes (e.g. force simulations with 100+ nodes/links rendering `Circle` and `Link` → `Path` → `Group`).
