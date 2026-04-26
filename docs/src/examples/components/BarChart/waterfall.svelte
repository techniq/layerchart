<script lang="ts">
	import { BarChart, defaultChartPadding, Line, Text, Tooltip } from 'layerchart';
	import { format } from '@layerstack/utils';

	const rawData = [
		{ label: 'Product Revenue', value: 420000 },
		{ label: 'Services Revenue', value: 210000 },
		{ label: 'Fixed Costs', value: -170000 },
		{ label: 'Variable Costs', value: -140000 }
	];

	let runningTotal = 0;
	const items = rawData.map((d) => {
		const start = runningTotal;
		runningTotal += d.value;
		return {
			...d,
			start,
			end: runningTotal,
			type: d.value >= 0 ? 'increase' : ('decrease' as const)
		};
	});

	const data = [
		...items,
		{
			label: 'Total',
			value: runningTotal,
			start: 0,
			end: runningTotal,
			type: 'total' as const
		}
	];

	export { data };
</script>

<BarChart
	{data}
	x="label"
	y={['start', 'end']}
	yDomain={[0, null]}
	yNice
	c="type"
	cDomain={['increase', 'decrease', 'total']}
	cRange={['var(--color-success)', 'var(--color-danger)', 'var(--color-info)']}
	bandPadding={0.3}
	labels={false}
	rule
	props={{
		yAxis: { format: 'metric' },
		bars: { rounded: 'all', radius: 2, strokeWidth: 0 }
	}}
	padding={defaultChartPadding({ top: 24 })}
	height={300}
>
	{#snippet tooltip({ context })}
		<Tooltip.Root>
			{#snippet children({ data })}
				<Tooltip.Header>{data.label}</Tooltip.Header>
				<Tooltip.List>
					{#if data.type === 'total' || data.start === 0}
						<Tooltip.Item label="Value" value={data.end} format="currencyRound" valueAlign="right" />
					{:else}
						<Tooltip.Item label="Start" value={data.start} format="currencyRound" valueAlign="right" />
						<Tooltip.Item
							label="Change"
							value="{data.value >= 0 ? '+' : ''}{format(data.value, 'currencyRound')}"
							valueAlign="right"
						/>
						<Tooltip.Item label="End" value={data.end} format="currencyRound" valueAlign="right" />
					{/if}
				</Tooltip.List>
			{/snippet}
		</Tooltip.Root>
	{/snippet}

	{#snippet aboveMarks({ context })}
		{#each data as d, i (d.label)}
			{@const bandLeft = context.xScale(d.label)}
			{@const bandCenter = bandLeft + context.xScale.bandwidth() / 2}
			{@const bandRight = bandLeft + context.xScale.bandwidth()}
			{@const isNegative = d.value < 0}

			<!-- Link line to next bar -->
			{#if i < data.length - 1}
				<Line
					x1={bandRight}
					x2={context.xScale(data[i + 1].label)}
					y1={context.yScale(d.end)}
					y2={context.yScale(d.end)}
					stroke="currentColor"
					dashArray={[4, 3]}
					strokeWidth={1}
					opacity={0.3}
				/>
			{/if}

			<!-- Value label -->
			<Text
				x={bandCenter}
				y={context.yScale(d.end)}
				verticalAnchor={isNegative ? 'start' : 'end'}
				textAnchor="middle"
				class="text-xs fill-current"
				value={format(d.value, 'metric')}
			/>
		{/each}
	{/snippet}
</BarChart>
