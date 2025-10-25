<script lang="ts">
	import { scaleBand } from 'd3-scale';
	import { format } from '@layerstack/utils';
	import { Axis, Bars, Chart, Highlight, Tooltip } from 'layerchart';
	import { createDateSeries } from '$lib/utils/data.js';

	const data = createDateSeries({
		count: 30,
		min: 20,
		max: 100,
		value: 'integer',
		keys: ['value', 'baseline']
	});

	export { data };
</script>

<Chart
	{data}
	x="date"
	xScale={scaleBand().padding(0.4)}
	y="value"
	yNice
	padding={{ left: 16, bottom: 24 }}
	tooltip={{ mode: 'bisect-x' }}
	height={300}
>
	<Axis placement="left" grid rule format="integer" />
	<Axis placement="bottom" />
	<Bars>
		<defs>
			<pattern id="stripes" patternUnits="userSpaceOnUse" width="4" height="4">
				<path
					d="M0,4 l4,-4 M-1,1 l2,-2 M3,5 l2,-2"
					stroke="hsl(var(--color-primary))"
					stroke-width="1"
				/>
			</pattern>
		</defs>
	</Bars>
	<Bars rounded="top" strokeWidth={1} fill="url(#stripes)" />
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
