---
'@layerchart/webgl': minor
---

feat: Layer-agnostic marks and `Layer` (`type="webgl"`), drawing core's versions in `Svg`, `Canvas`, and `Html` layers so one chart can switch between all four; import WebGL-only marks from `@layerchart/webgl/webgl`
feat: `Bar`, `Circle`, `Graticule`, `Group`, `Line`, and `Path`, and LayerChart's compound marks built from them (`Pie`, `Labels`, `Calendar`, `Month`, `Cell`, `BoxPlot`, `Frame`, `Hull`, `GeoPoint`, `AnnotationPoint`, `AnnotationLine`, `Violin`, `Trail`, `Density`, `Ribbon`)
feat: Marks take core's `motion`, `key`, and `initial*` props, easing in as core's do
feat: Lines and paths take core's `draw`, `marker*`, `startContent` / `endContent`, and `dashArray`
feat: Marks take core's `fillOpacity`, `strokeOpacity`, `seriesKey`, pointer handlers, and the `--fill-color` / `--stroke-color` their classes or `style` set
feat(Area): Stack as core's, and take `line`, `stroke`, and `pathData`
feat(Axis): `top` / `right` / `angle` / `radius` placements, `grid`, rule markers, `tickOcclusion`, `tickMultiline`, `labelPlacement`, `label` / `tickLabel` snippets, tick label `rotate` / anchors / `dx` / `dy`, and `padding="auto"`
feat(Bars): Flat 2D bars without a `z`, with core's `insets`, `radius` / `rounded`, `stackPadding`, `x1` / `y1` sub-bands, fixed `width` / `height`, and `children`
feat(Bin): `r`, `grid`, `class`, and `children`
feat(Contour): Flat filled bands as core's, raised bands as terraces or colored outlines, and `blur`, `smooth`, and a `z` function
feat(GeoPath): `curve`, `geoTransform`, and `children`
feat(Grid): Radial spokes and circles (`radialY`), per-axis line props, `bandAlign`, and `classes`
feat(Highlight): `area`, `bar`, and point, area, and bar click handlers
feat(Link): Core's paths (`type`, `curve`, `orientation`, `sweep`, `radius`, `bend`, `sankey`, `radial`), one link as `data`, and `pathData`
feat(Points): `offsetX` / `offsetY`, `children`, `viewport`, and a point per value of a multi-value `x` / `y`
feat(Raster): `blur` and `imageRendering="crisp-edges"`
feat(GeoRaster): `resolution`
feat(GeoTile): `group` and `children`
feat(Rect): `insets`, `rx` / `corners`, and `shade`
feat(Spline): `fill`, `pathData`, and `class` / `opacity` functions styling each run of rows (ex. dashed across missing data)
feat(Text): Font from its `class`, `segments`, `path` / `startOffset` / `dominantBaseline`, and `capHeight`
feat: `Spline`, `Area`, `Points`, `Axis`, and `Grid` draw `radial` charts
fix(GeoPath): Default to no fill and a `var(--color-surface-content)` outline, as core's
fix(Grid): Draw only the lines turned on (ex. `<Grid x />`), as core's
fix(Text): Default `textAnchor` to `start`, as core's
fix: A class's own fill or stroke (including `fill-none` / `stroke-none`) wins over a mark's `fill` / `stroke` prop, as CSS does in core's layers
fix: `opacity` dims a mark's outlines and lines
fix: `Bars`, `Polygon`, and `Rect` default to `var(--color-surface-content)`, as core's
fix(Axis): Ticks, tick labels, and titles placed, sized, and counted as core's
fix(Highlight): Point each series at the hovered row, as core's (ex. a stack's bands)
fix(Bin): Keep its cells as an isometric view turns
fix(Spline): Follow a stack's top, break at a map's edge, and default to 1px
fix(Text): Clean label halos, and take its class's fill and text color
fix: Draw every mark of a flat chart with very many (ex. a `Calendar`'s day cells)
perf(Text): Reuse label paintings as labels move between marks or change size slightly
