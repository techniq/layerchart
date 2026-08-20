---
title: "layerchart@2.1.0"
tag: "layerchart@2.1.0"
date: "2026-08-06T15:07:11Z"
url: "https://github.com/techniq/layerchart/releases/tag/layerchart%402.1.0"
draft: false
prerelease: false
author: "github-actions[bot]"
---
### Minor Changes

- feat(Labels): Add `layout="voronoi"` to place each label towards Voronoi cell's centroid, `occlude` to drop overlapping labels and `links` to move labels to centroid with a leader line back to the point. ([#892](https://github.com/techniq/layerchart/pull/892))

- feat(Points|Labels): Project through the chart's geo projection when present, so `<Points>` (and `<Labels>`) render on maps. ([#892](https://github.com/techniq/layerchart/pull/892))

- feat(Voronoi): Add `children` snippet exposing per-cell geometry (`point`, `polygon`, `centroid`, `area`) for custom rendering (e.g. labels). ([#892](https://github.com/techniq/layerchart/pull/892))

- feat(AnnotationPoint): Support explicit `labelX`/`labelY` positioning, a `fontSize` prop, a `labelGap` for callout spacing, and a `labelPlacement="smart"` option that auto-orients the label and terminates its callout at the label edge. ([#892](https://github.com/techniq/layerchart/pull/892))

- feat(GeoState): Support `clipExtent: true` to clip the projection to the chart dimensions (`[[0, 0], [width, height]]`), e.g. to trim the `Sphere` overflow under `geoMercator`. ([#892](https://github.com/techniq/layerchart/pull/892))

### Patch Changes

- fix(Text|Labels): Anchor `verticalAnchor` by cap-height so text sits a consistent distance from marks and aligns across the Svg, Canvas, and Html layers. `placement="smart"` labels now clear the point marker on all sides. ([#893](https://github.com/techniq/layerchart/pull/893))