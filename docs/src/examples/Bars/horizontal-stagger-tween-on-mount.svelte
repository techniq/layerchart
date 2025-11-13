<script lang="ts">
	import { cubicInOut } from 'svelte/easing';
	import { scaleBand } from 'd3-scale';
	import { Bar, Axis, Chart, Layer } from 'layerchart';
	import ShowControl from '$lib/components/ShowControl.svelte';
	import { createDateSeries } from '$lib/utils/data.js';

	const data = createDateSeries({
		count: 10,
		min: 20,
		max: 100,
		value: 'integer',
		keys: ['value', 'baseline']
	});

	let show = $state(true);

	export { data };
</script>

<ShowControl bind:show label="Show Bars" />
<Chart
	{data}
	x="value"
	xDomain={[0, null]}
	xNice
	y="date"
	yScale={scaleBand().padding(0.4)}
	padding={{ left: 32, bottom: 20, right: 8 }}
	height={300}
>
	<Layer>
		<Axis placement="bottom" grid rule />
		<Axis placement="left" rule />
		{#if show}
			{#each data as d, i}
				<Bar
					data={d}
					initialX={0}
					initialWidth={0}
					motion={{
						x: { type: 'tween', duration: 500, easing: cubicInOut, delay: i * 30 },
						width: { type: 'tween', duration: 500, easing: cubicInOut, delay: i * 30 }
					}}
					strokeWidth={1}
					class="fill-primary"
				/>
			{/each}
		{/if}
	</Layer>
</Chart>
