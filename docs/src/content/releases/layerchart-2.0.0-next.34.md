---
title: "layerchart@2.0.0-next.34"
tag: "layerchart@2.0.0-next.34"
date: "2025-07-28T16:47:35Z"
url: "https://github.com/techniq/layerchart/releases/tag/layerchart%402.0.0-next.34"
draft: false
prerelease: true
author: "github-actions[bot]"
---
### Minor Changes

-   feat(Rule): Support using as data-driven mark (ex. candlestick, lollipop) by default (`<Rule>` using Chart accessors) or passing explicit `x`/`y` accessors (ex. `<Rule y={["high", "low"]} />`). Resolves #64 ([#622](https://github.com/techniq/layerchart/pull/622))

-   breaking(Points): Remove `<Points links>` prop. Use `<Rule>` with x/y accessor instead ([#622](https://github.com/techniq/layerchart/pull/622))

### Patch Changes

-   breaking(Axis): Rename `x="left|right"` and `y="top|bottom"` props with `# LayerChart prefix (ex. `<Axis x="$left">\`) ([#622](https://github.com/techniq/layerchart/pull/622))
