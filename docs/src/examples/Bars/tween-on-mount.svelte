<script lang="ts">
	import { cubicInOut } from 'svelte/easing';
	import { scaleBand } from 'd3-scale';
	import { Bar, Bars, Axis, Chart, Highlight, Layer, Tooltip } from 'layerchart';
	import { Toggle, Field, Switch } from 'svelte-ux';
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

<div class="grid grid-cols-[auto_1fr] gap-2 mb-2">
	<Field label="Show bars" let:id>
		<Switch bind:checked={show} {id} size="md" />
	</Field>
</div>

<Chart
	{data}
	x="value"
	xDomain={[0, null]}
	xNice
	y="date"
	yScale={scaleBand().padding(0.4)}
	padding={{ left: 16, bottom: 24 }}
	height={300}
>
	<Layer>
		<Axis placement="bottom" grid rule />
		<Axis placement="left" rule />
		{#if show}
			<Bars
				initialX={0}
				initialWidth={0}
				motion={{
					x: { type: 'tween', duration: 500, easing: cubicInOut },
					width: { type: 'tween', duration: 500, easing: cubicInOut }
				}}
				strokeWidth={1}
				class="fill-primary"
			/>
		{/if}
	</Layer>
</Chart>
