---
description: Layout component which visualizes hierarchical data as nested rectangles, where each rectangle’s size represents a quantitative value and nesting reflects the hierarchy.
section: hierarchy
layers: [svg, canvas]
related: [examples/Treemap]
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

## Examples

### Playground

<Example name="playground" />

### Complex

<Example name="complex" />

### Basic

<Example name="basic" />
