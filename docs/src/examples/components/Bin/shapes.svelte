<script module lang="ts">
	import { getOlympians } from '$lib/data.remote.js';
	const olympians = await getOlympians();
</script>

<script lang="ts">
	import { Axis, Bin, type BinShape, Chart, ChartClipPath, Layer } from 'layerchart';
	import { Field, RangeField, Switch, ToggleGroup, ToggleOption } from 'svelte-ux';

	const data = olympians.filter((d) => d.weight != null && d.height != null);
	export { data };

	let shape = $state<BinShape>('hexagon');
	let size = $state(20);
	let showGrid = $state(true);
</script>

<div class="grid grid-cols-[auto_1fr_auto] gap-2 mb-4">
	<Field label="Shape">
		<ToggleGroup bind:value={shape} variant="outline">
			<ToggleOption value="hexagon">Hexagon</ToggleOption>
			<ToggleOption value="square">Square</ToggleOption>
			<ToggleOption value="triangle">Triangle</ToggleOption>
		</ToggleGroup>
	</Field>
	<RangeField label="Size" bind:value={size} min={6} max={60} step={1} />
	<Field label="Grid" let:id>
		<Switch {id} bind:checked={showGrid} />
	</Field>
</div>

<Chart
	{data}
	x="weight"
	y="height"
	xNice
	yNice
	xPadding={[size, size]}
	yPadding={[size, size]}
	padding={{ left: 30, bottom: 24, top: 8, right: 8 }}
	height={400}
>
	<Layer>
		<Bin {shape} {size} />
		{#if showGrid}
			<!-- Every cell, with nothing in it, outlined — clipped, as the edge cells cross the axes -->
			<ChartClipPath>
				<Bin data={[]} {shape} {size} empty fill="none" class="stroke-surface-content/10" />
			</ChartClipPath>
		{/if}
		<Axis placement="left" grid rule />
		<Axis placement="bottom" rule />
	</Layer>
</Chart>
