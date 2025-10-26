<script lang="ts">
	import { Axis, Bars, Chart, Layer } from 'layerchart';
	import { scaleBand } from 'd3-scale';
	import { createDateSeries } from '$lib/utils/data.js';
	import { cubicInOut } from 'svelte/easing';
	import { Field, Switch } from 'svelte-ux';

	const data = createDateSeries({
		count: 30,
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
			<Bars
				motion={{
					type: 'tween',
					duration: 500,
					easing: cubicInOut
				}}
				radius={4}
				rounded="edge"
				strokeWidth={1}
				class="fill-primary"
			/>
		{/if}
	</Layer>
</Chart>
