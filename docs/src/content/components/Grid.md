---
description: Commonly used component which draws horizontal and vertical lines respecting scales across a chart to enhance readability and help align data points with axis values.
section: common
layers: [svg, canvas, html]
related: [Axis, Rule]
---

<script lang="ts">
	import Example from '$lib/components/Example.svelte';
</script>

## Examples

### Basic

<Example name="basic" />

### Padding

Respects padding

<Example name="padding" />

### Single axis (x)

<Example name="x-only" />

### Single axis (y)

<Example name="y-only" />

### Dashed lines

<Example name="dashed-lines" />

### Band scale (align center / default)

<Example name="band-scale-default" />

### Band scale (align between)

<Example name="band-scale-between" />

### Radial

<Example name="radial" />

### Radial (linear)

<Example name="radial-linear" />

### Integer-only ticks

<Example name="integer-only" />

### Explicit ticks

<Example name="explicit-ticks" />

### Inject tick value

<Example name="inject-tick-value" />

### Tick count

<Example name="tick-count" />

### Remove default tick count

<Example name="tick-count-null" />
