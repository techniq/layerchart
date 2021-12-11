---
title: ['Primatives', 'Path']
---

<script lang="ts">
	import * as easings from 'svelte/easing';
	import * as d3shapes from 'd3-shape';

	import {
		Field,
		SelectField,
		Switch
	} from 'svelte-ux';

	import Chart, { Svg } from '$lib/components/Chart.svelte';
	import Area from '$lib/components/Area.svelte';
	import AxisX from '$lib/components/AxisX.svelte';
	import AxisY from '$lib/components/AxisY.svelte';
	import Baseline from '$lib/components/Baseline.svelte';
	import HighlightLine from '$lib/components/HighlightLine.svelte';
	import Label from '$lib/components/Label.svelte';
	import Points from '$lib/components/Points.svelte';
	import Path from '$lib/components/Path.svelte';

	import Preview from '$lib/docs/Preview.svelte';

	let easing = easings['sineInOut'];
	let pointCount = 10;
	$: data = Array.from({ length: pointCount }).map((_, i) => {
		return {
			x: i + 1,
			y: easing?.(i / pointCount) ?? i
		}
	})

	let curve = d3shapes['curveLinear'];
	const curveOptions = Object
		.keys(d3shapes)
		.filter(key => key.startsWith('curve'))
		.map(key => {
			return {
				name: key,
				value: d3shapes[key]
			}
		})

	const easingOptions = Object.entries(easings).map(([key, value]) => {
		return {
			name: key,
			value
		}
	})

	let showPoints = false;
</script>

<div class="grid grid-cols-4 gap-2">
	<SelectField label="Path Example" items={easingOptions} bind:value={easing} />
	<SelectField label="Curve" items={curveOptions} bind:value={curve} />
	<Field label="Count" let:id>
		<input type="range" bind:value={pointCount} min={2} max={500} {id} class="h-6" /> <span class="ml-4 text-sm text-black/50">{pointCount}</span>
	</Field>
	<Field label="Show points" let:id>
		<Switch bind:checked={showPoints} {id} />
	</Field>
</div>

## Basic

<Preview>
	<div class="h-[300px] p-4 border rounded">
		<Chart
			{data}
			x="x"
			y="y"
			yNice
			padding={{ left: 16, bottom: 24 }}
		>
			<Svg>
				<AxisY gridlines />
				<AxisX />
				<Baseline x y />
				<Path {curve} />
				{#if showPoints}
					<Points />
				{/if}
			</Svg>
		</Chart>
	</div>
</Preview>
