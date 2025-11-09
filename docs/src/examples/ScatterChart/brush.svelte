<script lang="ts">
	import { ScatterChart } from 'layerchart';
	import { getSpiral } from '$lib/utils/data.js';

	const data = getSpiral({ angle: 137.5, radius: 10, count: 100, width: 500, height: 500 });
	export { data };
</script>

<ScatterChart
	{data}
	x="x"
	y="y"
	props={{
		points: { motion: { type: 'tween', duration: 200 } },
		xAxis: { motion: { type: 'tween', duration: 200 } },
		yAxis: { motion: { type: 'tween', duration: 200 } }
	}}
	brush
	padding={24}
	height={400}
/>
