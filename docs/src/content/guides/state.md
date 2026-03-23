---
title: State & Context
category: state
order: 1
---

## Settings state / context

Global setttings / defaults

- Default `<Layer>` type
- Debug

```svelte
<script lang="ts">
  import { setSettings, getSettings } from 'layerchart';

  // Set settings (default layer type, debug)
  setSettings({ ... });

  // Get settings (anywhere in component tree)
  const settings = getSettings();
</script>
```

## Chart state / context

Includes all chart state including

- Chart scales (domain, range), value accessors, dimensions (width/height)
- Sub state including:
  - Geo (projection)
  - Tooltip
  - Transform
  - Series
  - Brush

### Context access

#### Composition

```svelte
<Chart>
	{#snippet children({ context })}
		<!-- ex. `context.xScale()` -->
	{/snippet}
</Chart>
```

#### Within a custom component

```svelte
<script lang="ts">
	import { getChartContext } from 'layerchart';
	const ctx = getChartContext();
	// ex. `ctx.xScale()`
</script>
```

#### External to Chart

```svelte
<script lang="ts">
	import { type ChartState } from 'layerchart';
	let context = $state<ChartState>(null!);
</script>

<Chart bind:context}>
	<!-- ... -->
</Chart>
```

## Layer

Get nearest `<Layer>` type (fallback to settings default)

Typically only needed for custom components.

```svelte
<script lang="ts">
	import { getLayerContext } from 'layerchart';

	const layerCtx = getLayerContext(); // => 'svg' | 'canvas' | 'html'
</script>
```
