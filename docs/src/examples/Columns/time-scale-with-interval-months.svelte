<script lang="ts">
	import { scaleBand, scaleTime } from 'd3-scale';
	import { timeMonth } from 'd3-time';
	import { format } from '@layerstack/utils';
	import { Axis, Bars, Chart, Highlight, Tooltip } from 'layerchart';
	import { createDateSeries } from '$lib/utils/data.js';

	const data = createDateSeries({
		count: 12,
		min: 20,
		max: 100,
		value: 'integer',
		keys: ['value'],
		step: timeMonth
	});

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
	<Axis placement="bottom" format="month" />
	<Bars x={{ interval: timeMonth }} rounded="top" strokeWidth={1} class="fill-primary" />
	<Highlight area />
	<Tooltip.Root>
		{#snippet children({ data })}
			<Tooltip.Header value={data.date} format="month" />
			<Tooltip.List>
				<Tooltip.Item label="value" value={data.value} />
			</Tooltip.List>
		{/snippet}
	</Tooltip.Root>
</Chart>
