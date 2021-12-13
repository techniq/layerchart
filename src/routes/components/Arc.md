---
title: ['Primatives', 'Arc']
---

<script lang="ts">
	import { mdiChevronLeft, mdiChevronRight } from '@mdi/js';

	import {
		Button,
		Field,
		SelectField,
		Switch
	} from 'svelte-ux';

	import Chart, { Svg } from '$lib/components/Chart.svelte';
	import Arc from '$lib/components/Arc.svelte';

	import Preview from '$lib/docs/Preview.svelte';

	let value = 50;
	let domain = [0, 100];
	let range = [-120, 120];
	let innerRadius = 50;
	let outerRadius = 60;
	let cornerRadius = 5;

	const labelOptions = [
		{ name: 'None', value: undefined },
		{ name: 'SVG Center', value: 'svg-center'},
		{ name: 'Arc Center', value: 'arc-center'},
		{ name: 'Arc Bottom', value: 'arc-bottom'},
		{ name: 'Arc Centroid', value: 'arc-centroid'},
	]
	let label = 'svg-center';

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

<div class="grid grid-cols-[1fr,1fr,1fr,1fr] gap-2 sticky top-0 z-10">
	<Field label="Value" let:id class="col-span-3">
		<Button icon={mdiChevronLeft} on:click={() => value -= 1} class="mr-2" />
		<input type="range" bind:value={value} min={domain[0]} max={domain[1]} {id} class="h-6 w-full" /> <span class="ml-4 text-sm text-black/50">{value}</span>
		<Button icon={mdiChevronRight} on:click={() => value += 1} class="ml-2" />
	</Field>
	<!--  -->
	<Field label="Label" let:id>
		<Button icon={mdiChevronLeft} on:click={() => label = prev(labelOptions, label)} class="mr-2" />
		<select bind:value={label} class="w-full outline-none appearance-none text-sm" {id}>
			{#each labelOptions as option}
				<option value={option.value}>{option.name}</option>
			{/each}
		</select>
		<Button icon={mdiChevronRight} on:click={() => label = next(labelOptions, label)} class="ml-2" />
	</Field>
	<!--  -->
	<Field label="Domain Min" let:id>
		<Button icon={mdiChevronLeft} on:click={() => domain[0] -= 1} class="mr-2" />
		<input type="range" bind:value={domain[0]} min={0} max={domain[1]} {id} class="h-6 w-full" /> <span class="ml-4 text-sm text-black/50">{domain[0]}</span>
		<Button icon={mdiChevronRight} on:click={() => domain[0] += 1} class="ml-2" />
	</Field>
	<!--  -->
	<Field label="Domain Max" let:id>
		<Button icon={mdiChevronLeft} on:click={() => domain[1] -= 1} class="mr-2" />
		<input type="range" bind:value={domain[1]} min={0} max={1000} {id} class="h-6 w-full" /> <span class="ml-4 text-sm text-black/50">{domain[1]}</span>
		<Button icon={mdiChevronRight} on:click={() => domain[1] += 1} class="ml-2" />
	</Field>
	<!--  -->
	<Field label="Range Min (degrees)" let:id>
		<Button icon={mdiChevronLeft} on:click={() => range[0] -= 1} class="mr-2" />
		<input type="range" bind:value={range[0]} min={-360} max={360} {id} class="h-6 w-full" /> <span class="ml-4 text-sm text-black/50">{range[0]}</span>
		<Button icon={mdiChevronRight} on:click={() => range[0] += 1} class="ml-2" />
	</Field>
	<!--  -->
	<Field label="Range Max (degrees)" let:id>
		<Button icon={mdiChevronLeft} on:click={() => range[1] -= 1} class="mr-2" />
		<input type="range" bind:value={range[1]} min={-360} max={360} {id} class="h-6 w-full" /> <span class="ml-4 text-sm text-black/50">{range[1]}</span>
		<Button icon={mdiChevronRight} on:click={() => range[1] += 1} class="ml-2" />
	</Field>
	<!--  -->
	<Field label="Inner radius" let:id>
		<Button icon={mdiChevronLeft} on:click={() => innerRadius -= 1} class="mr-2" />
		<input type="range" bind:value={innerRadius} min={0} max={outerRadius} {id} class="h-6 w-full" /> <span class="ml-4 text-sm text-black/50">{innerRadius}</span>
		<Button icon={mdiChevronRight} on:click={() => innerRadius += 1} class="ml-2" />
	</Field>
	<!--  -->
	<Field label="Outer radius" let:id>
		<Button icon={mdiChevronLeft} on:click={() => outerRadius -= 1} class="mr-2" />
		<input type="range" bind:value={outerRadius} min={innerRadius} max={200} {id} class="h-6 w-full" /> <span class="ml-4 text-sm text-black/50">{outerRadius}</span>
		<Button icon={mdiChevronRight} on:click={() => outerRadius += 1} class="ml-2" />
	</Field>
	<!--  -->
	<Field label="Corner radius" let:id>
		<Button icon={mdiChevronLeft} on:click={() => cornerRadius -= 1} class="mr-2" />
		<input type="range" bind:value={cornerRadius} min={0} max={(outerRadius - innerRadius) / 2} {id} class="h-6 w-full" /> <span class="ml-4 text-sm text-black/50">{cornerRadius}</span>
		<Button icon={mdiChevronRight} on:click={() => cornerRadius += 1} class="ml-2" />
	</Field>
</div>

## Arc

<Arc {value} {domain} {range} {innerRadius} {outerRadius} {cornerRadius} {label} />

## Spring

<Arc {value} {domain} {range} {innerRadius} {outerRadius} {cornerRadius} {label} spring />
