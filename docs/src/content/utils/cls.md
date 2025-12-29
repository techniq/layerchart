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

<script lang="ts">
  import Example from '$lib/components/Example.svelte';
  import { cls } from '@layerstack/tailwind';
</script>

## Usage

### cls()

<div class={cls('grid place-items-center rounded p-2 bg-error-500', true && 'bg-success-500')}>clsx allows for conditional class additions<br />tailwind-merge dedups overlapping classes</div>
<br />
<Example name="cls" resize={false} showcode />
