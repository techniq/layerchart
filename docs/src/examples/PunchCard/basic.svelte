<script lang="ts">
	import { scaleBand } from 'd3-scale';
	import { range } from 'd3-array';
	import { timeWeek, timeYear } from 'd3-time';
	import { Highlight, ScatterChart, Tooltip } from 'layerchart';
	import { createDateSeries } from '$lib/utils/data.js';

	const data = createDateSeries({ count: 60, min: 10, max: 100, value: 'integer' });
	const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

	export { data };
</script>

<ScatterChart
	{data}
	x={(d) => timeWeek.count(timeYear(d.date), d.date)}
	xScale={scaleBand()}
	y={(d) => d.date.getDay()}
	yScale={scaleBand()}
	yDomain={range(7)}
	r="value"
	rRange={[0, 16]}
	padding={{ left: 32, bottom: 16 }}
	height={300}
	props={{
		xAxis: { format: (d) => 'Week ' + d },
		yAxis: { format: (d) => daysOfWeek[d] },
		rule: { x: true, y: false },
		grid: { x: false, y: true, bandAlign: 'between' },
		tooltip: { context: { mode: 'band' } }
	}}
>
	{#snippet highlight()}
		<Highlight area axis="x" />
		<Highlight area axis="y" />
	{/snippet}

	{#snippet tooltip()}
		<Tooltip.Root>
			{#snippet children({ data })}
				<Tooltip.Header value={data.date} format="day" />
				<Tooltip.List>
					<Tooltip.Item label="value" value={data.value} valueAlign="right" />
				</Tooltip.List>
			{/snippet}
		</Tooltip.Root>
	{/snippet}
</ScatterChart>
