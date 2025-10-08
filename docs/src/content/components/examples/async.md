---
description: Use `experimental.async` to load each example and source
---

<script lang="ts">
	import AsyncExample from '$lib/components/AsyncExample.svelte';
</script>

```svelte
<script lang="ts">
	import AsyncExample from '$lib/components/AsyncExample.svelte';
</script>

<!-- repeat for each example -->
<AsyncExample component="AreaChart" name="basic" />
```

## Example

<AsyncExample component="AreaChart" name="basic" />

## Issues

- Issue with initial page load (SSR?, but is disabled 🤔)
- Issue with build (`pnpm build && pnpm preview`)
  - [set_context_after_init](https://svelte.dev/docs/svelte/runtime-errors#Client-errors-set_context_after_init)
- Need to determine how to load contents for search index
