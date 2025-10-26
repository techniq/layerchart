<script lang="ts">
	import { scaleBand } from 'd3-scale';
	import { Axis, Bar, Chart, Layer } from 'layerchart';
	import { createDateSeries } from '$lib/utils/data.js';
	import { cubicInOut } from 'svelte/easing';
	import { Field, Switch } from 'svelte-ux';

	const data = createDateSeries({
		count: 12,
		min: 20,
		max: 100,
		value: 'integer',
		keys: ['value']
	});
	export { data };

	let show = $state(false);
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
