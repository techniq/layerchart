---
name: Force Disjoint Graph
description: Visualization of nodes positioned using a force-directed layout while preventing overlap by applying disjoint or collision forces between nodes.
section: force
layers: ['Svg', 'Circle', 'Line']
related: ['ForceGraph', 'ForceGroup', 'ForceLattice']
---

<script lang="ts">
  import Example from '$lib/components/Example.svelte';
</script>

## Examples

### Basic

<Example component="ForceSimulation" name="disjoint-graph" />
