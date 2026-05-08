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
>
	{#snippet legend()}
		<Legend variant="swatches" placement="top-right" orientation="horizontal" />
	{/snippet}

	{#snippet marks({ context })}
		{#each context.series.visibleSeries as s (s.key)}
			<Waffle seriesKey={s.key} unit={1} round tooltip>
				{#snippet symbol({ width, height })}
					<g transform={`scale(${width / 800},${height / 800})`}>
						<!--  Penguin silhouette path (from Font Awesome — original viewBox is 800×800). -->
						<path
							d="M687.95 333.35c-27.95-17.21-50.35-28.36-67.47-34.32-4.35-26.59-7.18-56.73-7.18-92.32C613.29 92.06 517.31.08 400 .08S186.71 92.06 186.71 206.71c0 35.59-2.83 65.73-7.18 92.32-17.13 5.97-39.53 17.11-67.47 34.32C-31.92 422.66-3.92 546.64 17.41 531.98c53.75-39.26 97.78-77.75 131.07-111.95-8.52 30.16-15.09 59.94-15.09 95.95 0 88.86 45.45 167.69 117.13 213.98 2.49 15.33 5.84 32.64-1.82 40.31-8 6.67-29.99-1.33-40.66-1.33-26.66 0-49.32 31-49.32 31h213.29c1.33 0-20-31-47.99-31-10.66 0-32.66 9.33-40.66 1.33-5.63-5.63-5.32-11.38-3.77-25.96 36.71 18.48 76.35 28.96 120.41 28.96s82.74-10.23 119.15-28.31c1.49 14.42 1.71 19.77-3.83 25.31-8 6.67-29.99-1.33-40.66-1.33-26.66 0-49.32 31-49.32 31h213.29c1.33 0-20-31-47.99-31-10.66 0-32.66 9.33-40.66 1.33-7.51-7.51-4.44-23.84-1.97-39.36 72.51-46.15 118.62-125.45 118.62-214.92 0-36.01-6.57-65.79-15.09-95.95 33.29 34.2 77.32 72.69 131.07 111.95 21.33 14.66 49.32-109.31-94.65-198.63Zm-213.86-173.3c25.24 0 45.89 20.43 45.89 47.14s-20.65 47.14-45.89 47.14-45.89-20.43-45.89-47.14 20.65-47.14 45.89-47.14Zm-147.31 0c25.72 0 46.75 20.43 46.75 47.14s-21.04 47.14-46.75 47.14-46.75-20.43-46.75-47.14 21.04-47.14 46.75-47.14Z"
						/>
					</g>
				{/snippet}
			</Waffle>
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
