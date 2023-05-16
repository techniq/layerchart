<script lang="ts">
	import { ApiDocs } from 'svelte-ux';

	import { interpolateRgb, interpolateLab, interpolateHclLong } from 'd3-interpolate';
	import * as d3chromatic from 'd3-scale-chromatic';
	import { scaleQuantize } from 'd3-scale';
	import { range } from 'd3-array';

	import { Button, NumberStepper, TextField } from 'svelte-ux';
	import { mdiMinus, mdiPlus } from '@mdi/js';

	import api from '$lib/components/ColorRamp.svelte?raw&sveld';

	import Chart, { Svg } from '$lib/components/Chart.svelte';
	import ColorRamp from '$lib/components/ColorRamp.svelte';

	import Preview from '$lib/docs/Preview.svelte';

	let width = '100%';
	let height = 20;
	let steps = 5;

	const interpolators = Object.entries(d3chromatic).filter(([key, value]) =>
		key.startsWith('interpolate')
	);
	interpolators.push([`interpolateRgb('red', 'blue')`, interpolateRgb('red', 'blue')]);
	interpolators.push([`interpolateLab('red', 'blue')`, interpolateLab('red', 'blue')]);
	interpolators.push([`interpolateHclLong('red', 'blue')`, interpolateHclLong('red', 'blue')]);

	const schemes = Object.entries(d3chromatic).filter(([key, value]) => key.startsWith('scheme'));
</script>

<h1>Examples</h1>

<h2>Basic</h2>

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

<h2>Pixelated</h2>

<div class="inline-flex gap-3 items-center mb-1 ml-4">
	<span class="text-sm text-black/50">Steps:</span>
	<NumberStepper bind:value={steps} />
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

<h2>Schemes</h2>

<Preview>
	<div class="grid gap-4">
		{#each schemes as [name, scheme]}
			{#if typeof scheme[[0]] === 'string'}
				<div>
					<div class="text-sm">{name}</div>
					<svg {width} {height}>
						<ColorRamp
							interpolator={scaleQuantize([0, 1], scheme)}
							{width}
							{height}
							style="image-rendering: pixelated"
						/>
					</svg>
				</div>
			{:else}
				{#each scheme as s, i}
					{#if Array.isArray(s)}
						<div>
							<div class="text-sm">{name}[{i}]</div>
							<svg {width} {height}>
								<ColorRamp
									interpolator={scaleQuantize([0, 1], s)}
									{width}
									{height}
									style="image-rendering: pixelated"
								/>
							</svg>
						</div>
					{/if}
				{/each}
			{/if}
		{/each}
	</div>
</Preview>

<h1>API</h1>

<ApiDocs {api} />
