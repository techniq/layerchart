<script lang="ts">
	import { scaleBand } from 'd3-scale';
	import { format } from '@layerstack/utils';
	import { Axis, Bar, Bars, Chart, Highlight, Layer, Rule, Tooltip } from 'layerchart';
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
	y={['value', (d) => -d.baseline]}
	yNice
	padding={{ left: 16, bottom: 24 }}
	tooltip={{ mode: 'bisect-x' }}
	height={300}
>
	<Layer>
		<Axis placement="left" grid rule format={(d) => format(Math.abs(d), 'integer')} />
		<Axis placement="bottom" />
		<Bars y="value" rounded="top" strokeWidth={1} class="fill-primary" />
		<Bars y={(d) => -d.baseline} rounded="bottom" strokeWidth={1} class="fill-secondary" />
		<Rule y={0} />
		<Highlight area />
	</Layer>
	<Tooltip.Root>
		{#snippet children({ data })}
			<Tooltip.Header value={data.date} format="day" />
			<Tooltip.List>
				<Tooltip.Item label="value" value={data.value} />
				<Tooltip.Item label="baseline" value={data.baseline} />
			</Tooltip.List>
		{/snippet}
	</Tooltip.Root>
</Chart>
