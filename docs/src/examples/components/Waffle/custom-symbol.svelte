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
					<!-- Icon from Emoji One (Monotone) by Emoji One - https://creativecommons.org/licenses/by/4.0/ -->
					<svg {width} {height} viewBox="0 0 64 64">
						<path
							fill="currentColor"
							d="M53.615 27.025c-2.098-1.303-3.775-2.14-5.063-2.59A42.5 42.5 0 0 1 48 17.467C48 8.926 40.836 2 32 2S16 8.926 16 17.467c0 2.695-.221 4.962-.553 6.969c-1.286.449-2.964 1.287-5.063 2.59C-.38 33.705 1.73 43.048 3.25 41.941c4.057-2.953 7.366-5.846 9.869-8.42C12.488 35.765 12 37.985 12 40.667c0 6.745 3.578 12.677 8.995 16.135c.197 1.171.449 3.271-.15 3.841c-.576.545-2.362-.115-3.176-.115C15.642 60.527 14 62 14 62h16.002s-1.643-1.473-3.668-1.473c-.814 0-2.602.66-3.176.115c-.447-.422-.422-1.688-.299-2.793C25.602 59.215 28.703 60 32 60s6.398-.784 9.139-2.149c.123 1.104.148 2.372-.297 2.794c-.574.545-2.361-.115-3.176-.115C35.643 60.529 34 62 34 62h16s-1.643-1.471-3.668-1.471c-.813 0-2.6.66-3.176.115c-.6-.569-.348-2.671-.15-3.842C48.422 53.344 52 47.413 52 40.667c0-2.682-.486-4.902-1.119-7.146c2.504 2.574 5.813 5.467 9.869 8.42c1.52 1.107 3.631-8.236-7.135-14.916M32 23.035l-4.488-1.095c.172-2.697 2.119-4.831 4.488-4.831c2.367 0 4.314 2.134 4.486 4.831zm3.328.218c-.453 1.65-1.766 2.856-3.328 2.856c-1.566 0-2.877-1.206-3.33-2.857l3.33.812zM32 58.066c-8.283 0-16-5.578-16-17.144c0-6.423 4-12.466 4-22.134c0-11.682 8.957-10.208 10.008-2.251c-2.051.905-3.508 3.157-3.508 5.792v.393l1.109.271c.41 2.337 2.201 4.116 4.391 4.116c2.188 0 3.979-1.779 4.387-4.115l1.113-.271v-.393c0-2.635-1.459-4.887-3.508-5.792C35.041 8.58 44 7.108 44 18.789c0 9.668 4 15.711 4 22.134c0 11.565-7.715 17.143-16 17.143"
						/>
						<ellipse cx="39" cy="16.969" fill="currentColor" rx="2" ry="3" /><path
							fill="currentColor"
							d="M24.998 13.969c-1.102 0-1.998 1.344-1.998 2.998c0 1.658.896 3.002 1.998 3.002c1.107 0 2.002-1.344 2.002-3.002c0-1.654-.895-2.998-2.002-2.998m7.975 3.574c-.145.166-.031.563.254.889c.281.325.629.455.773.289c.145-.164.031-.563-.252-.888s-.631-.456-.775-.29m-2.723.29c-.285.325-.396.724-.254.888c.146.166.492.036.777-.289c.283-.325.396-.723.254-.889c-.144-.166-.494-.035-.777.29"
						/>
					</svg>
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
