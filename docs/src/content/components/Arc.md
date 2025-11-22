---
description: Primitive component which draws a curved segment on a chart to represent portions of a whole or highlight specific data ranges.
section: primitives
layers: [svg, canvas]
related: [Pie, ArcChart, PieChart]
---

<script lang="ts">
	import Example from '$lib/components/Example.svelte';
</script>

> See also: [ArcChart](/docs/components/ArcChart) and [PieChart](/docs/components/PieChart) for simplified examples

## Usage

<Example name="partial-arc" showCode />

## Text along path

`Arc` can be used with the `children` snippet, `getArcTextProps`, and `Text` to write text along the `inner`, `outer`, or `middle` of the arc path.

The text will smartly orientate based on the direction (clockwise / counter-clockwise) and location (top, bottom, left, right) of the arc

<Example name="label-direction" />

## Playground

<Example name="playground" />
