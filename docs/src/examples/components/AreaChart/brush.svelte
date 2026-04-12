<script module lang="ts">
	import { getAppleStock } from '$lib/data.remote';
	const data = await getAppleStock();
</script>

<script lang="ts">
	import { AreaChart, defaultChartPadding } from 'layerchart';
	export { data };
</script>

<AreaChart
	{data}
	x="date"
	y="value"
	brush
	motion={{ type: 'spring' }}
	props={{
		xAxis: { tickMultiline: true },
		canvas: {
			class: 'cursor-crosshair'
		},
		svg: {
			class: 'cursor-crosshair'
		}
	}}
	padding={defaultChartPadding({ left: 25 })}
	height={300}
/>
