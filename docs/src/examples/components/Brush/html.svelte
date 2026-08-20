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

	export { data };
</script>

<div class="text-sm text-surface-content/70 mb-2 h-5">
	{#if range}
		{format(range[0], PeriodType.Day)} – {format(range[1], PeriodType.Day)}
	{:else}
		Drag to select a range
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
	<Layer>
		<Axis placement="left" grid rule />
		<Axis placement="bottom" rule />
		<Area line={{ class: 'stroke-2 stroke-primary' }} class="fill-primary/20" />
	</Layer>

	<!-- The marks stay in the svg layer, with the brush in an html one above them -->
	<Layer type="html">
		<Brush bind:state={brush} />
	</Layer>
</Chart>
