---
title: "layerchart@2.4.1"
tag: "layerchart@2.4.1"
date: "2026-09-08T20:16:46Z"
url: "https://github.com/techniq/layerchart/releases/tag/layerchart%402.4.1"
draft: false
prerelease: false
author: "github-actions[bot]"
---
### Patch Changes

- fix(deps): Bump `@layerstack/*` dependencies to fix `Package subpath is not defined by exports` when bundling without Vite (issue #913) ([#915](https://github.com/techniq/layerchart/pull/915))

- fix(Spline): Render `startContent`, `endContent`, `markerStart`, and `markerEnd` once per line rather than once per style-split segment ([#914](https://github.com/techniq/layerchart/pull/914))

- fix(Spline): Keep the line's color on segments split by a `class`, `opacity`, or `fill` function ([#914](https://github.com/techniq/layerchart/pull/914))

- fix(Spline): Animate segments split by a style function, which `motion` previously skipped ([#914](https://github.com/techniq/layerchart/pull/914))