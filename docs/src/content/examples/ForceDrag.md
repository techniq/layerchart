---
name: Force Drag
description: Visualization of force-directed layout that allows users to interactively drag and reposition nodes while maintaining dynamic force-based relationships with or without sticky behavior.
section: force
layers: ['svg', 'canvas']
related: ['https://observablehq.com/@d3/sticky-force-layout']
---

<script lang="ts">
  import Example from '$lib/components/Example.svelte';
</script>

## Examples

### Basic

<Example component="ForceSimulation"  name="graph-drag" />
