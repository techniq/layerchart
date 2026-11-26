---
'@layerchart/webgl': minor
---

feat: `Contour` takes `blur`, `smooth`, `fill`, `fillOpacity`, `strokeOpacity`, and `opacity`, and a band property or function for `z`
feat: `Raster` takes `blur`, and `imageRendering="crisp-edges"`
feat: `GeoRaster` takes `resolution`
feat: `GeoTile` takes `group` and `children`
feat: `GeoPath` takes `onclick`, `curve`, `geoTransform`, `children`, `fillOpacity`, and `strokeOpacity`
feat: `Grid` takes per-axis line props (`x`, `y`, `z`), `bandAlign`, `classes`, and `motion`
feat: `Highlight` takes `bar`, `onAreaClick`, and `onBarClick`, and an `area` snippet
feat: `Axis` takes `labelPlacement`, `label` and `tickLabel` snippets, `tickMultiline`, `scale`, `domain`, `stroke`, `fill`, `classes`, `motion`, rule and grid line props, and `Group` placement (`x`, `y`, `opacity`, `seriesKey`, ...)
fix: `GeoPath`'s `opacity` dims its outlines
