<script lang="ts">
	import { Area, BarChart, Tooltip } from 'layerchart';
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

<BarChart
	{data}
	x="date"
	y={['baseline', 'value']}
	props={{
		bars: { y: 'baseline' }
	}}
	height={300}
>
	{#snippet aboveMarks()}
		<Area y1="value" class="fill-secondary/20" line={{ class: 'stroke-secondary' }} />
	{/snippet}

	{#snippet tooltip()}
		<Tooltip.Root>
			{#snippet children({ data })}
				<Tooltip.Header value={data.date} format="day" />
				<Tooltip.List>
					<Tooltip.Item label="baseline" value={data.baseline} color="var(--color-primary)" />
					<Tooltip.Item label="value" value={data.value} color="var(--color-secondary)" />
				</Tooltip.List>
			{/snippet}
		</Tooltip.Root>
	{/snippet}
</BarChart>
