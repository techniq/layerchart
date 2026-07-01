---
description: Marking component which encloses a set of data points within a convex boundary to highlight clusters or groupings on a chart.
category: marks
layers: [svg, canvas]
related: [Contour, Density, Voronoi]
---

The `Hull` mark draws a [convex hull](https://en.wikipedia.org/wiki/Convex_hull) — the tightest convex boundary enclosing a set of points, like stretching a rubber band around pins on a board. It is useful for highlighting clusters or groupings in scatter plots. Supports both Cartesian and geo projections.

## Usage

:example{ name="scatter" showCode }

### Geo context

Hull can also be used within a geo context (i.e. `<Chart geo={{ projection: ... }}>`)

:example{ name="geo" }
