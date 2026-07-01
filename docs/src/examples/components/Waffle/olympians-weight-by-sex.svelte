<script module lang="ts">
	import { getOlympians } from '$lib/data.remote';
	const olympians = await getOlympians();
</script>

<script lang="ts">
	import { Chart, Tooltip, Waffle, Legend } from 'layerchart';
	import { rollup, sum } from 'd3-array';

	// Bin athletes by 10kg weight intervals × sex, one row per bin with a
	// column per sex — wide format feeds the chart's series-based stacking.
	const data = Array.from(
		rollup(
			olympians.filter((d) => d.weight && d.sex),
			(v) => v.length,
			(d) => Math.floor(d.weight / 10) * 10,
			(d) => d.sex
		),
		([weight, bySex]) => ({ weight, ...Object.fromEntries(bySex) })
	).sort((a, b) => a.weight - b.weight);
	export { data };
</script>

<Chart
	{data}
	x="weight"
	bandPadding={0.2}
	yNice
	yBaseline={0}
	series={[
		{ key: 'female', color: 'var(--color-warning)' },
		{ key: 'male', color: 'var(--color-info)' }
	]}
	seriesLayout="stack"
	padding={{ left: 36, bottom: 24, top: 8, right: 8 }}
	tooltipContext={{ mode: 'band' }}
	height={400}
	rule
	grid
>
	{#snippet legend()}
		<Legend variant="swatches" placement="top-right" orientation="horizontal" />
	{/snippet}

	{#snippet marks({ context })}
		{#each context.series.visibleSeries as s (s.key)}
			<Waffle seriesKey={s.key} unit={10} tooltip />
		{/each}
	{/snippet}

	{#snippet tooltip({ context })}
		<Tooltip.Root>
			{#snippet children({ data })}
				<Tooltip.Header>{data.weight}–{data.weight + 9} kg</Tooltip.Header>
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
