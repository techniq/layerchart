---
description: Use `{#await}` to load each example and source
section: examples
---

<script lang="ts">
	import PromiseExample from '$lib/components/PromiseExample.svelte';
</script>

```svelte
<script lang="ts">
	import PromiseExample from '$lib/components/PromiseExample.svelte';
</script>

<!-- repeat for each example -->
<PromiseExample component="AreaChart" name="basic" />
```

## Example

<PromiseExample component="AreaChart" name="basic" />

## Benefits

- Concise examples (single line, no imports)

## Issues

- Lazy loads each example
- Need to determine how to load contents for search index
