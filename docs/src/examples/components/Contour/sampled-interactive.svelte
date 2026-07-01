<script lang="ts">
	import { scaleSequential } from 'd3-scale';
	import { interpolateRdBu } from 'd3-scale-chromatic';
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
	cScale={scaleSequential(interpolateRdBu)}
	xDomain={[0, 6 * Math.PI]}
	yDomain={[0, 4 * Math.PI]}
	padding={{ left: 30, bottom: 24, top: 8, right: 8 }}
	height={400}
>
	<Layer>
		<Axis placement="left" grid rule />
		<Axis placement="bottom" rule />
		<Contour value={(x, y) => Math.sin(x) * Math.cos(y)} {thresholds} {blur} />
	</Layer>
</Chart>
