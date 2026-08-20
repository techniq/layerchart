<script lang="ts">
	import { range } from 'd3-array';
	import { Axis, Chart, Circle, Layer, Points, defaultChartPadding } from 'layerchart';
	import { cls } from '@layerstack/tailwind';

	const data = range(200).map((d) => {
		return { x: d, y: Math.random() };
	});
	export { data };
</script>

<Chart
	{data}
	x="x"
	y="y"
	yDomain={[0, null]}
	yNice
	padding={defaultChartPadding({ top: 20, left: 20, bottom: 24 })}
	brush={{ axis: 'both' }}
	height={400}
>
	{#snippet children({ context })}
		<Layer>
			<Axis placement="left" grid rule />
			<Axis placement="bottom" rule />

			<Points>
				{#snippet children({ points })}
					{#each points as point}
						{@const isSelected = context.brush.contains(point.data)}

						<Circle
							cx={point.x}
							cy={point.y}
							r={isSelected ? 4 : 2}
							class={cls(
								isSelected ? 'fill-primary/30 stroke-primary' : 'fill-neutral/10 stroke-neutral'
							)}
							motion="spring"
						/>
					{/each}
				{/snippet}
			</Points>
		</Layer>
	{/snippet}
</Chart>
