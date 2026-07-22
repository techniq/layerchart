---
title: "layerchart@2.0.2"
tag: "layerchart@2.0.2"
date: "2026-07-18T20:55:52Z"
url: "https://github.com/techniq/layerchart/releases/tag/layerchart%402.0.2"
draft: false
prerelease: false
author: "github-actions[bot]"
---
### Patch Changes

- fix(Chart): Fix chart rendering blank when `brush` and `transform` are combined under Svelte's experimental async mode by lazy-loading interaction contexts via `$effect`/`{#if}` instead of nested `{#await import()}`. ([#885](https://github.com/techniq/layerchart/pull/885))