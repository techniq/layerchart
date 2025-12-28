---
description: Layout component which visualizes hierarchical data as nested rectangles, where each rectangle’s size represents a quantitative value and nesting reflects the hierarchy.
category: layout
layers: [svg, canvas]
related: []
---

<script lang="ts">
	import { getSettings } from 'layerchart';
	import Example from '$lib/components/Example.svelte';
	import Blockquote from '$lib/markdown/components/blockquote.svelte';

	const settings = getSettings()
</script>

{#if settings.layer === 'canvas'}

<Blockquote>Examples broken due to Group not positioning correctly with Canvas layers</Blockquote>
{/if}

## Usage

:example{ name="basic" showCode }

## Playground

:example{ name="playground" }
