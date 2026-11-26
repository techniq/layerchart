---
'@layerchart/webgl': minor
---

feat: `Line`, `Path`, and `Link` take `marker`, `markerStart`, `markerMid`, and `markerEnd`, drawn in the line's color as the core `Marker` types
feat: `Line` takes `motion`, `key`, and `initialX1` / `initialY1` / `initialX2` / `initialY2` to ease in from
feat: `Line` takes `dashArray`
feat: `Line`, `Path`, `Link`, `Polygon`, and `Vector` take `strokeOpacity`, and `Polygon` and `Vector` `fillOpacity`
feat: `Path` takes `draw`, and `startContent` / `endContent` (drawn in a `Group` at its ends)
feat: `Link` takes `sankey` and `radial`, as the core `Link`
feat: `Polygon` takes `motion`, `key`, and `initialCx` / `initialCy` / `initialR` to ease in from
feat: `Vector` takes `motion`, `key`, and `initialX` / `initialY` / `initialLength` to ease in from
feat: `Graticule` takes the `GeoPath` props it draws with, including its own `geojson`, as the core `Graticule`
