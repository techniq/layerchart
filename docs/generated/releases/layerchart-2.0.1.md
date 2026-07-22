---
title: "layerchart@2.0.1"
tag: "layerchart@2.0.1"
date: "2026-07-02T15:13:11Z"
url: "https://github.com/techniq/layerchart/releases/tag/layerchart%402.0.1"
draft: false
prerelease: false
author: "github-actions[bot]"
---
### Patch Changes

- fix(styles): Declare CSS cascade layer order so `components` reliably wins over `base` in production builds. Non-Tailwind consumers can `@import 'layerchart/core.css'` (included by framework presets). ([#883](https://github.com/techniq/layerchart/pull/883))

- fix(styles): Normalize mistyped `@layer component` → `@layer components` in Tooltip and Layer components. ([#883](https://github.com/techniq/layerchart/pull/883))