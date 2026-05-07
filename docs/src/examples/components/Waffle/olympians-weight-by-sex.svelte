<script module lang="ts">
	import { getOlympians } from '$lib/data.remote';
	const olympians = await getOlympians();
</script>

<script lang="ts">
	import { Chart, Tooltip, Waffle, groupStackData, Legend } from 'layerchart';
	import { rollup, sum } from 'd3-array';

	// Bin athletes by 10kg weight intervals × sex, then count per bin.
	const counted = Array.from(
		rollup(
			olympians.filter((d) => d.weight && d.sex),
			(v) => v.length,
			(d) => Math.floor(d.weight / 10) * 10,
			(d) => d.sex
		),
		([weight, bySex]) => Array.from(bySex, ([sex, value]) => ({ weight, sex, value }))
	)
		.flat()
		.sort((a, b) => a.weight - b.weight);

	const data = groupStackData(counted, { xKey: 'weight', stackBy: 'sex' });
	export { data };

	const sexOrder = ['female', 'male'] as const;
	const sexColors = ['var(--color-warning)', 'var(--color-info)'];
</script>

<Chart
	{data}
	x="weight"
	bandPadding={0.2}
	y="values"
	yDomain={[0, null]}
	yNice
	c="sex"
	cDomain={sexOrder}
	cRange={sexColors}
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
		<Waffle unit={10} tooltip />
	{/snippet}

	{#snippet tooltip({ context })}
		<Tooltip.Root>
			{#snippet children({ data })}
				<Tooltip.Header>{data.weight}–{data.weight + 9} kg</Tooltip.Header>
				<Tooltip.List>
					{#each data.data as d (d.sex)}
						<Tooltip.Item
							label={d.sex}
							value={d.value}
							color={context.cScale?.(d.sex)}
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
