---
name: $name
sourceUrl: $sourceUrl
docUrl: $docUrl
---

<script lang="ts">
	import { ApiDocs } from 'svelte-ux';

	import {
		interpolateViridis,
		interpolateTurbo,
		interpolatePiYG,
		interpolateRdBu,
		interpolateBlues,
		schemePurples,
		schemeSpectral,
		schemeRdBu,
	} from 'd3-scale-chromatic';
	import * as d3chromatic from 'd3-scale-chromatic';

	import { Button, TextField } from 'svelte-ux';
	import { mdiMinus, mdiPlus } from '@mdi/js';

	import api from '$lib/components/ColorRamp.svelte?raw&sveld';

	import Chart, { Svg } from '$lib/components/Chart.svelte';
	import ColorRamp from '$lib/components/ColorRamp.svelte';

	import Preview from '$lib/docs/Preview.svelte';

	let width = '100%';
	let height = 20;
	let steps = 3;

	const interpolators = Object.entries(d3chromatic)
		.filter(([key, value]) => key.startsWith('interpolate'))

	const schemes = Object.entries(d3chromatic)
		.filter(([key, value]) => key.startsWith('scheme'))
</script>

# Examples

## Basic

<Preview>
	<div class="grid gap-4">
		{#each interpolators as [name, interpolator]}
			<div>
				<div class="text-sm">{name}</div>
				<svg {width} {height}>
					<ColorRamp {interpolator} {width} {height} />
				</svg>
			</div>
		{/each}
	</div>
</Preview>

## Pixelated

<div class="inline-flex gap-3 items-center mb-1 ml-4">
	<span class="text-sm text-black/50">Steps:</span>
	<TextField type="integer" bind:value={steps} align="center" class="w-24">
		<div slot="prepend" class="flex">
			<Button icon={mdiMinus} on:click={() => (steps -= 1)} />
		</div>
		<div slot="append" class="flex">
			<Button icon={mdiPlus} on:click={() => (steps += 1)} />
		</div>
	</TextField>
</div>

<Preview>
	<div class="grid gap-4">
		{#each interpolators as [name, interpolator]}
			<div>
				<div class="text-sm">{name}</div>
				<svg {width} {height}>
					<ColorRamp {interpolator} {width} {height} {steps} style="image-rendering: pixelated" />
				</svg>
			</div>
		{/each}
	</div>
</Preview>

# API

<ApiDocs {api} />
