---
title: 'layerchart@0.70.0'
tag: 'layerchart@0.70.0'
date: '2025-01-12T18:39:18Z'
url: 'https://github.com/techniq/layerchart/releases/tag/layerchart%400.70.0'
draft: false
prerelease: false
author: 'github-actions[bot]'
---

### Minor Changes

- feat: Improve Canvas implementation with render registration system including synchronized invalidation / redrawing ([#295](https://github.com/techniq/layerchart/pull/295))

- feat: Support Canvas context for most primatives (Arc, Area, Circle, Group, Line, LinearGradient, Rect, Spline, and Text). Also updates components using these primatives (Axis, Bar, Grid, Rule, and more) ([#295](https://github.com/techniq/layerchart/pull/295))

- feat: Update all simplified charts to support `renderContext` prop to switch between Svg (default) and Canvas (AreaChart, BarChart, LineChart, PieChart, and ScatterChart) ([#295](https://github.com/techniq/layerchart/pull/295))

- feat: Add `renderPathData()` canvas util to simplify rendering SVG path data onto canvas context with CSS variable and class support ([#295](https://github.com/techniq/layerchart/pull/295))

- feat: Add `renderRect()` canvas util to simplify rendering rectangles onto canvas context with CSS variable and class support ([#295](https://github.com/techniq/layerchart/pull/295))

- feat: Add `renderText()` canvas util to simplify rendering text onto canvas context with CSS variable and class support ([#295](https://github.com/techniq/layerchart/pull/295))

- feat: Add `ComputedStyles` component to easily resolve classes / CSS variable values (useful when working with <canvas>) ([#295](https://github.com/techniq/layerchart/pull/295))

- feat(Canvas): Support `center` prop (similar to `Svg`) to translate children to center (useful for radial layouts) ([#295](https://github.com/techniq/layerchart/pull/295))

- breaking(LinearGradient|RadialGradient): Rename `url` slot prop to `gradient`. Improves name, especially within canvas context ([#295](https://github.com/techniq/layerchart/pull/295))

- breaking(GeoPath): Simplify render prop use case by leveraging renderPathData() (ex. HitCanvas) ([#295](https://github.com/techniq/layerchart/pull/295))

- breaking: Reduce likihood of clipping for Canvas-rendered simplified charts by increasing default padding (and add top)) ([#295](https://github.com/techniq/layerchart/pull/295))

### Patch Changes

- fix(Canvas): Support multiple children (fix infinite loops, coordinating redraws, etc). Resolves issue #158 ([#295](https://github.com/techniq/layerchart/pull/295))

- feat: Add `scaleCanvas` util ([#295](https://github.com/techniq/layerchart/pull/295))

- feat: Add `spikePath()` util ([#295](https://github.com/techniq/layerchart/pull/295))

- feat: Add `clearCanvasContext()` util ([#295](https://github.com/techniq/layerchart/pull/295))

- fix(circlePath): Correctly handle sweep argument ([#295](https://github.com/techniq/layerchart/pull/295))
