<script module lang="ts">
	import { getAppleStock } from '$lib/data.remote';
	const data = await getAppleStock();
</script>

<script lang="ts">
	import {
		Area,
		Axis,
		Chart,
		ChartClipPath,
		Layer,
		defaultChartPadding,
		type DomainType
	} from 'layerchart';

	export { data };

	const DAY = 24 * 60 * 60 * 1000;
	const maxDays = 90;

	// Live brush selection — also drives the detail chart's visible range
	let brushX = $state<DomainType>([null, null]);

	const selectedDays = $derived(
		brushX?.[0] != null && brushX?.[1] != null ? Math.round((+brushX[1] - +brushX[0]) / DAY) : null
	);
</script>

<div class="mb-2 text-sm">
	Window:
	<span class="font-semibold">{selectedDays != null ? `${selectedDays} days` : 'full range'}</span>
	<span class="text-surface-content/50">— drag the overview to brush; capped at {maxDays} days</span
	>
</div>

<!-- Detail — zooms to the (capped) brush selection -->
<Chart
	{data}
	x="date"
	y="value"
	xDomain={brushX}
	yDomain={[0, null]}
	padding={defaultChartPadding({ left: 25, bottom: 24 })}
	height={220}
>
	<Layer>
		<Axis placement="left" grid rule />
		<Axis placement="bottom" rule />
		<!-- Clip the area/line to the plot so the zoomed range doesn't overflow the axes -->
		<ChartClipPath>
			<Area line={{ class: 'stroke-2 stroke-primary' }} class="fill-primary/20" />
		</ChartClipPath>
	</Layer>
</Chart>

<!-- Overview + brush (never wider than `maxDays`) -->
<Chart
	{data}
	x="date"
	y="value"
	brush={{
		maxExtent: { x: maxDays * DAY },
		x: brushX as any,
		onChange: (e) => (brushX = e.brush.x)
	}}
	padding={defaultChartPadding({ left: 25, bottom: 24 })}
	height={60}
	class="mt-2"
>
	<Layer>
		<Axis placement="bottom" rule />
		<Area class="fill-surface-content/10" />
	</Layer>
</Chart>
