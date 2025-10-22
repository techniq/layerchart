<script lang="ts">
	import { AreaChart, Area, Spline, Threshold } from 'layerchart';
	import { createDateSeries } from '$lib/utils/data.js';

	const data = createDateSeries({
		count: 30,
		min: 50,
		max: 100,
		value: 'integer',
		keys: ['value', 'baseline']
	});

	export { data };
</script>

<AreaChart
	{data}
	x="date"
	y={['value', 'baseline']}
	padding={{ left: 16, bottom: 24 }}
	labels
	tooltip={false}
	height={300}
>
	{#snippet marks()}
		<Threshold>
			{#snippet above({ curve })}
				<Area y0="value" y1="baseline" {curve} class="fill-success/30" />
			{/snippet}

			{#snippet below({ curve })}
				<Area y0="value" y1="baseline" {curve} class="fill-danger/30" />
			{/snippet}

			{#snippet children({ curve })}
				<Spline y="baseline" {curve} class="[stroke-dasharray:4]" />
				<Spline y="value" {curve} class="stroke-[1.5]" />
			{/snippet}
		</Threshold>
	{/snippet}
</AreaChart>
