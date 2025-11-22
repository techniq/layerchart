<script lang="ts">
	import { stack, type Series } from 'd3-shape';
	import { Area, Axis, Chart, Layer, LinearGradient, asAny, chartDataArray } from 'layerchart';

	import { createDateSeries } from '$lib/utils/data.js';
	import flatten from '$lib/utils/flatten.js';

	const keys = ['apples', 'bananas', 'oranges'];

	const multiSeriesData = createDateSeries({
		count: 30,
		min: 10,
		max: 100,
		value: 'integer',
		keys
	});

	type B = Series<
		{
			date: number;
		},
		string
	>[];

	const stackData = stack().keys(keys)(multiSeriesData) as B;

	export { stackData as data };
</script>

<Chart
	data={stackData}
	flatData={flatten(stackData)}
	x={(d) => asAny(d).data.date}
	y={[0, 1]}
	yNice
	padding={20}
	height={300}
>
	<Layer>
		<Axis placement="left" grid rule />
		<Axis placement="bottom" rule />
		{@const primaryColors = ['var(--color-apples)', 'var(--color-bananas)', 'var(--color-oranges)']}
		{@const secondaryColors = [
			'color-mix(in lch, var(--color-apples) 10%, transparent)',
			'color-mix(in lch, var(--color-bananas) 10%, transparent)',
			'color-mix(in lch, var(--color-oranges) 10%, transparent)'
		]}

		{#each chartDataArray(stackData) as seriesData, index}
			{@const primaryColor = primaryColors[index]}
			{@const secondaryColor = secondaryColors[index]}

			<LinearGradient stops={[primaryColor, secondaryColor]} vertical>
				{#snippet children({ gradient })}
					<Area
						data={seriesData}
						fill={gradient}
						fillOpacity={0.5}
						line={{ stroke: primaryColor }}
					/>
				{/snippet}
			</LinearGradient>
		{/each}
	</Layer>
</Chart>
