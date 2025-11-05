---
description: Marking component which applies data points connected by smooth, curved lines to show trends or patterns over a continuous range.
section: marks
layers: [svg, canvas]
related: [components/MotionPath, components/LineChart]
---

<script lang="ts">
  import Example from '$lib/components/Example.svelte';
</script>

> See also: [LineChart](/docs/components/LineChart) for simplified examples

## Playground

<Example name="playground" />

## Examples

### draw

<Example name="draw" />

### tweened

<Example name="tweened" />

### markers / arrows

<Example name="markers-arrows" />

### basic start and end snippets

<Example name="basic-start-and-end-snippets" />

### label using start/end snippets

<Example name="label-using-start-end-snippets" />

### end snippet with draw

<Example name="end-snippet-with-draw" />

### end slot with draw with value

<Example name="end-slot-with-draw-with-value" />

- Because the draw transition and tweened store use different timers, there is no guarantee they will start at the same time
