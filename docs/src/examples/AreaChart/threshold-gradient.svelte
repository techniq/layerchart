<script lang="ts">
	import { Area, AreaChart, Highlight, LinearGradient, Tooltip } from 'layerchart';
	import { createDateSeries } from '$lib/utils/data.js';
	import { format } from '@layerstack/utils';

	const data = createDateSeries({ count: 30, min: -20, max: 50, value: 'integer' });
	export { data };

	const colors = {
		positive: 'var(--color-success)',
		negative: 'var(--color-danger)'
	};
</script>

<AreaChart {data} x="date" y="value" height={300}>
	{#snippet marks({ context })}
		{@const thresholdValue = 0}
		{@const thresholdOffset =
			context.yScale(thresholdValue) / (context.height + context.padding.bottom)}
		<LinearGradient
			stops={[
				[thresholdOffset, colors.positive],
				[thresholdOffset, colors.negative]
			]}
			units="userSpaceOnUse"
			vertical
		>
			{#snippet children({ gradient })}
				<Area
					y0={(d) => thresholdValue}
					line={{ stroke: gradient }}
					fill={gradient}
					fillOpacity={0.2}
				/>
			{/snippet}
		</LinearGradient>
	{/snippet}

	{#snippet highlight({ context })}
		{@const value = context.tooltip?.data && context.y(context.tooltip?.data)}
		<Highlight lines points={{ fill: value < 0 ? colors.negative : colors.positive }} />
	{/snippet}

	{#snippet tooltip({ context })}
		<Tooltip.Root>
			{#snippet children({ data })}
				{@const value = context.y(data)}
				<Tooltip.Header>{format(context.x(data), 'day')}</Tooltip.Header>
				<Tooltip.List>
					<Tooltip.Item
						label="value"
						value={context.y(data)}
						color={value < 0 ? colors.negative : colors.positive}
					/>
				</Tooltip.List>
			{/snippet}
		</Tooltip.Root>
	{/snippet}
</AreaChart>
