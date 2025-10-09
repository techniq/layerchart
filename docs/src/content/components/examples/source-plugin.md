---
description: Use rehype plugin and wrapper component to populate source
section: examples
---

<script lang="ts">
	import SourceExample from '$lib/components/SourceExample.svelte';

	import Basic from '$examples/AreaChart/basic.svelte';
</script>

```svelte
<script lang="ts">
	import SourceExample from '$lib/components/SourceExample.svelte';

	// repeat for each example
	import Basic from '$examples/AreaChart/basic.svelte';
</script>

<!-- repeat for each example -->
<SourceExample component="AreaChart" name="basic">
	<Basic />
</SourceExample>
```

## Example

<SourceExample component="AreaChart" name="basic">
	<Basic />
</SourceExample>

## Benefits

- Improvement over direct by not requiring source imports
- Should be easier to build search index

## Issues

- Verbose - still needs to load each example (but not source)
- Disconnect between displayed component and loaded source (no match guarantee)
- Less (direct) control over Code component (add copy button, expand/collapse, etc)
