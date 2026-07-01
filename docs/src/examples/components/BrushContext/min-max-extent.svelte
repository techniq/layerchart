<script module lang="ts">
	import { getAppleStock } from '$lib/data.remote';
	const data = await getAppleStock();
</script>

<script lang="ts">
	import { Area, Axis, Chart, Layer, defaultChartPadding, type DomainType } from 'layerchart';

	export { data };

	const DAY = 24 * 60 * 60 * 1000;
	const minDays = 30;
	const maxDays = 180;

	let brushX = $state<DomainType>([null, null]);

	const selectedDays = $derived(
		brushX?.[0] != null && brushX?.[1] != null ? Math.round((+brushX[1] - +brushX[0]) / DAY) : null
	);
</script>

<div class="mb-2 text-sm">
	Selection:
	<span class="font-semibold">{selectedDays != null ? `${selectedDays} days` : '—'}</span>
	<span class="text-surface-content/50">
		— try to drag smaller than {minDays} or larger than {maxDays} days
	</span>
</div>

<Chart
	{data}
	x="date"
	y="value"
	yDomain={[0, null]}
	padding={defaultChartPadding({ left: 25, bottom: 24 })}
	brush={{
		minExtent: { x: minDays * DAY },
		maxExtent: { x: maxDays * DAY },
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
