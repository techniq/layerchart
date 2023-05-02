<script lang="ts">
	import * as easings from 'svelte/easing';
	import * as d3shapes from 'd3-shape';
	import { group } from 'd3-array';
	import { mdiChevronLeft, mdiChevronRight } from '@mdi/js';

	import {
		ApiDocs,
		Button,
		Field,
		SelectField,
		Switch
	} from 'svelte-ux';

	import api from '$lib/components/Path.svelte?raw&sveld';

	import Chart, { Svg } from '$lib/components/Chart.svelte';
	import AxisX from '$lib/components/AxisX.svelte';
	import AxisY from '$lib/components/AxisY.svelte';
	import Baseline from '$lib/components/Baseline.svelte';
	import HighlightLine from '$lib/components/HighlightLine.svelte';
	import Labels from '$lib/components/Labels.svelte';
	import Points from '$lib/components/Points.svelte';
	import Path from '$lib/components/Path.svelte';

	import Preview from '$lib/docs/Preview.svelte';
	import RangeField from '$lib/docs/RangeField.svelte';

	let amplitude = 1;
	let frequency = 10;
	let phase = 0;

	let pathName = 'sin';
	let pointCount = 100;

	$: mathOptions = [
		{ name: 'sin', group: 'math', value: x => amplitude * Math.sin((x) * frequency) + phase},
		{ name: 'cos', group: 'math', value: x => amplitude * Math.cos((x) * frequency) + phase},
		{ name: 'tan', group: 'math', value: x => amplitude * Math.tan((x) * frequency) + phase},
		{ name: 'sqrt', group: 'math', value: x => amplitude * Math.sqrt((x) * frequency) + phase},
		{ name: 'ceil', group: 'math', value: x => amplitude * Math.ceil((x) * frequency) + phase},
		{ name: 'floor', group: 'math', value: x => amplitude * Math.floor((x) * frequency) + phase},
		{ name: 'round', group: 'math', value: x => amplitude * Math.round((x) * frequency) + phase},
		{ name: 'random', group: 'math', value: x => amplitude * Math.random() + phase},
		{ name: 'pow', group: 'math', value: x => amplitude * Math.pow((x), frequency) + phase},
	]

	const easingOptions = Object.entries(easings).map(([key, value]) => {
		return {
			name: key,
			group: 'easing',
			value
		}
	})

	$: pathOptions = [...mathOptions, ...easingOptions]
	$: pathOptionsByGroup = group(pathOptions, d => d.group)

	$: pathGenerator = pathOptions.find(d => d.name === pathName).value;
	$: data = Array.from({ length: pointCount }).map((_, i) => {
		return {
			x: i + 1,
		  y: pathGenerator(i / pointCount) ?? i
		}
	})

	let curve = d3shapes['curveLinear'];
	const curveOptions = Object
		.keys(d3shapes)
		.filter(key => key.startsWith('curve'))
		.filter(key => !key.endsWith('Open') && !key.endsWith('Closed'))
		.map(key => {
			return {
				name: key.replace('curve', ''),
				value: d3shapes[key]
			}
		})

	function prev(options, current, value = 'value') {
		const index = options.findIndex(x => x[value] === current);
		if (index === 0) {
			return options[options.length - 1][value]
		} else {
			return options[index - 1][value]
		}
	}

	function next(options, current, value = 'value') {
		const index = options.findIndex(x => x[value] === current);
		if (index === options.length - 1) {
			return options[0][value]
		} else {
			return options[index + 1][value]
		}
	}

	let showPoints = false;
	let tweened = true;
</script>

# Examples

<div class="grid gap-2">
	<div class="grid grid-cols-[1fr,1fr,1fr,auto,auto] gap-2">
		<Field label="Path Example" let:id>
			<Button icon={mdiChevronLeft} on:click={() => pathName = prev(pathOptions, pathName, 'name')} class="mr-2" />
			<select bind:value={pathName} class="w-full outline-none appearance-none text-sm" {id}>
				{#each [...pathOptionsByGroup] as [group, options]}
					<optgroup label={group}>
						{#each options as option}
							<option value={option.name}>{option.name}</option>
						{/each}
					</optgroup>
				{/each}
			</select>
			<Button icon={mdiChevronRight} on:click={() => pathName = next(pathOptions, pathName, 'name')} class="ml-2" />
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
		<Field label="Tweened" let:id>
			<Switch bind:checked={tweened} {id} />
		</Field>
	</div>
	<div class="grid grid-cols-[1fr,1fr,1fr] gap-2">
		<RangeField label="Frequency" bind:value={frequency} min={1} />
		<RangeField label="Amplitude" bind:value={amplitude} min={1} />
		<RangeField label="Phase" bind:value={phase} min={1} />
	</div>
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
				<Path {curve} {tweened} />
				{#if showPoints}
					<Points {tweened} />
				{/if}
			</Svg>
		</Chart>
	</div>
</Preview>

# API

<ApiDocs {api} />
