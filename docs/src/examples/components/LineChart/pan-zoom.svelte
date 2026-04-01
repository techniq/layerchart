<script lang="ts">
	import { LineChart, ChartClipPath, Spline, defaultChartPadding } from 'layerchart';
	import { getAppleStock } from '$lib/data.remote';

	const data = $derived(await getAppleStock());
	export { data };
</script>

<LineChart
	{data}
	x="date"
	y="value"
	transform={{ mode: 'domain', axis: 'x' }}
	padding={defaultChartPadding({ left: 25 })}
	height={300}
/>
