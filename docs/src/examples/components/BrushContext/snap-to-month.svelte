<script module lang="ts">
	import { getAppleStock } from '$lib/data.remote';
	const data = await getAppleStock();
</script>

<script lang="ts">
	import { Area, Axis, Chart, Layer, defaultChartPadding, type DomainType } from 'layerchart';
	import { timeMonth } from 'd3-time';

	export { data };

	let brushX = $state<DomainType>([null, null]);

	function monthLabel(value: number | string | Date | null | undefined) {
		return value instanceof Date
			? value.toLocaleDateString(undefined, { year: 'numeric', month: 'short' })
			: '';
	}
</script>

<div class="mb-2 text-sm">
	{#if brushX?.[0] != null && brushX?.[1] != null}
		Snapped:
		<span class="font-semibold">{monthLabel(brushX[0])} – {monthLabel(brushX[1])}</span>
	{:else}
		<span class="text-surface-content/50">Drag to brush — edges snap to whole months</span>
	{/if}
</div>

<Chart
	{data}
	x="date"
	y="value"
	yDomain={[0, null]}
	padding={defaultChartPadding({ left: 25, bottom: 24 })}
	brush={{
		// Snap edges to whole months. `timeMonth.ceil` can round past the last data point, but
		// `constrainToDomain` (on by default) clamps the result back inside the chart.
		constrain: ({ x, y }) => ({
			x:
				x[0] != null && x[1] != null
					? [timeMonth.floor(x[0] as Date), timeMonth.ceil(x[1] as Date)]
					: x,
			y
		}),
		x: brushX as any,
		onChange: (e) => (brushX = e.brush.x)
	}}
	height={260}
>
	<Layer>
		<Axis placement="left" grid rule />
		<Axis placement="bottom" rule />
		<Area line={{ class: 'stroke-2 stroke-primary' }} class="fill-primary/20" />
	</Layer>
</Chart>
