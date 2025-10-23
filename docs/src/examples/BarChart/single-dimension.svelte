<script lang="ts">
	import { BarChart, Tooltip } from 'layerchart';
	import { createDateSeries } from '$lib/utils/data.js';
	import { scaleThreshold, scaleTime } from 'd3-scale';
	import { format } from '@layerstack/utils';

	const data = createDateSeries({
		count: 50,
		min: 0,
		max: 100,
		value: 'integer',
		keys: ['value', 'baseline']
	});

	export { data };
</script>

<BarChart
	{data}
	x="date"
	y={(d) => 1}
	c="value"
	cScale={scaleThreshold()}
	cDomain={[10, 50]}
	cRange={['var(--color-danger)', 'var(--color-warning)', 'var(--color-success)']}
	axis="x"
	bandPadding={0.1}
	props={{
		bars: { radius: 4, strokeWidth: 0, rounded: 'all' },
		highlight: { bar: { radius: 4, class: 'stroke-current stroke-2 fill-none' } },
		xAxis: { ticks: (scale) => scaleTime(scale.domain(), scale.range()).ticks() },
		rule: { y: false }
	}}
	height={60}
>
	{#snippet tooltip({ context })}
		<Tooltip.Root>
			{#snippet children({ data })}
				<Tooltip.Header>{format(context.x(data))}</Tooltip.Header>
				<Tooltip.List>
					<Tooltip.Item
						label="Status"
						value={context.c(data)}
						color={context.cScale?.(context.c(data))}
					/>
				</Tooltip.List>
			{/snippet}
		</Tooltip.Root>
	{/snippet}
</BarChart>
