---
'layerchart': minor
---

feat: Add data mode to primitive components (Circle, Ellipse, Group, Line, Polygon, Rect, Text)

Primitives now accept string or function accessors for positional props (e.g. `x="date"`, `y={d => d.value}`) to automatically resolve values through chart scales and iterate over data. Components also accept an optional `data` prop to override chart context data.

Color properties (`fill`, `stroke`) can also be data-driven, resolving per-item through the chart's color scale (`cScale`). String values are disambiguated: data property names resolve through `cScale`, while literal CSS colors pass through unchanged.
