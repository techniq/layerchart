---
description: Marking component which encloses a set of data points within a convex boundary to highlight clusters or groupings on a chart.
section: marks
layers: [svg, canvas]
related: []
---

<script lang="ts">
  import Example from '$lib/components/Example.svelte';
</script>

## Usage

<Example name="scatter" showCode />

## Geo context

Hull can also be used within a geo context (i.e. `<Chart geo={{ projection: ... }}>`)

<Example name="geo" />
