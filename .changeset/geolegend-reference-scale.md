---
'layerchart': minor
---

feat: Support pre-projected topologies in `GeoLegend` via `referenceScale`

Add a `referenceScale` prop to `GeoLegend` for charts that render pre-projected data with `geoIdentity` (e.g. `us-atlas`'s `counties-albers-10m` / `states-albers-10m`, pre-projected with `geoAlbersUsa().scale(1300)`). When provided, pixels-per-distance is derived from the chart's fit scale and the supplied base scale, bypassing the `projection.invert` + `geoDistance` path which only works for real lon/lat projections. The `GeoPath` bubble-map example now renders a correct scale bar.
