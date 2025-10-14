<script lang="ts">
	import { Arc, ArcChart, Text } from 'layerchart';

	const data = [
		{ key: 'move', value: 400, maxValue: 1000, color: '#ef4444' },
		{ key: 'exercise', value: 20, maxValue: 30, color: '#a3e635' },
		{ key: 'stand', value: 10, maxValue: 12, color: '#22d3ee' }
	];
	export { data };
</script>

<ArcChart
	key="fruit"
	value="value"
	series={data.map((d) => {
		return {
			key: d.key,
			data: [d],
			maxValue: d.maxValue,
			color: d.color
		};
	})}
	outerRadius={-25}
	innerRadius={-20}
	cornerRadius={10}
	height={180}
>
	{#snippet arc({ props, seriesIndex, visibleSeries })}
		<Arc {...props}>
			{#snippet children({ getArcTextProps })}
				<Text
					{...getArcTextProps('middle')}
					value={visibleSeries[seriesIndex].key}
					class="fill-black"
					font-size="12px"
				/>
			{/snippet}
		</Arc>
	{/snippet}
</ArcChart>
