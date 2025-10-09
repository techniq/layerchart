---
description: Directly import each component and source
section: examples
---

<script lang="ts">
	import Code from '$lib/components/Code.svelte';

	import Basic from '$examples/AreaChart/basic.svelte';
	import BasicSource from '$examples/AreaChart/basic.svelte?raw';
</script>

```svelte
<script lang="ts">
	import Code from '$lib/components/Code.svelte';

	// repeat for each example
	import Basic from '$examples/AreaChart/basic.svelte';
	import BasicSource from '$examples/AreaChart/basic.svelte?raw';
</script>

<!-- repeat for each example -->
<Basic />
<Code source={BasicSource} />
```

## Example

<Basic />
<Code source={BasicSource} />

## Benefits

- Most straightforward
- Should be easier to build search index

## Issues

- Very verbose - import each example and source and instantiate each
