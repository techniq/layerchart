---
title: "layerchart@0.74.0"
tag: "layerchart@0.74.0"
date: "2025-01-20T15:07:26Z"
url: "https://github.com/techniq/layerchart/releases/tag/layerchart%400.74.0"
draft: false
prerelease: false
author: "github-actions[bot]"
---
### Minor Changes

-   breaking(Bar|Bars): Replaced `inset: number` prop with `insets: Insets | undefined`. ([#321](https://github.com/techniq/layerchart/pull/321))

    To migrate from `inset` to `insets` replace `inset = n` with:

    -   `insets = { x: n / 2 }` if `orientation="vertical"`
    -   `insets = { y: n / 2 }` if `orientation="horizontal"`

-   feat(BarChart): Add `stackPadding` prop, which adds a padding between stacked bars. ([#321](https://github.com/techniq/layerchart/pull/321))
