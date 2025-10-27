<script lang="ts">
	import { scaleBand, scaleTime } from 'd3-scale';
	import { format } from '@layerstack/utils';
	import { Axis, Bars, Chart, Highlight, Tooltip } from 'layerchart';

	// Create data with missing values (some null/undefined entries)
	const data = [
		{ date: new Date('2023-01-01'), value: 45 },
		{ date: new Date('2023-01-02'), value: 52 },
		{ date: new Date('2023-01-03'), value: null }, // Missing data
		{ date: new Date('2023-01-04'), value: 38 },
		{ date: new Date('2023-01-05'), value: null }, // Missing data
		{ date: new Date('2023-01-06'), value: 65 },
		{ date: new Date('2023-01-07'), value: 71 },
		{ date: new Date('2023-01-08'), value: 58 },
		{ date: new Date('2023-01-09'), value: null }, // Missing data
		{ date: new Date('2023-01-10'), value: 49 }
	].filter((d) => d.value !== null); // Remove missing data points

	export { data };
</script>

<Chart
	{data}
	x="date"
	xScale={scaleTime()}
	y="value"
	yNice
	padding={{ left: 16, bottom: 24 }}
	tooltip={{ mode: 'bisect-x' }}
	height={300}
>
	<Axis placement="left" grid rule format="integer" />
	<Axis placement="bottom" format="day" />
	<Bars rounded="top" strokeWidth={1} class="fill-primary" />
	<Highlight area />
	<Tooltip.Root>
		{#snippet children({ data })}
			<Tooltip.Header value={data.date} format="day" />
			<Tooltip.List>
				<Tooltip.Item label="value" value={data.value} />
			</Tooltip.List>
		{/snippet}
	</Tooltip.Root>
</Chart>
