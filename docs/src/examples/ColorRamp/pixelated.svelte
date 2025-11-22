<script lang="ts">
	import { interpolateRgb, interpolateLab, interpolateHclLong } from 'd3-interpolate';
	import * as d3chromatic from 'd3-scale-chromatic';
	import StepsControl from '$lib/components/controls/ColorRampControls.svelte';

	import { ColorRamp } from 'layerchart';
	import { entries } from '@layerstack/utils';

	let width = $state('100%');
	let height = $state(20);
	let steps = $state(5);

	const interpolators: [string, (value: number) => string][] = entries<any, any>(
		d3chromatic
	).filter(([key]) => key.startsWith('interpolate'));
	interpolators.push([`interpolateRgb('red', 'blue')`, interpolateRgb('red', 'blue')]);
	interpolators.push([`interpolateLab('red', 'blue')`, interpolateLab('red', 'blue')]);
	interpolators.push([`interpolateHclLong('red', 'blue')`, interpolateHclLong('red', 'blue')]);
</script>

<StepsControl bind:steps />

<div class="grid gap-4 h-100">
	{#each interpolators as [name, interpolator]}
		<div>
			<div class="text-sm">{name}</div>
			<svg {width} {height}>
				<ColorRamp {interpolator} {width} {height} {steps} class="[image-rendering:pixelated]" />
			</svg>
		</div>
	{/each}
</div>
