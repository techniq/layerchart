<script lang="ts">
	import { scaleBand } from 'd3-scale';
	import { sum } from 'd3-array';
	import { Chart, Tooltip, Waffle } from 'layerchart';
	import { createDateSeries } from '$lib/utils/data.js';

	const data = createDateSeries({
		count: 6,
		min: 200,
		max: 1200,
		value: 'integer',
		keys: ['apples', 'bananas', 'cherries', 'grapes']
	}).map((d, i) => ({ ...d, period: `Q${(i % 4) + 1} '${(20 + Math.floor(i / 4)) % 100}` }));

	export { data };
</script>

<Chart
	{data}
	x="period"
	xScale={scaleBand().paddingInner(0.15)}
	yNice
	yBaseline={0}
	series={[
		{ key: 'apples', color: 'var(--color-apples)' },
		{ key: 'bananas', color: 'var(--color-bananas)' },
		{ key: 'cherries', color: 'var(--color-cherries)' },
		{ key: 'grapes', color: 'var(--color-grapes)' }
	]}
	seriesLayout="stack"
	padding={{ left: 36, bottom: 40, top: 8, right: 8 }}
	tooltipContext={{ mode: 'band' }}
	height={400}
	rule
	grid
	legend
>
	{#snippet marks({ context })}
		{#each context.series.visibleSeries as s (s.key)}
			<Waffle seriesKey={s.key} unit={50} tooltip />
		{/each}
	{/snippet}

	{#snippet tooltip({ context })}
		<Tooltip.Root>
			{#snippet children({ data })}
				<Tooltip.Header>{data.period}</Tooltip.Header>
				<Tooltip.List>
					{#each context.series.visibleSeries as s (s.key)}
						<Tooltip.Item
							label={s.key}
							value={data[s.key]}
							color={s.color}
							format="integer"
							valueAlign="right"
						/>
					{/each}
					<Tooltip.Separator />
					<Tooltip.Item
						label="total"
						value={sum(context.series.visibleSeries, (s) => Number(data[s.key]) || 0)}
						format="integer"
						valueAlign="right"
					/>
				</Tooltip.List>
			{/snippet}
		</Tooltip.Root>
	{/snippet}
</Chart>
