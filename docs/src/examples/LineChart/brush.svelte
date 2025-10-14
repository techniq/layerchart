<script lang="ts">
	import { getAppleStock } from '$lib/data.remote';
	import { LineChart } from 'layerchart';

	const data = $derived(await getAppleStock());
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
	height={300}
/>
