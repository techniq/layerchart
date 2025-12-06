<script lang="ts">
	import { LineChart, defaultChartPadding } from 'layerchart';
	import { getAppleStock } from '$lib/data.remote';

	const data = await getAppleStock();
	export { data };
</script>

<LineChart
	{data}
	x="date"
	y="value"
	brush
	props={{
		spline: { motion: { type: 'tween', duration: 200 } },
		xAxis: { motion: { type: 'tween', duration: 200 }, tickMultiline: true }
	}}
	padding={{ ...defaultChartPadding(), left: 25 }}
	height={300}
/>
