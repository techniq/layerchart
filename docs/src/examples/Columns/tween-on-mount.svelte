<script lang="ts">
	import { cubicInOut } from 'svelte/easing';
	import { scaleBand } from 'd3-scale';
	import { Axis, Bar, Bars, Chart, Highlight, Layer, Tooltip } from 'layerchart';
	import { Toggle, Field, Switch } from 'svelte-ux';
	import { createDateSeries } from '$lib/utils/data.js';

	const data = createDateSeries({
		count: 30,
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
				initialY={300 - 16 * 2 - 2 - 24}
				initialHeight={0}
				motion={{
					y: { type: 'tween', duration: 500, easing: cubicInOut },
					height: { type: 'tween', duration: 500, easing: cubicInOut }
				}}
				strokeWidth={1}
				class="fill-primary"
			/>
		{/if}
	</Layer>
</Chart>
