---
title: "layerchart@2.0.0-next.65"
tag: "layerchart@2.0.0-next.65"
date: "2026-06-04T15:48:25Z"
url: "https://github.com/techniq/layerchart/releases/tag/layerchart%402.0.0-next.65"
draft: false
prerelease: true
author: "github-actions[bot]"
---
### Patch Changes

- fix: Remove TypeScript `as` casts from `class={...}` attributes in `Path` and `GeoPoint` to fix unocss compat. ([#449](https://github.com/techniq/layerchart/pull/449))

- fix: guard against undefined accessor in printScale ([#875](https://github.com/techniq/layerchart/pull/875))

  When activeGetters includes z or r scales that are not configured, the accessor is undefined, causing acc.toString() to throw. Added null check.