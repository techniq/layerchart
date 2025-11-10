<script lang="ts">
	import { scaleBand } from 'd3-scale';
	import { Axis, Bars, Chart, Highlight, Layer, Tooltip } from 'layerchart';
	import { createDateSeries } from '$lib/utils/data.js';

	const data = createDateSeries({
		count: 20,
		min: 20,
		max: 80,
		keys: ['value', 'baseline']
	});
	export { data };
</script>

<div class="h-[300px] p-4 border rounded-sm">
	<Chart
		{data}
		x="date"
		xScale={scaleBand().padding(0.4)}
		y={['value', 'baseline']}
		yDomain={[0, null]}
		yNice
		padding={{ left: 24, bottom: 20, top: 8 }}
		tooltip={{ mode: 'bisect-x' }}
	>
		<Layer>
			<Axis placement="left" grid rule />
			<Axis placement="bottom" rule />
			<Bars y="baseline" strokeWidth={1} class="fill-surface-content/20" />
			<Bars y="value" strokeWidth={1} insets={{ x: 4 }} class="fill-primary" />
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
</div>
