<script lang="ts">
	import { scaleBand } from 'd3-scale';
	import { onMount } from 'svelte';
	import { format } from '@layerstack/utils';
	import { Axis, Bars, Chart, Highlight, Tooltip } from 'layerchart';
	import { createDateSeries } from '$lib/utils/data.js';

	const data = createDateSeries({
		count: 12,
		min: 20,
		max: 100,
		value: 'integer',
		keys: ['value']
	});

	let mounted = $state(false);

	onMount(() => {
		setTimeout(() => {
			mounted = true;
		}, 200);
	});

	export { data };
</script>

<Chart
	{data}
	x="date"
	xScale={scaleBand().padding(0.4)}
	y="value"
	yNice
	padding={{ left: 16, bottom: 24 }}
	height={300}
>
	<Axis placement="left" grid rule format="integer" />
	<Axis placement="bottom" format="day" />
	{#each data as d, i}
		<Bars
			data={[d]}
			rounded={{ top: 8 }}
			strokeWidth={1}
			class="fill-primary"
			springValues={{
				from: { height: 0 },
				to: { height: mounted ? undefined : 0 },
				delay: i * 75
			}}
		/>
	{/each}
</Chart>
