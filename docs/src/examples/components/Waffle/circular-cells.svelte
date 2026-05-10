<script module lang="ts">
	import { getAlphabet } from '$lib/data.remote';
	const data = await getAlphabet();
</script>

<script lang="ts">
	import { Chart, Tooltip, Waffle } from 'layerchart';

	const scaled = data
		.slice(0, 18)
		.map((d) => ({ letter: d.letter, count: Math.round(d.frequency * 500) }));
	export { data };
</script>

<Chart
	data={scaled}
	x="letter"
	bandPadding={0.2}
	y="count"
	yDomain={[0, null]}
	yNice
	padding={{ left: 32, bottom: 24, top: 8, right: 8 }}
	height={400}
	rule
	grid
>
	{#snippet marks()}
		<Waffle fill="var(--color-secondary)" rx="100%" ry="100%" gap={2} tooltip />
	{/snippet}

	{#snippet tooltip()}
		<Tooltip.Root>
			{#snippet children({ data })}
				<Tooltip.Header>{data.letter}</Tooltip.Header>
				<Tooltip.List>
					<Tooltip.Item label="Frequency" value={data.count / 500} format="percent" />
				</Tooltip.List>
			{/snippet}
		</Tooltip.Root>
	{/snippet}
</Chart>
