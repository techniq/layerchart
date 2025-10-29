<script lang="ts">
	import { cubicInOut } from 'svelte/easing';
	import { scaleBand } from 'd3-scale';
	import { Bars, Axis, Chart, Layer } from 'layerchart';
	import { Field, Switch } from 'svelte-ux';
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

<div class="absolute p-1 top-1 right-1 rounded z-1 backdrop-blur-sm bg-surface-100/50">
	<Field label="Show" labelPlacement="left" let:id>
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
	padding={{ left: 32, bottom: 20, right: 8 }}
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
