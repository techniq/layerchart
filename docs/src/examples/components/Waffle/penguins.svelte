<script module lang="ts">
	import { getPenguins } from '$lib/data.remote';
	const penguins = await getPenguins();
</script>

<script lang="ts">
	import { Chart, Tooltip, Waffle, Legend, groupStackData } from 'layerchart';
	import { rollup, sum } from 'd3-array';

	// Count penguins per (island, species) pair.
	const counted = Array.from(
		rollup(
			penguins,
			(v) => v.length,
			(d) => d.island,
			(d) => d.species
		),
		([island, bySpecies]) =>
			Array.from(bySpecies, ([species, value]) => ({ island, species, value }))
	).flat();

	const data = groupStackData(counted, { xKey: 'island', stackBy: 'species' });
	export { data };

	const speciesOrder = ['Adelie', 'Chinstrap', 'Gentoo'] as const;
	const speciesColors = ['var(--color-info)', 'var(--color-warning)', 'var(--color-success)'];
</script>

<Chart
	{data}
	x="island"
	bandPadding={0.2}
	y="values"
	yDomain={[0, null]}
	yNice
	c="species"
	cDomain={speciesOrder}
	cRange={speciesColors}
	padding={{ left: 36, bottom: 24, top: 8, right: 8 }}
	tooltipContext={{ mode: 'band' }}
	height={400}
	rule
	grid
>
	{#snippet legend()}
		<Legend variant="swatches" placement="top-right" orientation="horizontal" />
	{/snippet}

	{#snippet marks()}
		<Waffle unit={1} round tooltip />
	{/snippet}

	{#snippet tooltip({ context })}
		<Tooltip.Root>
			{#snippet children({ data })}
				<Tooltip.Header>{data.island}</Tooltip.Header>
				<Tooltip.List>
					{#each data.data as d (d.species)}
						<Tooltip.Item
							label={d.species}
							value={d.value}
							color={context.cScale?.(d.species)}
							format="integer"
							valueAlign="right"
						/>
					{/each}
					<Tooltip.Separator />
					<Tooltip.Item
						label="total"
						value={sum([...data.data], (d) => d.value)}
						format="integer"
						valueAlign="right"
					/>
				</Tooltip.List>
			{/snippet}
		</Tooltip.Root>
	{/snippet}
</Chart>
