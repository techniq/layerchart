---
description: Utility function wrapper around tailwind-merge and clsx for easy style overrides.
category: tools
layers: []
related:
  [
    /docs/components/BrushContext/selection,
    https://github.com/dcastil/tailwind-merge,
    https://github.com/lukeed/clsx,
    https://www.layerstack.dev/docs/tailwind/utils
  ]
---

## Usage

### [clsx()](https://github.com/lukeed/clsx)

```svelte live
<script lang="ts">
	import { cls } from '@layerstack/tailwind';
</script>

<div class={cls('text-center p-2 bg-error-500', true && 'bg-success-500')}>
	{`class={cls('bg-error-500', true && 'bg-success-500')}`}<br />becomes<br />class="bg-success-500"
</div>
```

### [twMerge()](https://github.com/dcastil/tailwind-merge)

```svelte live
<script lang="ts">
	import { cls } from '@layerstack/tailwind';
</script>

<div class={cls('text-center p-2 bg-red-500 bg-info-500')}>last class wins with tailwind-merge</div>
```