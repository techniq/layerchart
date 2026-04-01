<script lang="ts">
	import { scaleBand, scaleOrdinal } from 'd3-scale';
	import { Axis, BoxPlot, Chart, Layer } from 'layerchart';

	const data = [
		{
			group: 'A',
			values: [2, 7, 8, 12, 15, 18, 21, 25, 27, 30, 32, 35, 38, 40, 42, 45, 50, 55, 60, 85]
		},
		{
			group: 'B',
			values: [10, 15, 18, 20, 22, 25, 28, 30, 32, 35, 37, 40, 42, 45, 48, 50, 55, 58, 62, 65]
		},
		{
			group: 'C',
			values: [5, 8, 10, 12, 15, 18, 20, 22, 25, 28, 30, 33, 35, 38, 40, 42, 45, 48, 70, 75]
		},
		{
			group: 'D',
			values: [1, 20, 25, 30, 35, 38, 40, 42, 45, 48, 50, 52, 55, 58, 60, 62, 65, 70, 75, 95]
		}
	];

	const colors = scaleOrdinal<string, string>()
		.domain(['A', 'B', 'C', 'D'])
		.range([
			'oklch(0.7 0.15 200)',
			'oklch(0.7 0.15 260)',
			'oklch(0.7 0.15 320)',
			'oklch(0.7 0.15 30)'
		]);

	export { data };
</script>

<Chart
	{data}
	x="group"
	xScale={scaleBand().padding(0.3)}
	yDomain={[0, 100]}
	yNice
	padding={{ left: 24, bottom: 20, top: 8 }}
	height={300}
>
	<Layer>
		<Axis placement="left" grid rule />
		<Axis placement="bottom" rule />
		{#each data as item}
			<BoxPlot
				data={item}
				values="values"
				fill={colors(item.group)}
				fillOpacity={0.3}
				stroke={colors(item.group)}
				strokeWidth={1.5}
				radius={4}
				outlierRadius={4}
			/>
		{/each}
	</Layer>
</Chart>
