<script lang="ts">
	import { scaleBand } from 'd3-scale';
	import { Bars, Axis, Chart, Highlight, Layer, Tooltip, RectClipPath } from 'layerchart';
	import { createDateSeries } from '$lib/utils/data.js';

	const data = createDateSeries({
		count: 10,
		min: 20,
		max: 100,
		value: 'integer',
		keys: ['value', 'baseline']
	});

	export { data };
</script>

<Chart
	{data}
	x="value"
	xDomain={[0, null]}
	xNice
	y="date"
	yScale={scaleBand().padding(0.4)}
	padding={{ left: 32, bottom: 20, right: 8 }}
	tooltip={{ mode: 'band' }}
	class="group"
	height={300}
>
	<Layer>
		<Axis placement="bottom" grid rule />
		<Axis placement="left" rule />
		<Bars strokeWidth={1} class="fill-primary group-hover:fill-gray-300 transition-colors" />
		<Highlight>
			{#snippet area({ area })}
				<RectClipPath x={area.x} y={area.y} width={area.width} height={area.height} motion="spring">
					<Bars strokeWidth={1} class="fill-primary" />
				</RectClipPath>
			{/snippet}
		</Highlight>
	</Layer>
	<Tooltip.Root>
		{#snippet children({ data })}
			<Tooltip.Header value={data.date} format="day" />
			<Tooltip.List>
				<Tooltip.Item label="value" value={data.value} />
			</Tooltip.List>
		{/snippet}
	</Tooltip.Root>
</Chart>
