<script module lang="ts">
	import { getAlphabet } from '$lib/data.remote';
	const data = await getAlphabet();
</script>

<script lang="ts">
	import { scaleBand } from 'd3-scale';
	import { Axis, Chart, Tooltip, Waffle } from 'layerchart';

	export { data };

	// Letter frequencies are < 0.13. Multiply by 1000 to get countable cells.
	const scaled = data.map((d) => ({ letter: d.letter, count: Math.round(d.frequency * 1000) }));
</script>

<Chart
	data={scaled}
	x="letter"
	xScale={scaleBand().paddingInner(0.1)}
	y="count"
	yDomain={[0, null]}
	yNice
	padding={{ left: 32, bottom: 24, top: 8, right: 8 }}
	height={400}
	rule
	grid
>
	{#snippet marks()}
		<Waffle fill="var(--color-primary)" tooltip />
	{/snippet}

	{#snippet tooltip()}
		<Tooltip.Root>
			{#snippet children({ data })}
				<Tooltip.Header>{data.letter}</Tooltip.Header>
				<Tooltip.List>
					<Tooltip.Item label="Frequency" value={data.count / 1000} format="percent" />
				</Tooltip.List>
			{/snippet}
		</Tooltip.Root>
	{/snippet}
</Chart>
