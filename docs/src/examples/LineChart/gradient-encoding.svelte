<script lang="ts">
	import { LinearGradient, LineChart, Highlight, Spline, Tooltip } from 'layerchart';
	import { getDailyTemperature } from '$lib/data.remote';
	import { extent, ticks } from 'd3-array';
	import { format } from '@layerstack/utils';
	import { scaleSequential } from 'd3-scale';
	import { interpolateTurbo } from 'd3-scale-chromatic';

	const data = await getDailyTemperature();

	const temperatureColor = $derived(
		scaleSequential(extent(data, (d) => d.value as number) as [number, number], interpolateTurbo)
	);

	export { data };
</script>

<LineChart {data} x="date" y="value" yDomain={null} padding={20} height={300}>
	{#snippet marks()}
		<LinearGradient stops={ticks(1, 0, 10).map(temperatureColor.interpolator())} vertical>
			{#snippet children({ gradient })}
				<Spline stroke={gradient} />
			{/snippet}
		</LinearGradient>
	{/snippet}

	{#snippet highlight({ context })}
		{#if context.tooltip.data}
			<Highlight lines points={{ fill: temperatureColor(context.y(context.tooltip.data)) }} />
		{/if}
	{/snippet}

	{#snippet tooltip({ context })}
		<Tooltip.Root>
			{#snippet children({ data })}
				{@const value = context.y(data)}
				<Tooltip.Header>{format(context.x(data))}</Tooltip.Header>
				<Tooltip.List>
					<Tooltip.Item label="value" {value} color={temperatureColor(value)} />
				</Tooltip.List>
			{/snippet}
		</Tooltip.Root>
	{/snippet}
</LineChart>
