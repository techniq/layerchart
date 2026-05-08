<script module lang="ts">
	import { getPenguins } from '$lib/data.remote';
	const penguins = await getPenguins();
</script>

<script lang="ts">
	import { Chart, Tooltip, Waffle, Legend } from 'layerchart';
	import { rollup, sum } from 'd3-array';

	const data = Array.from(
		rollup(
			penguins,
			(v) => v.length,
			(d) => d.island,
			(d) => d.species
		),
		([island, bySpecies]) => ({ island, ...Object.fromEntries(bySpecies) })
	);
	export { data };
</script>

<Chart
	{data}
	x="island"
	bandPadding={0.2}
	yNice
	yBaseline={0}
	series={[
		{ key: 'Adelie', color: 'var(--color-info)' },
		{ key: 'Chinstrap', color: 'var(--color-warning)' },
		{ key: 'Gentoo', color: 'var(--color-success)' }
	]}
	seriesLayout="stack"
	padding={{ left: 36, bottom: 24, top: 32, right: 8 }}
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
			<Waffle seriesKey={s.key} unit={1} round tooltip />
		{/each}
	{/snippet}

	{#snippet tooltip({ context })}
		<Tooltip.Root>
			{#snippet children({ data })}
				<Tooltip.Header>{data.island}</Tooltip.Header>
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
