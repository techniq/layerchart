<script lang="ts">
	import { range } from 'd3-array';
	import {
		Axis,
		Brush,
		Chart,
		Circle,
		Layer,
		Points,
		defaultChartPadding,
		type BrushState
	} from 'layerchart';
	import { cls } from '@layerstack/tailwind';

	const data = range(200).map((d) => ({ x: d, y: Math.random() }));

	let brush = $state<BrushState>();

	export { data };
</script>

<div class="text-sm text-surface-content/70 mb-2 h-5">
	{#if brush?.active}
		{data.filter((d) => brush!.contains(d)).length} of {data.length} points selected
	{:else}
		Drag to select points
	{/if}
</div>

<Chart
	{data}
	x="x"
	y="y"
	yDomain={[0, null]}
	yNice
	padding={defaultChartPadding({ top: 20, left: 20, bottom: 24 })}
	height={400}
>
	<Layer>
		<Axis placement="left" grid rule />
		<Axis placement="bottom" rule />

		<Points>
			{#snippet children({ points })}
				{#each points as point}
					{@const isSelected = brush?.contains(point.data) ?? false}

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

		<Brush bind:state={brush} axis="both" />
	</Layer>
</Chart>
