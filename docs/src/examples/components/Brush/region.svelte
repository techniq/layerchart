<script module lang="ts">
	import { getAppleStock } from '$lib/data.remote';
	const data = await getAppleStock();
</script>

<script lang="ts">
	import {
		Area,
		Axis,
		Brush,
		Chart,
		Layer,
		defaultChartPadding,
		type BrushState
	} from 'layerchart';
	import { format, PeriodType } from '@layerstack/utils';

	let brush = $state<BrushState>();
	const range = $derived(brush?.active ? (brush.x as [Date, Date]) : null);

	const LANE_HEIGHT = 32;

	export { data };
</script>

<div class="text-sm text-surface-content/70 mb-2 h-5">
	{#if range}
		{format(range[0], PeriodType.Day)} – {format(range[1], PeriodType.Day)}
	{:else}
		Drag along the lane below the chart
	{/if}
</div>

<Chart
	{data}
	x="date"
	y="value"
	yDomain={[0, null]}
	padding={defaultChartPadding({ left: 25, bottom: 24 })}
	height={300}
>
	{#snippet children({ context })}
		<Layer>
			<Axis placement="left" grid rule />
			<Axis placement="bottom" rule />
			<Area line={{ class: 'stroke-2 stroke-primary' }} class="fill-primary/20" />

			<!--
				`x`/`y`/`width`/`height` place the brushable region, which defaults to the whole plot
				area — here a scrubber lane along the bottom, leaving the chart itself free for other
				interactions.
			-->
			<Brush
				bind:state={brush}
				y={context.height - LANE_HEIGHT}
				height={LANE_HEIGHT}
				classes={{ root: 'fill-surface-content/5', selection: 'fill-primary/25' }}
			/>
		</Layer>
	{/snippet}
</Chart>
