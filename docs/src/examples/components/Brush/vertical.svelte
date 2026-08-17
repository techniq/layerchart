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
	import { format } from '@layerstack/utils';

	let brush = $state<BrushState>();
	const range = $derived(brush?.active ? (brush.y as [number, number]) : null);

	export { data };
</script>

<div class="text-sm text-surface-content/70 mb-2 h-5">
	{#if range}
		{format(range[0], 'decimal')} – {format(range[1], 'decimal')}
	{:else}
		Drag to select a value range
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
		<Brush bind:state={brush} axis="y" />
	</Layer>
</Chart>
