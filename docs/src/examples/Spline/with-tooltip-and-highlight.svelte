<script lang="ts">
	import { Axis, Chart, Highlight, Layer, Spline, Tooltip } from 'layerchart';
	import { createDateSeries } from '$lib/utils/data.js';

	const data = createDateSeries({ count: 30, min: 50, max: 100, value: 'integer' });

	export { data };
</script>

<Chart
	{data}
	x="date"
	y="value"
	yDomain={[0, null]}
	yNice
	padding={{ left: 16, bottom: 24 }}
	tooltip={{ mode: 'quadtree-x' }}
	height={300}
>
	<Layer>
		<Axis placement="left" grid rule />
		<Axis placement="bottom" rule />
		<Spline class="stroke-2 stroke-primary" />
		<Highlight points lines />
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
