---
description: Streamlined visualization which draws curved segment of a chart to represent portions of a circle, such as in pie or radial charts.
section: charts
layers: [svg, canvas]
related: [components/Chart, components/Pie]
---

<script lang="ts">
	import Example from '$lib/components/Example.svelte';
</script>

## Examples

### Basic

<Example name="basic" />

### Gradient with text

<Example name="gradient-with-text" />

### Color

<Example name="color" />

### Track size

<Example name="track-size" />

### Radius (offset)

> If a `*radius` property is negative (ex. `-20`), the value will be applied as an offset from the charts `width` / `height`.

<Example name="radius-offset" />

### Radius (percent)

> If a `*radius` property is `>0` and `<1` (ex: `0.8`), the value will be applied as an offset from the charts `width` / `height`.

<Example name="radius-percent" />

### Radius (fixed)

> If a `*radius` property is `>=1` (ex: `80`), the value will be applied as a discrete value.

<Example name="radius-fixed" />

### Series

<Example name="series" />

### Series (arc)

<Example name="series-arc" />

### Series (90° starting angle)

<Example name="series-start-90" />

### Series (180° starting angle)

<Example name="series-start-180" />

### Series (track color)

<Example name="series-track-color" />

### Series (individual tracks, max value, and color)

<Example name="series-individual" />

### Series (labels)

<Example name="series-labels" />

### Motion (tween)

<Example name="series-motion-tween" />

### Motion (spring)

<Example name="series-motion-spring" />
