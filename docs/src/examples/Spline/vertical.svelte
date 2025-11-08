<script lang="ts">
	import { Axis, Chart, Highlight, Layer, Spline, Tooltip } from 'layerchart';
	import { createDateSeries } from '$lib/utils/data.js';

	const data = createDateSeries({ count: 30, min: 50, max: 100, value: 'integer' });

	export { data };
</script>

<div class="flex justify-center p-2">
	<Chart
		{data}
		x="value"
		xNice
		y="date"
		padding={25}
		tooltip={{ mode: 'quadtree-y' }}
		height={600}
		width={400}
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
</div>
