---
title: 'layerchart@2.0.0-next.13'
tag: 'layerchart@2.0.0-next.13'
date: '2025-05-29T12:37:48Z'
url: 'https://github.com/techniq/layerchart/releases/tag/layerchart%402.0.0-next.13'
draft: false
prerelease: true
author: 'github-actions[bot]'
---

### Patch Changes

- feat: Support passing `FormatConfig` (ex. `{ type: '...', options: { ... } }`) anywhere `FormatType` is supported to simplify custom formatting (ex. `variant`) ([#521](https://github.com/techniq/layerchart/pull/521))

- feat: Support passing `PeriodTypeCode` strings for simplified date formatting and reduce imports. Example: `format={PeriodType.Day}` is now `format="day"`. Also supported with config object for passing additional options (ex. `format={{ type: 'day', options: { variant: 'long' } }}`). Supported for all `format` props include Axis, Labels, Legend and Tooltip. ([#521](https://github.com/techniq/layerchart/pull/521))
