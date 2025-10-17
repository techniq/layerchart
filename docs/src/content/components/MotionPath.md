---
description: Animate an object along a path
section: other
layers: ['svg']
related: ['components/Spline']
---

<script lang="ts">
  import Example from '$lib/components/Example.svelte';
</script>

## Examples

### Repeat indefinitely

<Example name="repeat-indefinitely" />

### Rotate object with path

<Example name="rotate-object-with-path" />

### Sync with draw

<Example name="sync-with-draw" />

> Because the draw transition and `animateMotion` using different timers, there is no guarantee they will start at the same time
