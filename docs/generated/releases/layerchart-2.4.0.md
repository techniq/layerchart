---
title: "layerchart@2.4.0"
tag: "layerchart@2.4.0"
date: "2026-09-04T14:33:43Z"
url: "https://github.com/techniq/layerchart/releases/tag/layerchart%402.4.0"
draft: false
prerelease: false
author: "github-actions[bot]"
---
### Minor Changes

- feat(Axis): Add `tickOcclusion` to drop ticks whose labels would overlap, measured at the size they render (including rotation), with `priority` of `'end'` (default), `'start'`, or `'start-end'` to choose which survive ([#909](https://github.com/techniq/layerchart/pull/909))

- feat(utils): Add `rotate` and multiline support to `getTextRect`, so a rotated or stacked `<Text>` can be measured for `occlude` without the caller reproducing `<Text>`'s pivot ([#909](https://github.com/techniq/layerchart/pull/909))

### Patch Changes

- fix(Area): Apply `mask`, `filter`, and `clip-path` to the `line` path as well as the fill (unless overrideden by `line={{...}}`) ([#909](https://github.com/techniq/layerchart/pull/909))

- fix(Calendar): Adjust month labels after recent Text verticalAnchor improvements ([#909](https://github.com/techniq/layerchart/pull/909))

- fix(Calendar): Size cells to fit `monthPath`, which can extend past the last cell when the range ends mid-month ([#909](https://github.com/techniq/layerchart/pull/909))

- perf(Chart): Measure the container before building the subtree, so marks are only built once ([#909](https://github.com/techniq/layerchart/pull/909))

- fix(downloadImage, downloadSvg): Inline `stop-color`/`stop-opacity` so gradients don't export as solid black ([#909](https://github.com/techniq/layerchart/pull/909))

- fix(Chart): Return `undefined` from `xGet`/`yGet` when that axis has no accessor, instead of throwing `accessor is not a function` ([#909](https://github.com/techniq/layerchart/pull/909))

- fix(Spline, Area): Animate each path when the mark is split by `z`, which `motion` previously skipped — segments split by a style function are still redrawn outright ([#909](https://github.com/techniq/layerchart/pull/909))

- fix(Path, Spline): Render `endContent` without a `draw` transition ([#909](https://github.com/techniq/layerchart/pull/909))