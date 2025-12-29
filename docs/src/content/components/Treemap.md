---
description: Layout component which visualizes hierarchical data as nested rectangles, where each rectangle’s size represents a quantitative value and nesting reflects the hierarchy.
category: layout
layers: [svg, canvas]
related: []
---

<script lang="ts">
	import { getSettings } from 'layerchart';

	const settings = getSettings()
</script>

{#if settings.layer === 'canvas'}
::warning
Examples broken due to `Group` not positioning [correctly](https://github.com/techniq/layerchart/issues/662) with `Canvas` layers
::
{/if}

## Usage

:example{ name="basic" showCode }

## Playground

:example{ name="playground" }
