---
'@layerchart/webgl': minor
---

feat: `Text` takes core's `fillOpacity`, `strokeOpacity`, and `opacity` (static or per row), for labels lying on the surface and `viewport` labels
feat: `Circle` and `Points` take core's `dashArray`, dashing their flat rings
feat: `Highlight` takes core's `onPointClick`, `onPointEnter`, and `onPointLeave`, called with its point and row
feat: `Axis` takes core's `tickOcclusion`, dropping tick labels that would overlap across a flat chart
fix: raised `Contour` lines honour `smooth={false}`
