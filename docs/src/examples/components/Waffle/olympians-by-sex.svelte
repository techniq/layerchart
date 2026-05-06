<script module lang="ts">
	import { getOlympians } from '$lib/data.remote';
	const olympians = await getOlympians();
</script>

<script lang="ts">
	import { scaleBand } from 'd3-scale';
	import { rollup } from 'd3-array';
	import { Chart, Tooltip, Waffle } from 'layerchart';

	export { olympians };

	const data = Array.from(
		rollup(
			olympians,
			(v) => v.length,
			(d) => d.sex
		),
		([sex, count]) => ({ sex, count })
	).sort((a, b) => b.count - a.count);
</script>

<Chart
	{data}
	x="sex"
	xScale={scaleBand().paddingInner(0.2)}
	y="count"
	yDomain={[0, null]}
	yNice
	padding={{ left: 36, bottom: 24, top: 8, right: 8 }}
	height={400}
	rule
	grid
>
	{#snippet marks()}
		<Waffle fill="var(--color-primary)" unit={10} tooltip />
	{/snippet}

	{#snippet tooltip()}
		<Tooltip.Root>
			{#snippet children({ data })}
				<Tooltip.Header>{data.sex}</Tooltip.Header>
				<Tooltip.List>
					<Tooltip.Item label="Athletes" value={data.count} format="integer" />
				</Tooltip.List>
			{/snippet}
		</Tooltip.Root>
	{/snippet}
</Chart>
