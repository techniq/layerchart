<script lang="ts">
	import { Axis, Chart, Highlight, Layer, Spline, Tooltip } from 'layerchart';

	const data = Array.from({ length: 90 }).map((_, i) => ({
		x: i,
		y: Math.floor(Math.random() * 90),
		y1: Math.floor(Math.random() * 90)
	}));

	const fruitColors = {
		bananas: 'var(--color-success)',
		oranges: 'var(--color-warning)'
	};

	export { data };
</script>

<Chart
	{data}
	x="x"
	y="y"
	yDomain={[0, null]}
	yNice
	padding={25}
	tooltip={{ mode: 'quadtree-x' }}
	height={300}
>
	<Layer>
		<Axis placement="left" grid rule />
		<Axis placement="bottom" rule />
		<Spline y={(d) => d.y} class="stroke-2" stroke={fruitColors.bananas} />
		<Spline y={(d) => d.y1} class="stroke-2" stroke={fruitColors.oranges} />
		<Highlight y={(d) => d.y} points={{ fill: fruitColors.bananas }} />
		<Highlight y={(d) => d.y1} points={{ fill: fruitColors.oranges }} />
		<Highlight lines />
	</Layer>

	<Tooltip.Root>
		{#snippet children({ data })}
			<Tooltip.List>
				<Tooltip.Item label="bananas" value={data.y} />
				<Tooltip.Item label="oranges" value={data.y1} />
			</Tooltip.List>
		{/snippet}
	</Tooltip.Root>
</Chart>
