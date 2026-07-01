---
title: "layerchart@2.0.0-next.56"
tag: "layerchart@2.0.0-next.56"
date: "2026-04-17T13:34:27Z"
url: "https://github.com/techniq/layerchart/releases/tag/layerchart%402.0.0-next.56"
draft: false
prerelease: true
author: "github-actions[bot]"
---
### Minor Changes

-   feat(Circle, Ellipse): Support pattern/gradient `fill` values on the `<Html>` layer by switching from `background-color` to the `background` shorthand (with `background-origin: border-box` to keep patterns aligned under the border). Accepts values produced by `<Pattern>` / `<LinearGradient>` in HTML mode. ([#449](https://github.com/techniq/layerchart/pull/449))

-   feat(Pattern): Support `<Html>` layer by producing CSS `repeating-linear-gradient` (lines) and `radial-gradient` (circles) values usable as a `background`/`fill`. Gradient-valued `background` (e.g. `<Pattern background={gradient}>`) is also supported. ([#449](https://github.com/techniq/layerchart/pull/449))

### Patch Changes

-   fix(Pattern): Restore canvas layer support by registering as a `group` node so snippet children (e.g. `<Rect fill={pattern}>`) render correctly ([#449](https://github.com/techniq/layerchart/pull/449))

-   fix(Rect): On the `<Html>` layer, set `background-origin: border-box` so fills/patterns start at the outer edge — previously the CSS `background` shorthand reset origin to `padding-box`, shifting patterns inward by `border-width` when a stroke was applied. ([#449](https://github.com/techniq/layerchart/pull/449))

-   fix(Rect, Circle, Ellipse): Apply `box-sizing: border-box` on the `<Html>` layer so the visual extent equals `width`×`height` (or `r * 2`, `rx * 2`×`ry * 2`) — the border is drawn within that extent instead of added to it, matching SVG bounds. ([#449](https://github.com/techniq/layerchart/pull/449))

-   fix(Rect, Circle, Ellipse): On the `<Html>` layer, default `border-width` to `1px` when `stroke` is set without an explicit `strokeWidth`, matching SVG's implicit `stroke-width: 1`. Also ensures Circle/Ellipse `border-width` gets the required `px` unit. ([#449](https://github.com/techniq/layerchart/pull/449))
