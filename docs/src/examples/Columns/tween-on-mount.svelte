<script lang="ts">
	import { cubicInOut } from 'svelte/easing';
	import { scaleBand } from 'd3-scale';
	import { Axis, Bar, Chart, Layer } from 'layerchart';
	import { Field, Switch } from 'svelte-ux';
	import { createDateSeries } from '$lib/utils/data.js';

	const data = createDateSeries({
		count: 30,
		min: 20,
		max: 100,
		value: 'integer',
		keys: ['value', 'baseline']
	});
	export { data };

	let show = $state(true);
</script>

<Field label="Show bars" let:id>
	<Switch bind:checked={show} {id} size="md" />
</Field>

<Chart
	{data}
	x="date"
	xScale={scaleBand().padding(0.4)}
	y="value"
	yDomain={[0, null]}
	yNice
	padding={{ left: 16, bottom: 24 }}
	height={300}
>
	<Layer>
		<Axis placement="left" grid rule />
		<Axis placement="bottom" rule />
		{#if show}
			{#each data as d, i}
				<Bar
					data={d}
					initialY={300 - 16 * 2 - 2 - 24}
					initialHeight={0}
					motion={{
						y: {
							type: 'tween',
							duration: 500,
							easing: cubicInOut,
							delay: i * 30
						},
						height: {
							type: 'tween',
							duration: 500,
							easing: cubicInOut,
							delay: i * 30
						}
					}}
					strokeWidth={1}
					class="fill-primary"
				/>
			{/each}
		{/if}
	</Layer>
</Chart>
