<script module lang="ts">
	import { getOlympians } from '$lib/data.remote';
	const olympians = await getOlympians();
</script>

<script lang="ts">
	import { scaleBand } from 'd3-scale';
	import { rollup } from 'd3-array';
	import { Field, ToggleGroup, ToggleOption } from 'svelte-ux';
	import { Chart, Tooltip, Waffle } from 'layerchart';

	export { olympians };

	let unit = $state(10);
	let round = $state(false);
	const unitOptions = [1, 2, 5, 10, 25, 50, 100];

	// Bin athletes by 5-year birth periods (1980, 1985, 1990, ...)
	const data = Array.from(
		rollup(
			olympians.filter((d) => d.date_of_birth),
			(v) => v.length,
			(d) => {
				const year = new Date(d.date_of_birth).getUTCFullYear();
				return Math.floor(year / 5) * 5;
			}
		),
		([year, count]) => ({ year, count })
	).sort((a, b) => a.year - b.year);
</script>

<div class="grid grid-cols-[auto_auto_1fr] gap-4 mb-4 screenshot-hidden">
	<Field label="Cells per unit" dense>
		<ToggleGroup bind:value={unit} variant="outline" size="sm">
			{#each unitOptions as opt (opt)}
				<ToggleOption value={opt}>{opt}</ToggleOption>
			{/each}
		</ToggleGroup>
	</Field>
	<Field label="Round" dense>
		<ToggleGroup bind:value={round} variant="outline" size="sm">
			<ToggleOption value={false}>Off</ToggleOption>
			<ToggleOption value={true}>On</ToggleOption>
		</ToggleGroup>
	</Field>
</div>

<Chart
	{data}
	x="year"
	xScale={scaleBand().paddingInner(0.15)}
	y="count"
	yDomain={[0, null]}
	yNice
	padding={{ left: 36, bottom: 24, top: 8, right: 8 }}
	height={400}
	rule
	grid
>
	{#snippet marks()}
		<Waffle fill="var(--color-info)" {unit} {round} tooltip />
	{/snippet}

	{#snippet tooltip()}
		<Tooltip.Root>
			{#snippet children({ data })}
				<Tooltip.Header>{data.year}–{data.year + 4}</Tooltip.Header>
				<Tooltip.List>
					<Tooltip.Item label="Athletes" value={data.count} format="integer" />
				</Tooltip.List>
			{/snippet}
		</Tooltip.Root>
	{/snippet}
</Chart>
