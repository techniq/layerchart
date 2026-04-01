<script lang="ts">
	import { scaleBand } from 'd3-scale';
	import { Axis, BoxPlot, Chart, Highlight, Layer, Tooltip, computeBoxStats } from 'layerchart';

	const rawData = [
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

	const data = rawData.map((d) => ({
		group: d.group,
		...computeBoxStats(d.values)
	}));

	export { data };
</script>

<Chart
	{data}
	x="group"
	xScale={scaleBand().padding(0.3)}
	y="median"
	yDomain={[0, 100]}
	yNice
	tooltipContext={{ mode: 'band' }}
	padding={{ left: 24, bottom: 20, top: 8 }}
	height={300}
>
	<Layer>
		<Axis placement="left" grid rule />
		<Axis placement="bottom" rule />
		{#each data as item}
			<BoxPlot
				data={item}
				min="min"
				q1="q1"
				median="median"
				q3="q3"
				max="max"
				outliers="outliers"
			/>
		{/each}
		<Highlight area />
	</Layer>
	<Tooltip.Root>
		{#snippet children({ data })}
			<Tooltip.Header value={data.group} />
			<Tooltip.List>
				<Tooltip.Item label="Max" value={data.max} />
				<Tooltip.Item label="Q3" value={data.q3} />
				<Tooltip.Item label="Median" value={data.median} />
				<Tooltip.Item label="Q1" value={data.q1} />
				<Tooltip.Item label="Min" value={data.min} />
				{#if data.outliers?.length}
					<Tooltip.Item label="Outliers" value={data.outliers.join(', ')} />
				{/if}
			</Tooltip.List>
		{/snippet}
	</Tooltip.Root>
</Chart>
