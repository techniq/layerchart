<script lang="ts">
	import { AreaChart } from 'layerchart';
	import { getAppleStock } from '$lib/data.remote';

	const data = await getAppleStock();
	export { data };
</script>

<AreaChart
	{data}
	x="date"
	y="value"
	brush
	props={{
		area: { motion: { type: 'tween', duration: 200 } },
		xAxis: { motion: { type: 'tween', duration: 200 }, tickMultiline: true },
		canvas: {
			class: 'cursor-crosshair'
		},
		svg: {
			class: 'cursor-crosshair'
		}
	}}
	height={300}
/>
