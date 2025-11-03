---
description: Visualization combineing multiple chart types or multiple of same chart types to provide a more comprehensive view of the related data.
section: cartesian & polar
layers: ['svg', 'canvas']
related:
  [
    'components/Bars',
    'examples/Bars',
    'examples/Histogram',
    'examples/Sparkbar',
    'examples/DualAxis'
  ]
---

<script lang="ts">
  import Example from '$lib/components/Example.svelte';
</script>

## Examples

### Common scale with extra marks

<Example component="Chart" name="compound-common-scale-with-extra-marks" />

### Separate scales with stacked charts and overridden marks

<Example component="Chart" name="compound-separate-scales-with-stacked-charts-and-overridden-marks" />

### Dual axis with single chart using remapped scale

<Example component="Chart" name="compound-dual-axis-with-single-chart-using-remapped-scale" />

### Dual axis with stacked charts

<Example component="Chart" name="compound-dual-axis-with-stacked-charts" />

### Separate scales with stacked charts with inverted range (top down)

<Example component="Chart" name="compound-separate-scales-with-stacked-charts-with-inverted-range-top-down" />
