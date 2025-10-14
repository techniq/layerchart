---
description: Streamlined Chart configuration for Pie charts
section: charts
layers: [svg, canvas]
related: [components/Chart, components/Pie, examples/Arc]
---

<script lang="ts">
	import Example from '$lib/components/Example.svelte';
</script>

## Examples

### Basic

<Example name="basic" />

### onTooltipClick

<Example name="tooltip-click" />

### Radius (offset)

> If a `*radius` property is negative (ex. `-20`), the value will be applied as an offset from the charts `width` / `height`.

<Example name="radius-offset" />

### Radius (percent)

> If a `*radius` property is `>0` and `<1` (ex: `0.8`), the value will be applied as an offset from the charts `width` / `height`.

<Example name="radius-percent" />

### Radius (fixed)

> If a `*radius` property is `>=1` (ex: `80`), the value will be applied as a discrete value.

<Example name="radius-fixed" />

### Donut (innerRadius)

<Example name="donut" />

### Donut with inner text

<Example name="donut-with-text" />

### Arc (range)

<Example name="arc" />

### Segments

<Example name="segments" />

### Series

<Example name="series" />

### Series (props)

<Example name="series-props" />

### Series (arc click)

<Example name="series-click" />

### Arc props

<Example name="arc-props" />

### Legend

<Example name="legend" />

### Legend (placement)

<Example name="legend-placement" />

### Legend (responsive)

<Example name="legend-responsive" />

### Legend (custom label)

<Example name="legend-custom-label" />
