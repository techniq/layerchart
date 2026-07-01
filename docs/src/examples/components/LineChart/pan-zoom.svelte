<script module lang="ts">
	import { getAppleStock } from '$lib/data.remote';
	const data = await getAppleStock();
</script>

<script lang="ts">
	import { LineChart, ChartClipPath, Spline, defaultChartPadding } from 'layerchart';

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
