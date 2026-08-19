<script module lang="ts">
	import { getPenguins } from '$lib/data.remote';
	const penguins = await getPenguins();
</script>

<script lang="ts">
	import { BarChart, Frame, Text } from 'layerchart';
	import { flatGroup } from 'd3-array';

	// One row per species * island, with a column per sex to stack
	const data = flatGroup(
		penguins.filter((d) => d.sex !== 'NA'),
		(d) => d.species,
		(d) => d.island
	).map(([species, island, rows]) => ({
		species,
		island,
		female: rows.filter((d) => d.sex === 'female').length,
		male: rows.filter((d) => d.sex === 'male').length
	}));
	export { data };
</script>

<BarChart
	{data}
	orientation="horizontal"
	y="island"
	fy="species"
	series={[
		{ key: 'female', label: 'female', color: 'var(--color-info)' },
		{ key: 'male', label: 'male', color: 'var(--color-success)' }
	]}
	legend
	grid
	padding={{ left: 72, bottom: 40, top: 8, right: 72 }}
	height={360}
>
	{#snippet aboveMarks({ context, facet })}
		<Frame class="stroke-surface-content/20 fill-none" />
		{#if facet.fy === 'Adelie'}
			<Text
				value="While Chinstrap and Gentoo penguins were each observed on only one island, Adelie penguins were observed on all three islands."
				x={context.width - 6}
				y={6}
				width={220}
				truncate={false}
				textAnchor="end"
				verticalAnchor="start"
				class="text-[10px] fill-surface-content/70"
			/>
		{/if}
	{/snippet}
</BarChart>
