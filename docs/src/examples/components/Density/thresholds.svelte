<script module lang="ts">
	import { getFaithful } from '$lib/data.remote.js';
	const data = await getFaithful();
</script>

<script lang="ts">
	import { Axis, Chart, Density, Layer, Points } from 'layerchart';
	import { RangeField } from 'svelte-ux';


	let thresholds = $state(20);
</script>

<div class="mb-4">
	<RangeField label="Thresholds" bind:value={thresholds} min={2} max={50} step={1} />
</div>

<Chart
	{data}
	x="eruptions"
	y="waiting"
	xDomain={[1, 6]}
	yDomain={[40, 100]}
	xNice
	yNice
	padding={{ left: 30, bottom: 24, top: 8, right: 8 }}
	height={400}
>
	<Layer>
		<Axis placement="left" grid rule />
		<Axis placement="bottom" rule />
		<Density bandwidth={10} {thresholds} fillOpacity={0.8} />
		<Points r={1.5} class="fill-surface-content/50" />
	</Layer>
</Chart>
