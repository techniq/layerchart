<script lang="ts">
	import { AreaChart, Circle, Layer, Line } from 'layerchart';
	import { createDateSeries } from '$lib/utils/data.js';
	import { Button } from 'svelte-ux';
	import Blockquote from '$lib/markdown/components/blockquote.svelte';

	const data = createDateSeries({ count: 30, min: 50, max: 100, value: 'integer' });
	export { data };

	let markerPoints: { date: Date; value: number }[] = $state([]);
</script>

<AreaChart
	{data}
	x="date"
	y="value"
	onTooltipClick={(e, detail) => {
		if (markerPoints.includes(detail.data)) {
			markerPoints = markerPoints.filter((d) => d !== detail.data);
		} else {
			markerPoints = [...markerPoints, detail.data];
		}
	}}
	height={300}
>
	{#snippet aboveMarks({ context })}
		{#each markerPoints as p}
			<Line
				x1={context.xScale(p.date)}
				y1={context.height}
				x2={context.xScale(p.date)}
				y2={context.yScale(p.value)}
				class="stroke-surface-content/50 stroke-2 [stroke-dasharray:4,4]"
			/>
			<Circle
				cx={context.xScale(p.date)}
				cy={context.yScale(p.value)}
				r={4}
				class="fill-primary stroke-4 stroke-primary/50"
			/>
		{/each}
	{/snippet}

	{#snippet aboveContext({ context })}
		<Layer type="html">
			{#each markerPoints as p}
				<Button
					class="absolute translate-x-[-50%] text-[10px] bg-surface-100 border border-primary"
					style="top: {context.height + 2}px; left: {context.xScale(p.date)}px"
					size="sm"
					on:click={(e) => {
						e.stopPropagation();
						markerPoints = markerPoints.filter((p2) => p !== p2);
					}}
				>
					Remove
				</Button>
			{/each}
		</Layer>
	{/snippet}
</AreaChart>

<Blockquote>Click to add/remove markers</Blockquote>
