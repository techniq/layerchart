<script lang="ts">
	import { scaleBand } from 'd3-scale';
	import { Axis, Bar, Chart, Layer } from 'layerchart';
	import { createDateSeries } from '$lib/utils/data.js';
	import { cubicInOut } from 'svelte/easing';
	import ShowControls from '$lib/components/controls/fields/ShowField.svelte';

	const data = createDateSeries({
		count: 20,
		min: 20,
		max: 100
	});
	export { data };

	let show = $state(true);
</script>

<ShowControls bind:show label="Show Bars" />

<Chart
	{data}
	x="date"
	xScale={scaleBand().padding(0.4)}
	y="value"
	yDomain={[0, null]}
	yNice
	padding={{ left: 24, bottom: 20, top: 8 }}
	height={300}
>
	<Layer>
		<Axis placement="left" grid rule />
		<Axis placement="bottom" rule />
		{#if show}
			{#each data as d, i}
				<Bar
					data={d}
					motion={{
						type: 'tween',
						duration: 500,
						easing: cubicInOut,
						delay: i * 30
					}}
					radius={4}
					rounded="edge"
					strokeWidth={1}
					class="fill-primary"
				/>
			{/each}
		{/if}
	</Layer>
</Chart>
