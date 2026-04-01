<script lang="ts">
	import { LineChart, Chart, Area, Layer, defaultChartPadding, type ChartState } from 'layerchart';
	import { getAppleStock } from '$lib/data.remote';

	const data = $derived(await getAppleStock());
	export { data };

	let mainContext = $state<ChartState>();
</script>

<LineChart
	bind:context={mainContext}
	{data}
	x="date"
	y="value"
	yDomain={[0, null]}
	transform={{
		mode: 'domain',
		axis: 'x',
		scaleExtent: [1, 50],
		domainExtent: {
			x: { min: 'data', max: 'data', minRange: 7 * 24 * 60 * 60 * 1000 }
		}
	}}
	clip
	padding={defaultChartPadding({ left: 25, bottom: 24 })}
	height={300}
/>

<Chart
	{data}
	x="date"
	y="value"
	padding={{ left: 16 }}
	brush={{
		x: mainContext?.xDomain,
		onChange: (e) => {
			if (mainContext && e.brush.active) {
				mainContext.zoomToBrush(e.brush, 'x');
			}
		},
		onBrushEnd: (e) => {
			if (mainContext && !e.brush.active) {
				mainContext.transform.reset();
			}
		}
	}}
	height={40}
>
	<Layer>
		<Area line={{ class: 'stroke-2 stroke-primary' }} class="fill-primary/20" />
	</Layer>
</Chart>
