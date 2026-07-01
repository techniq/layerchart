<script module lang="ts">
	import { getVolcano } from '$lib/data.remote.js';
	const volcano = await getVolcano();
</script>

<script lang="ts">
	import { scaleSequential } from 'd3-scale';
	import { interpolateTurbo } from 'd3-scale-chromatic';
	import { Axis, Chart, Contour, Layer } from 'layerchart';
	import { RangeField } from 'svelte-ux';

	let thresholds = $state(20);
	let blur = $state(0);
</script>

<div class="grid grid-cols-2 gap-4 mb-4">
	<RangeField label="Thresholds" bind:value={thresholds} min={2} max={40} step={1} />
	<RangeField label="Blur" bind:value={blur} min={0} max={10} step={0.5} />
</div>

<Chart
	cScale={scaleSequential(interpolateTurbo)}
	padding={{ left: 30, bottom: 24, top: 8, right: 8 }}
	height={400}
>
	<Layer>
		<Axis placement="left" rule />
		<Axis placement="bottom" rule />
		<Contour
			data={volcano.values}
			width={volcano.width}
			height={volcano.height}
			{thresholds}
			{blur}
		/>
	</Layer>
</Chart>
