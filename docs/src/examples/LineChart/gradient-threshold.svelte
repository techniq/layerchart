<script lang="ts">
	import { LinearGradient, LineChart, Highlight, Spline, Tooltip } from 'layerchart';
	import { getDailyTemperature } from '$lib/data.remote';
	import { format } from '@layerstack/utils';

	const data = await getDailyTemperature();

	export { data };
</script>

<LineChart {data} x="date" y="value" yDomain={null} padding={20} height={300}>
	{#snippet marks({ context })}
		{@const thresholdOffset =
			context.yScale(50) / (context.height + context.padding.top + context.padding.bottom)}
		<LinearGradient
			stops={[
				[thresholdOffset, 'var(--color-danger)'],
				[thresholdOffset, 'var(--color-info)']
			]}
			units="userSpaceOnUse"
			vertical
		>
			{#snippet children({ gradient })}
				<Spline stroke={gradient} />
			{/snippet}
		</LinearGradient>
	{/snippet}

	{#snippet highlight({ context })}
		{#if context.tooltip.data}
			<Highlight
				lines
				points={{
					fill: context.y(context.tooltip.data) > 50 ? 'var(--color-danger)' : 'var(--color-info)'
				}}
			/>
		{/if}
	{/snippet}

	{#snippet tooltip({ context })}
		<Tooltip.Root>
			{#snippet children({ data })}
				{@const value = context.y(data)}
				<Tooltip.Header>{format(context.x(data))}</Tooltip.Header>
				<Tooltip.List>
					<Tooltip.Item
						label="value"
						{value}
						color={value > 50 ? 'var(--color-danger)' : 'var(--color-info)'}
					/>
				</Tooltip.List>
			{/snippet}
		</Tooltip.Root>
	{/snippet}
</LineChart>
