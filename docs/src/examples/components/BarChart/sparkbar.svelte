<script lang="ts">
	import { BarChart } from 'layerchart';
	import { createDateSeries } from '$lib/utils/data.js';

	const data = createDateSeries({ count: 30, min: 20, max: 100 });
	export { data };
</script>

<BarChart
	{data}
	x="date"
	y="value"
	axis={false}
	grid={false}
	bandPadding={0.1}
	props={{ bars: { radius: 1, strokeWidth: 0 } }}
	height={18}
	width={124}
/>
