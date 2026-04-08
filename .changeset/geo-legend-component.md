---
'layerchart': minor
---

feat(GeoLegend): New scale-bar legend showing real-world distance for the current `Chart` projection

`GeoLegend` reads the active geo projection from the chart context and renders a labeled scale bar with tick subdivisions. By default it picks a "nice" round distance that covers ~25% of the chart width, but `distance` can be passed for an explicit value. Supports `units="km" | "mi"`, configurable `ticks`, `tickFormat`, `title`, and the standard `placement` props. Inspired by Harry Stevens' [d3-geo-scale-bar](https://observablehq.com/@harrystevens/introducing-d3-geo-scale-bar).
