---
description: Use rehype plugin and wrapper component to populate source
section: examples
---

<script lang="ts">
	import Example from '$lib/components/Example.svelte';

	import Basic from '$examples/AreaChart/basic.svelte';
</script>

```svelte
<script lang="ts">
	import Example from '$lib/components/Example.svelte';

	// repeat for each example
	import Basic from '$examples/AreaChart/basic.svelte';
</script>

<!-- repeat for each example -->
<Example component="AreaChart" name="basic">
	<Basic />
</Example>
```

## Example

<Example component="AreaChart" name="basic">
	<Basic />
</Example>

## Benefits

- Improvement over direct by not requiring source imports
- Should be easier to build search index

## Issues

- Verbose - still needs to load each example (but not source)
- Disconnect between displayed component and loaded source (no match guarantee)
- Less (direct) control over Code component (add copy button, expand/collapse, etc)
