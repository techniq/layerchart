---
title: "layerchart@2.3.1"
tag: "layerchart@2.3.1"
date: "2026-08-27T11:33:17Z"
url: "https://github.com/techniq/layerchart/releases/tag/layerchart%402.3.1"
draft: false
prerelease: false
author: "github-actions[bot]"
---
### Patch Changes

- perf(Chart): Resolve a plain-key accessor (`x="date"`) directly instead of re-parsing the path string ([#906](https://github.com/techniq/layerchart/pull/906))

- fix(Chart): Treat an explicit but empty `series` array as authoritative, rather than deriving implicit series from marks ([#906](https://github.com/techniq/layerchart/pull/906))

- perf(Chart): Keep the value domain off the mark registry, so mounting a chart no longer rebuilds its scales — and every path drawn from them — once per mark registered ([#906](https://github.com/techniq/layerchart/pull/906))

- fix(Highlight): Fix crash highlighting `c`-grouped points over nested chart data ([#906](https://github.com/techniq/layerchart/pull/906))

- fix(Highlight): Mark only the hovered row in `quadtree` / `voronoi` tooltips, rather than every row sharing its position ([#906](https://github.com/techniq/layerchart/pull/906))

- feat(Chart): Take the color channel from a mark's own `fill` / `stroke` (`<Circle fill="island">`) when no `c` is declared ([#906](https://github.com/techniq/layerchart/pull/906))

- fix(Tooltip): Center on internal when data snapping (instead of on its leading edge) ([#906](https://github.com/techniq/layerchart/pull/906))

- fix(Tooltip): Fix persistent tooltip when rendered outside Chart container and `pointerEvents` is enabled ([#906](https://github.com/techniq/layerchart/pull/906))