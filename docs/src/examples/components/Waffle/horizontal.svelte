<script lang="ts">
	import { scaleBand } from 'd3-scale';
	import { Chart, Tooltip, Waffle } from 'layerchart';

	const data = [
		{ fruit: 'Apple', count: 212 },
		{ fruit: 'Banana', count: 207 },
		{ fruit: 'Cherry', count: 315 },
		{ fruit: 'Date', count: 11 }
	];
	export { data };
</script>

<Chart
	{data}
	x="count"
	xDomain={[0, null]}
	xNice
	y="fruit"
	yScale={scaleBand().paddingInner(0.15)}
	padding={{ left: 36, bottom: 24, top: 8, right: 8 }}
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
				<Tooltip.Header>{data.fruit}</Tooltip.Header>
				<Tooltip.List>
					<Tooltip.Item label="Count" value={data.count} format="integer" />
				</Tooltip.List>
			{/snippet}
		</Tooltip.Root>
	{/snippet}
</Chart>
