---
description: Geographic component which provides geographic projection and scaling context to children for accurate rendering of geographic data.
category: geo
layers: [svg, canvas]
related: [Chart]
order: 1
---

<script lang="ts">
  import Example from '$lib/components/Example.svelte';
</script>

> Geographic projections / state are integrated into `<Chart geo={...}>` but `GeoProjection` can be used to provide a secondary projection / context, such as for a translucent globe effect

## Playground

<Example name="projection-playground" />
