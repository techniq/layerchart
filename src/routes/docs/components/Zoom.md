---
component: $component
filename: $filename
---

<script lang="ts">
	import * as d3shapes from 'd3-shape';
	import { cubicOut } from 'svelte/easing';

	import { ApiDocs, Button, Field, Switch, Tooltip } from 'svelte-ux';

	import { mdiArrowULeftTop, mdiChevronLeft, mdiChevronRight, mdiMagnifyPlusOutline, mdiMagnifyMinusOutline, mdiImageFilterCenterFocus } from '@mdi/js';

	import api from '$lib/components/Zoom.svelte?raw&sveld';

	import Chart, { Svg } from '$lib/components/Chart.svelte';
	import Circle from '$lib/components/Circle.svelte';
	import Path from '$lib/components/Path.svelte';
	import Points from '$lib/components/Points.svelte';
	import Zoom from '$lib/components/Zoom.svelte';

	import Preview from '$lib/docs/Preview.svelte';

	import { getSpiral } from '$lib/utils/genData';
	import { degreesToRadians } from '$lib/utils/math';

	let zoom;
	let pointCount = 500;
	let angle = 137.5; // 
	let showPoints = true;
	let showPath = false;
	let tweened = true;

	$: data = getSpiral({ angle, radius: 10, count: pointCount, width: 500, height: 500 })

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
</script>

# Examples

<div class="grid grid-cols-[1fr,1fr,auto,auto,1fr,auto] gap-2 mb-2">
	<Field label="Points" let:id>
		<Button icon={mdiChevronLeft} on:click={() => pointCount -= (pointCount > 2 ? 1 : 0)} class="mr-2" />
		<input type="range" bind:value={pointCount} min={1} max={2000} {id} class="h-6 w-full" /> <span class="ml-4 text-sm text-black/50">{pointCount}</span>
		<Button icon={mdiChevronRight} on:click={() => pointCount += 1} class="ml-2" />
	</Field>
	<Field label="Angle" let:id>
		<Button icon={mdiChevronLeft} on:click={() => angle -= 1} class="mr-2" />
		<input type="range" bind:value={angle} min={1} max={360} {id} class="h-6 w-full" /> <span class="ml-4 text-sm text-black/50">{angle}</span>
		<Button icon={mdiChevronRight} on:click={() => angle += 1} class="ml-2" />
	</Field>
	<Field label="Show points" let:id>
		<Switch bind:checked={showPoints} {id} />
	</Field>
	<Field label="Show path" let:id>
		<Switch bind:checked={showPath} {id} />
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
	<Field label="Tweened" let:id>
		<Switch bind:checked={tweened} {id} />
	</Field>
</div>

<Preview>
	<div class="h-[500px] p-4 border rounded relative overflow-hidden">
		<div class="absolute top-0 right-0 z-10">
			<div class="bg-black/5 rounded-full m-1 backdrop-blur">
				<Tooltip title="Zoom in">
					<Button icon={mdiMagnifyPlusOutline} on:click={() => zoom.increase()} class="text-black/50 p-2" />
				</Tooltip>
				<Tooltip title="Zoom out">
					<Button icon={mdiMagnifyMinusOutline} on:click={() => zoom.decrease()} class="text-black/50 p-2" />
				</Tooltip>
				<Tooltip title="Center">
					<Button icon={mdiImageFilterCenterFocus} on:click={() => zoom.translateCenter()} class="text-black/50 p-2" />
				</Tooltip>
				<Tooltip title="Reset">
					<Button icon={mdiArrowULeftTop} on:click={() => zoom.reset()} class="text-black/50 p-2" />
				</Tooltip>
			</div>
		</div>
		<Chart {data} x="x" y="y">
			<Svg>
				<Zoom bind:this={zoom} tweened={{ duration: 800, easing: cubicOut }}>
					{#if showPath}
						<Path curve={curve} {tweened} />
					{/if}
					{#if showPoints}
						<Points let:points>
							{#each points as point, index}
								<Circle cx={point.x} cy={point.y} r={2} class={index % 2 ? "fill-blue-500" : "fill-green-500"} {tweened} />
							{/each}
						</Points>
					{/if}
				</Zoom>
			</Svg>
		</Chart>
	</div>
</Preview>

# API

<ApiDocs {api} />
