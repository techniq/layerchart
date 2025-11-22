---
description: Marking component which displays text directly on a chart to identify or annotate specific data points.
section: marks
layers: [svg, canvas]
related: []
---

<script lang="ts">
  import Example from '$lib/components/Example.svelte';
</script>

## Usage

<Example component="Bars" name="vertical-outside-labels-default" showCode />

## Bar charts

By default labels will be on the outside of bars, above for positive values and below for negative values

<Example component="Bars" name="vertical-outside-labels-default" showCode />

You can also use `placement="inside"` to place within the bars (near the value)

<Example component="Bars" name="vertical-inside-labels" />

## Line charts

<Example component="Spline" name="with-labels" />

## Scatter charts

<Example component="Points" name="with-labels" />

## Simplified charts

Labels are also integrated in simplified charts via the `labels` prop

<Example component="BarChart" name="labels" />
