---
name: $name
sourceUrl: $sourceUrl
docUrl: $docUrl
---

<script lang="ts">
	import * as easings from 'svelte/easing';
	import * as d3shapes from 'd3-shape';
	import { mdiChevronLeft, mdiChevronRight } from '@mdi/js';

	import {
		ApiDocs,
		Button,
		Field,
		SelectField,
		Switch
	} from 'svelte-ux';

	import api from '$lib/components/Area.svelte?raw&sveld';

	import Chart, { Svg } from '$lib/components/Chart.svelte';
	import Area from '$lib/components/Area.svelte';
	import AxisX from '$lib/components/AxisX.svelte';
	import AxisY from '$lib/components/AxisY.svelte';
	import Baseline from '$lib/components/Baseline.svelte';
	import HighlightLine from '$lib/components/HighlightLine.svelte';
	import Labels from '$lib/components/Labels.svelte';
	import Points from '$lib/components/Points.svelte';
	import Path from '$lib/components/Path.svelte';

	import Preview from '$lib/docs/Preview.svelte';
	import RangeField from '$lib/docs/RangeField.svelte';

	let easing = easings['sineInOut'];
	let pointCount = 10;
	$: data = Array.from({ length: pointCount }).map((_, i) => {
		return {
			x: i + 1,
			y: easing?.(i / pointCount) ?? i
		}
	})

	const easingOptions = Object.entries(easings).map(([key, value]) => {
		return {
			name: key,
			value
		}
	})

	let curve = d3shapes['curveLinear'];
	const curveOptions = Object
		.keys(d3shapes)
		.filter(key => key.startsWith('curve'))
		.filter(key => !key.endsWith('Open') && !key.endsWith('Closed') && !key.endsWith('Bundle'))
		.map(key => {
			return {
				name: key,
				value: d3shapes[key]
			}
		})

	function prev(options, current) {
		const index = options.findIndex(x => x.value === current);
		if (index === 0) {
			return options[options.length - 1].value
		} else {
			return options[index - 1].value
		}
	}

	function next(options, current) {
		const index = options.findIndex(x => x.value === current);
		if (index === options.length - 1) {
			return options[0].value
		} else {
			return options[index + 1].value
		}
	}

	let showPoints = false;
	let showLine = true;
	let tweened = true;
</script>

<div class="grid grid-cols-[1fr,1fr,1fr,auto,auto,auto] gap-2 sticky top-0 z-10">
	<Field label="Path Example" let:id>
		<Button icon={mdiChevronLeft} on:click={() => easing = prev(easingOptions, easing)} class="mr-2" />
		<select bind:value={easing} class="w-full outline-none appearance-none text-sm" {id}>
			{#each easingOptions as option}
				<option value={option.value}>{option.name}</option>
			{/each}
		</select>
		<Button icon={mdiChevronRight} on:click={() => easing = next(easingOptions, easing)} class="ml-2" />
	</Field>
	<Field label="Curve" let:id>
		<Button icon={mdiChevronLeft} on:click={() => curve = prev(curveOptions, curve)} class="mr-2" />
		<select bind:value={curve} class="w-full outline-none appearance-none text-sm" {id}>
			{#each curveOptions as option}
				<option value={option.value}>{option.name}</option>
			{/each}
		</select>
		<Button icon={mdiChevronRight} on:click={() => curve = next(curveOptions, curve)} class="ml-2" />
	</Field>
	<RangeField label="Points" bind:value={pointCount} min={2} />
	<Field label="Show points" let:id>
		<Switch bind:checked={showPoints} {id} />
	</Field>
	<Field label="Line" let:id>
		<Switch bind:checked={showLine} {id} />
	</Field>
	<Field label="Tweened" let:id>
		<Switch bind:checked={tweened} {id} />
	</Field>
</div>

## Playground

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
				<Area {curve} line={showLine} {tweened} />
				{#if showPoints}
					<Points {tweened} />
				{/if}
			</Svg>
		</Chart>
	</div>
</Preview>

# API

<ApiDocs {api} />
