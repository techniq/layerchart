---
description: Directly import each component and source
category: examples
---

<script lang="ts">
	import { Code } from '@layerstack/docs/components';

	import Basic from '$examples/components/AreaChart/basic.svelte';
	import BasicSource from '$examples/components/AreaChart/basic.svelte?raw';
</script>

```svelte
<script lang="ts">
	import { Code } from '@layerstack/docs/components';

	// repeat for each example
	import Basic from '$examplescomponents/AreaChart/basic.svelte';
	import BasicSource from '$examples/components/AreaChart/basic.svelte?raw';
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
